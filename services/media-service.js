const logger = require('../config/logger');

const MediaDataHandler = require("../datahandler/media-datahandler");
const ExternalService = require('./external-service');

const { MediaModel, MediaType } = require('../model/media-model');
const TVService = require('./tv-service');
const MovieService = require('./movie-service');
const MediaContainer = require("../container/media-container");
const PersonService = require('./person-service');
const PreviewService = require('./preview-service');
const WatchProviderService = require('./watchprovider-service');
const UTCDate = require('../config/utc-date');


const TypeValidator = require('../config/type-validator');


const TitleHistoryResult = {
    SEARCHED: 0,
    TV: 1,
};


const mediaContainer = new MediaContainer('media', process.env.CONTAINER_CACHE_LIFETIME, process.env.CONTAINER_UPDATE_SECONDS);
const DETAIL_UPDATE_EXPIRE_DAYS = JSON.parse(process.env.DETAIL_UPDATE_EXPIRE_DAYS);
const TITLE_UPDATE_EXPIRE_DAYS = JSON.parse(process.env.TITLE_UPDATE_EXPIRE_DAYS);


class MediaService {

    /*
        get MediaModels

        step 1. search from cache
        step 2. search from local db
        step 3. search from external service
    */

    static async getMediaModels(title) {
        try {

            if ( false == TypeValidator.isString(title) ) {
                logger.warn(`[MediaService] getMediaModels, ${title} is not string type`);
                return null;
            }

            /*
                이미 검색해서 답 없었던 title이면 아예 검색 안함
            */
            if ( mediaContainer.isUselessTitle(title) ) {
                return null;
            }

            // step 1. search from cache
            const cachedModels = mediaContainer.getCachedData(title);
            if (cachedModels !== null) {
                return cachedModels;
            }

            // step 2. check last searched date
            const isExpired = await MediaService.isExpiredTitle(title, TITLE_UPDATE_EXPIRE_DAYS);
            if (isExpired === false) {

                const models = await MediaService.getFromDB(title);
                if (models !== null) {
                    /*
                        title과 완벽하게 매칭되는 model이 존재 한다면 db에서 찾고 끝내면 된다.
                        완벽하게 매칭하지 않는다면 db에서 찾더라도 다시 tmdb에 요청 해야 함.


                    */
                    mediaContainer.addLocalCacheData(title, models);
                    return models;
                }
            }

            // step 3. search from external service
            const models = await MediaService.getFromExternal(title);
            if (models !== null) {

                // add to cache
                // 여기로 들어가면 시간을 봐서 한적할 때 db에 저장한다.
                mediaContainer.addExternalCacheData(title, models);

                return models;
            } 

            mediaContainer.addUselessTitle(title);
            logger.info(`[MediaService] getMediaModels, not matched media with title: ${title}`);


        } catch (err) {
            logger.error(`[MediaService] getMediaModels, title:${title}, error: ${err}`);
        }

        return null;
    }

    
    static async getMediaModelsWithYear(title, release_year) {

        try {
            const search_year = parseInt(release_year);

            const models = await MediaService.getMediaModels(title);
            let filtered_models = [];
            let matched_count = 0;
    
            for (let i = 0; i < models.length; ++i) {
                const model = models[i];

                const release_date = UTCDate.fromString(model.release_date);
                if ( release_date === null ) {
                    continue;
                }

                if ( release_date.getYear() == search_year ) {
                    filtered_models.push(model);

                    if ( model.title === title ) {
                        matched_count++;
                    }
                }
            }

            if ( matched_count <= 2 ) {
                
                const externalModels = await MediaService.getFromExternalWithYear(title, search_year);
                if (externalModels !== null) {

                    // 여기서 찾은 영화들은 바로 db에 update 쳐버린다.
                    filtered_models = filtered_models.concat(externalModels);
                    MediaDataHandler.insertMediaModels(externalModels);
                    
                }
            }
    
            return filtered_models;

        } catch (err) {
            logger.error(`[MediaService] getMediaModelsWithYear, title:${title}, release_year:${release_year}, error: ${err}`);
        }
    
        return null;
    }

