const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const dotenv = require("dotenv");
dotenv.config();

const logger = require('../config/logger');
const { MediaModel, MediaType } = require('../model/media-model');
const { Provider, WatchProvider } = require('../config/watch-provider');
const UTCDate = require('../config/utc-date');

const tmdb_api_key = process.env.TMDB_API_KEY;

function getExternalPath(media_type) {

    if ( MediaModel.isMovie(media_type) ) return 'movie';
    else if ( MediaModel.isTVSeries(media_type) ) return 'tv';

    return null;
}

function getAllWatchProviderPath() {
    const providerParam = WatchProvider.getAllProviderParms();
    return `with_watch_providers=${providerParam}`;
}

class ExternalService {

    /*
        get MediaModels using tmdb api
    */
    static async searchTitle(title, media_type) {
        return new Promise(async (resolve, reject) => {

            const url_path = getExternalPath(media_type);
            if ( url_path === null ) {
                logger.warn(`[ExternalService] searchTitle, title:${title}, media_type:${media_type} is invalid`);
                reject(null);
                return;
            }
    
            const url = `https://api.themoviedb.org/3/search/${url_path}?api_key=${tmdb_api_key}&language=ko-KR&query=${encodeURIComponent(title)}&page=1`;

            try {

                const response = await axios.get(url, { validateStatus:false } );

                if ( response.status == axios.HttpStatusCode.Ok ) {
                    resolve(response.data.results);
                } else {
                    resolve(null);
                }

            } catch (error) {

                logger.warn(`[ExternalService] searchMediaModels, can't found anything from tmdb, title:${title}, error:${error}`);
                reject(null);
            }
        });
    }

    static async searchTitleWithYear(title, media_type, year) {
        return new Promise(async (resolve, reject) => {

            const url_path = getExternalPath(media_type);
            if ( url_path === null ) {
                logger.warn(`[ExternalService] searchTitleWithYear, title:${title}, media_type:${media_type}, year:${year} is invalid`);
                reject(null);
                return;
            }
    
            const url = `https://api.themoviedb.org/3/search/${url_path}?api_key=${tmdb_api_key}&language=ko-KR&query=${encodeURIComponent(title)}&page=1&year=${year}`;

            try {

                const response = await axios.get(url, { validateStatus:false } );

                if ( response.status == axios.HttpStatusCode.Ok ) {
                    resolve(response.data.results);
                } else {
                    resolve(null);
                }

            } catch (error) {

                logger.warn(`[ExternalService] searchTitleWithYear, can't found anything from tmdb, title:${title}, year:${year}, error:${error}`);
                reject(null);
            }
        });
    }

    static async getMediaDetail(media_type, media_id) {
        return new Promise(async (resolve, reject) => {

            const url_path = getExternalPath(media_type);
            if ( url_path === null ) {
                logger.warn(`[ExternalService] getMediaDetail, media_type:${media_type} is invalid`);
                reject(null);
                return;
            }

            const url = `https://api.themoviedb.org/3/${url_path}/${media_id}?api_key=${tmdb_api_key}&language=ko-KR`;

            const castCount = 10;
            const crewCount = 3;

            try {

                const responsePromise = axios.get(url, { validateStatus:false } );
                const creditsPromise = ExternalService.getMediaCredits(media_type, media_id, castCount, crewCount);

                const [ response, credits ] = await Promise.all([responsePromise, creditsPromise]);

                if ( response.status === axios.HttpStatusCode.Ok) {
                    const detailJson = {
                        ...response.data,
                        cast: credits != null ? credits.cast : null,
                        crew: credits != null ? credits.crew : null
                    };
    
                    resolve( detailJson );
                } else {
                    resolve(null);
                }

            } catch ( error ) {

                logger.warn(`[ExternalService] getMediaDetail, media_type: ${media_type}, media_id: ${media_id}, error: ${error}`);
                reject(null);
            }
        });
    }