    static async isExpiredTitle(title, days) {
        try {

            const searchHistory = await MediaDataHandler.getTitleSearchHistory(title);
            if (searchHistory !== null) {

                const last_searched_date = UTCDate.fromString(searchHistory.last_search_date);
                if ( last_searched_date === null ) {
                    return true;
                }

                const expire_date = last_searched_date.addDuration('days', days);

                // 검색 전력이 있고 현재 시점이 expire_date 전이라면 만료가 아님
                if (UTCDate.now().isBefore(expire_date)) {
                    return false;
                }
            }

            // 검색한 적 없으면 무조건 만료된걸로 간주. 새로 검색 필요
            return true;

        } catch (err) {
            logger.error(`[MediaService] isExpiredTitle, title:${title}, error: ${err}`);
        }

        return true;
    }

    static async isExpiredDetail(media_type, media_id, days) {
        try {

            const searchHistory = await MediaDataHandler.getDetailSearchHistory(media_type, media_id);
            if (searchHistory !== null) {

                const last_searched_date = UTCDate.fromString(searchHistory.last_search_date);
                if ( last_searched_date === null ) {
                    return true;
                }
                
                const expire_date = last_searched_date.addDuration('days', days);

                if (UTCDate.now().isAfter(expire_date)) {
                    return true;
                }
            }

            return false;

        } catch (err) {
            logger.error(`[MediaService] isExpiredDetail, media_type:${media_type}, media_id:${media_id}, days:${days}`);
        }

        return null;
    }

    static async getFromDB(title) {
        try {

            if (TypeValidator.isString(title) === false) {
                logger.error(`[MediaService] getFromDB, title:${title} is not string type`);
                return null;
            }

            const localJsonList = await MediaDataHandler.getMediaModels(title);
            if (localJsonList !== null) {

                const models = [];

                for (const localJson of localJsonList) {
                    const model = MediaModel.fromDB(localJson);
                    models.push(model);
                }

                return models.length > 0 ? models : null;
            }

            return null;

        } catch (err) {
            logger.error(`[MediaService] getFromDB, title:${title}, error: ${err}`);
        }

        return null;
    }

    static async getFromExternal(title) {

        try {

            if (TypeValidator.isString(title) === false) {
                logger.error(`[MediaService] getFromExternal, title:${title} is not string type`);
                return null;
            }

            const promiseMovies = ExternalService.searchTitle(title, MediaType.MOVIE);
            const promiseTVs = ExternalService.searchTitle(title, MediaType.TV);

            const [movieObjects, tvObjects] = await Promise.all([promiseMovies, promiseTVs]);

            const movieModels = movieObjects.map(result => MediaModel.fromExternalMovie(result));
            const tvModels = tvObjects.map(result => MediaModel.fromExternalTV(result));

            const externalModels = [...movieModels, ...tvModels];

            if (externalModels.length > 0) {
                return externalModels;
            }

            return null;
        } catch (err) {
            logger.error(`[MediaService] getFromExternal, title:${title}, error: ${err}`);
        }

        return null;
    }

    static async getFromExternalWithYear(title, year) {

        try {

            if (TypeValidator.isString(title) === false) {
                logger.error(`[MediaService] getFromExternalWithYear, title:${title} is not string type`);
                return null;
            }

            if (TypeValidator.isNumber(year) === false) {
                logger.error(`[MediaService] getFromExternalWithYear, year:${year} is not number type`);
                return null;
            }

            const promiseMovies = ExternalService.searchTitleWithYear(title, MediaType.MOVIE, year);
            const promiseTVs = ExternalService.searchTitleWithYear(title, MediaType.TV, year);

            const [movieObjects, tvObjects] = await Promise.all([promiseMovies, promiseTVs]);

            const movieModels = movieObjects.map(result => MediaModel.fromExternalMovie(result));
            const tvModels = tvObjects.map(result => MediaModel.fromExternalTV(result));

            const externalModels = [...movieModels, ...tvModels];

            if (externalModels.length > 0) {
                return externalModels;
            }

            return null;
        } catch (err) {
            logger.error(`[MediaService] getFromExternal, title:${title}, error: ${err}`);
        }

        return null;
    }

    static async getMediaModelFromDB(media_type, media_id) {

        try {

            const localJson = await MediaDataHandler.getMediaModel(media_type, media_id);
            if ( localJson !== null ) {
                return MediaModel.fromDB(localJson);
            }

            return null;

        } catch (err) {
            logger.error($`[MediaService] getMediaModelFromDB, media_type: ${media_type}, media_id: ${media_id}, error : ${err}`)
        }

        return null;
    }