    static async getMediaCredits(media_type, media_id, cast_count, crew_count) {
        return new Promise(async (resolve, reject) => {

            const url_path = getExternalPath(media_type);
            if ( url_path === null ) {
                logger.warn(`[service] getMediaCredits, media_type: ${media_type}, media_id: ${media_id} invalid media type`);
                reject(null);
                return;
            }

            const url = `https://api.themoviedb.org/3/${url_path}/${media_id}/credits?api_key=${tmdb_api_key}&language=ko-KR`;

            try {

                const response = await axios.get(url, { validateStatus :false } );
                if ( response.status === axios.HttpStatusCode.Ok) {

                    const credits = response.data;

                    const cast = credits.cast.slice(0, cast_count).map(actor => ({
                        id: actor.id,
                        name: actor.name,
                        character: actor.character,
                        profile_path: actor.profile_path
                    }));
    
                    const crew = response.data.crew
                        .filter(member => (member.job === 'Director' || member.job === 'Writer'))
                        .slice(0, crew_count)
                        .map(director => ({
                            id: director.id,
                            name: director.name,
                            job: director.job,
                            profile_path: director.profile_path
                        }));
    
                    resolve( { cast, crew });                    
                } else {
                    logger.warn(`[ExternalService] getMediaCredits, failed to fetch from tmdb`);
                    resolve(null);
                }

            } catch (error) {
                logger.warn(`[ExternalService] getMediaCredits, can't found anything from tmdb, media_type:${media_type}, media_id:${media_id}, cast_count:${cast_count}, crew_count:${crew_count}, ${error}`);
                reject(null);
            }
        });
    }

    static async getPersonDetail(person_id) {
        return new Promise(async (resolve, reject) => {

            const url = `https://api.themoviedb.org/3/person/${person_id}?api_key=${tmdb_api_key}&language=ko-KR`;

            try {

                const response = await axios.get(url, { validateStatus:false } );
                if ( response.status === axios.HttpStatusCode.Ok ) {
                    resolve(response.data);    
                } else {
                    logger.warn(`[ExternalService] getPersonDetail, failed to fetch from tmdb`);
                    resolve(null);
                }
                
            } catch (error) {

                logger.warn(`[ExternalService] getPersonDetail, can't found anything from tmdb, person_id:${person_id}, error:${error}`);
                reject(null);
            }
        });
    }

    static async getPreviewVideos(media_type, media_id) {
        return new Promise(async (resolve, reject) => {

            const url_path = getExternalPath(media_type);
            if ( url_path === null ) {
                logger.warn(`[ExternalService] getPreviewVideos, media_type:${media_type} is invalid`);
                reject(null);
                return;
            }

            const url = `https://api.themoviedb.org/3/${url_path}/${media_id}/videos?api_key=${tmdb_api_key}&language=ko-KR`;

            try {

                const response = await axios.get(url, { validateStatus:false } );

                if ( response.status === axios.HttpStatusCode.Ok ) {

                    resolve(response.data.results);
                    return;
                } else {
                    logger.warn(`[ExternalService] getPreviewVideos, media_type:${media_type}, media_id:${media_id} failed to fetch from tmdb`);
                    resolve(null);
                }
                
            } catch (error) {

                logger.warn(`[ExternalService] getPreviewVideos, can't found anything from tmdb, media_type:${media_type}, media_id:${media_id}, error:${error}`);
                reject(null);
            }
        });
    }

    static async getWatchProviders(media_type, media_id) {
        return new Promise(async (resolve, reject) => {

            const url_path = getExternalPath(media_type);
            if ( url_path === null ) {
                logger.warn(`[ExternalService] getPreviewVideos, media_type:${media_type} is invalid`);
                reject(null);
                return;
            }

            const url = `https://api.themoviedb.org/3/${url_path}/${media_id}/watch/providers?api_key=${tmdb_api_key}`;

            try {

                const response = await axios.get(url, { validateStatus:false } );

                if ( response.status === axios.HttpStatusCode.Ok ) {

                    resolve(response.data.results);
                    return;
                } else {
                    logger.warn(`[ExternalService] getWatchProviders, media_type:${media_type}, media_id:${media_id} failed to fetch from tmdb`);
                    resolve(null);
                }
                
            } catch (error) {
                logger.warn(`[ExternalService] getWatchProviders, can't found anything from tmdb, media_type:${media_type}, media_id:${media_id}, error:${error}`);
                reject(null);
            }
        });
    }

    static async getPopularMovies() {
        return new Promise(async (resolve, reject) => {

            let url = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdb_api_key}&region=KR&language=ko-KR&page=1`;

            try {
                const response = await axios.get(url);

                if ( response.status === axios.HttpStatusCode.Ok ) {
                    resolve(response.data.results);
                    return;
                }

                logger.warn(`[ExternalService] getPopularMovies, failed to fetch from tmdb`);
                reject(null);

            } catch (error) {
                logger.error(`[ExternalService] getPopularMovies, error:${error}`);
                reject(null);
            }
        });
    }

    static getUpcomingMovies() {
        return new Promise(async (resolve, reject) => {

            let url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${tmdb_api_key}&region=KR&language=ko-KR&page=1`;

            try {
                const response = await axios.get(url);

                if ( response.status === axios.HttpStatusCode.Ok ) {
                    resolve(response.data.results);
                    return;
                }

                logger.warn(`[ExternalService] getUpcomingMovies, failed to fetch from tmdb`);
                reject(null);

            } catch (error) {
                logger.error(`[ExternalService] getUpcomingMovies, error:${error}`);
                reject(null);
            }
        });
    }

    static getOnAirMovies() {
        return new Promise(async (resolve, reject) => {

            let url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${tmdb_api_key}&region=KR&language=ko-KR&page=1`;

            try {
                const response = await axios.get(url);

                if ( response.status === axios.HttpStatusCode.Ok ) {
                    resolve(response.data.results);
                    return;
                }

                logger.warn(`[ExternalService] getOnAirMovies, failed to fetch from tmdb`);
                reject(null);

            } catch (error) {
                logger.error(`[ExternalService] getOnAirMovies, error:${error}`);
                reject(null);
            }
        });
    }
    
    static async getPopularTVSeires() {
        return new Promise(async (resolve, reject) => {

            const providerParam = WatchProvider.getAllProviderParms();
            let url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=ko-KR&page=1&sort_by=popularity.desc&api_key=${tmdb_api_key}&watch_region=KR&with_watch_providers=${providerParam}`;

            try {
                const response = await axios.get(url);

                if ( response.status === axios.HttpStatusCode.Ok ) {
                    resolve(response.data.results);
                    return;
                }

                logger.warn(`[ExternalService] getPopularTVSeires, failed to fetch from tmdb`);
                reject(null);

            } catch (error) {
                logger.error(`[ExternalService] getPopularTVSeires, error:${error}`);
                reject(null);
            }
        });
    }

    static async getUpcomingTVSeires() {
        return new Promise(async (resolve, reject) => {

            const now = UTCDate.now();
            const air_date_from = now.format("YYYY-MM-DD");
            const air_date_to = now.addDuration('days', 7).format("YYYY-MM-DD");

            const providerParam = WatchProvider.getAllProviderParms();
            let url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=ko-KR&page=1&sort_by=popularity.desc&air_date.lte=${air_date_to}&air_date.gte=${air_date_from}&api_key=${tmdb_api_key}&timezone=Asia/Seoul&watch_region=KR&with_watch_providers=${providerParam}`;

            try {
                const response = await axios.get(url);

                if ( response.status === axios.HttpStatusCode.Ok ) {
                    resolve(response.data.results);
                    return;
                }

                logger.warn(`[ExternalService] getUpcomingTVSeires, media_type:${media_type}, failed to fetch from tmdb`);
                reject(null);

            } catch (error) {
                logger.error(`[ExternalService] getUpcomingTVSeires, error:${error}`);
                reject(null);
            }
        });
    }

    static async getOnAirTVSeires() {
        return new Promise(async (resolve, reject) => {

            const now = UTCDate.now();
            const air_date_now = now.format("YYYY-MM-DD");

            const providerParam = WatchProvider.getAllProviderParms();
            let url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=ko-KR&page=1&sort_by=popularity.desc&air_date.lte=${air_date_now}&air_date.gte=${air_date_now}&api_key=${tmdb_api_key}&timezone=Asia/Seoul&watch_region=KR&with_watch_providers=${providerParam}`;
          

            try {
                const response = await axios.get(url);

                if ( response.status === axios.HttpStatusCode.Ok ) {
                    resolve(response.data.results);
                    return;
                }

                logger.warn(`[ExternalService] getOnAirTVSeires, failed to fetch from tmdb`);
                reject(null);

            } catch (error) {
                logger.error(`[ExternalService] getOnAirTVSeires, error:${error}`);
                reject(null);
            }
        });
    }
}

module.exports = ExternalService;