    static async getMediaModel(media_type, media_id) {

        try {

            const mediaId = parseInt(media_id, 10);
            const mediaType = parseInt(media_type, 10);

            if (Number.isInteger(mediaId) === false) {
                logger.warn(`[MediaService] MediaService.getMediaModel, media_id is not type of integer`);
                return null;
            }

            // step 1. search from cache
            const cachedModel = mediaContainer.getMediaModel(mediaType, mediaId);
            if (cachedModel !== null) {
                return cachedModel;
            }

            // step 2. search from db
            const dbModel = await MediaService.getMediaModelFromDB(mediaType, mediaId);
            if (dbModel !== null) {

                // save and clear 로직은 기존 mediaContainer가 title 기반으로 되어 있으니 이를 그대로 이행하기 위해
                // _addOverview 호출은 절대로 금함.
                mediaContainer.addLocalCacheData(dbModel.title, [dbModel]);
                return dbModel;
            }

            // step 3. search from external service

            let detailModel = null;
            let mediaModel = null;

            if (MediaModel.isMovie(mediaType)) {
                detailModel = await MovieService.getDetail(mediaId, false);
                mediaModel = MediaModel.fromMovieDetail(detailModel);

            } else if (MediaModel.isTVSeries(mediaType)) {
                detailModel = await TVService.getDetail(mediaId, false);
                mediaModel = MediaModel.fromTVDetail(detailModel);
            }

            if ( mediaModel !== null ) {
                mediaContainer.addExternalCacheData(mediaModel.title, [mediaModel]);
            }

            return mediaModel;

        } catch (err) {
            logger.error(`[MediaService] getMediaModel, media_type: ${media_type}, media_id: ${media_id}, error : ${err}`)
        }

        return null;
    }

    /*
        get getMediaDetail

        step 1. search from cache
        step 2. search from local db
        step 3. search from external service
    */
    static async getMediaDetail(media_type, media_id) {

        try {

            const mediaId = parseInt(media_id, 10);
            const mediaType = parseInt(media_type, 10);

            if (Number.isInteger(mediaId) === false) {
                logger.warn(`[MediaService] MediaService.getMediaDetail, media_id is not type of integer`);
                return null;
            }

            const isExpired = await MediaService.isExpiredDetail(mediaType, mediaId, DETAIL_UPDATE_EXPIRE_DAYS);

            let model = null;
            if (MediaModel.isMovie(mediaType)) {
                model = await MovieService.getDetail(mediaId, isExpired);
            } else if (MediaModel.isTVSeries(mediaType)) {
                model = await TVService.getDetail(mediaId, isExpired);
            }

            if (model !== null) {

                const { cast, crew } = model;

                // Extract the 'id' property from cast and crew items
                const castIds = cast.length > 0 ? JSON.parse(cast).map(item => item.id) : null;
                const crewIds = crew.length > 0 ? JSON.parse(crew).map(item => item.id) : null;

                try {

                    const castModelsPromise = castIds != null ? Promise.all(
                        castIds.map(person_id => PersonService.getPersonDetail(person_id))
                    ) : null;

                    const crewModelsPromise = crewIds != null ? Promise.all(
                        crewIds.map(person_id => PersonService.getPersonDetail(person_id))
                    ) : null;

                    const previewsPromise = PreviewService.getPreviews(mediaType, mediaId);
                    const providerPromise = WatchProviderService.getWatchProviders(mediaType, mediaId); 

                    const [castModels, crewModels, previewwModels, providerModels] = await Promise.all([
                        castModelsPromise,
                        crewModelsPromise,
                        previewsPromise,
                        providerPromise
                    ]);

                    return {
                        model,
                        castModels,
                        crewModels,
                        previewwModels,
                        providerModels
                    };

                } catch (err) {
                    logger.warn(`[MediaService] getMediaDetail, failed to get person detail - media_type: ${mediaType}, media_id: ${mediaId}, error: ${err}`);
                }
            } else {
                logger.warn(`[MediaService] getMediaDetail, failed to get person detail - media_type: ${mediaType}, media_id: ${mediaId}`);
            }

            return null;

        } catch (err) {
            logger.error(`[MediaService] MediaService.getMediaDetail, media_type: ${media_type}, media_id: ${media_id}, error : ${err}`)
        }

        return null;
    }
}

module.exports = MediaService;