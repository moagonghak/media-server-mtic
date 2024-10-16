const logger = require('../config/logger');
const dotenv = require("dotenv");
dotenv.config();

const MovieModel = require('../model/movie-model');
const { MediaType } = require('../model/media-model');

const MovieDataHandler = require("../datahandler/movie-datahandler");
const ExternalService = require("./external-service");
const MovieContainer = require("../container/movie-container");
const UTCDate = require('../config/utc-date');

const movieContainer = new MovieContainer('movie', process.env.CONTAINER_CACHE_LIFETIME, process.env.CONTAINER_UPDATE_SECONDS);

const DETAIL_UPDATE_EXPIRE_DAYS = parseInt(process.env.DETAIL_UPDATE_EXPIRE_DAYS);


class MovieService {

    /*
        get Movie Model
    */
    static async getDetail(media_id, forceExternal = false) {

        try {

            if (Number.isInteger(media_id) === false) {
                logger.warn(`[service] MovieService.getDetail, media_id is not type of integer`);
                return null;
            }

            // step 1. search from cache
            const cachedModel = movieContainer.getCachedData(media_id);
            if (cachedModel !== null) {
                return cachedModel;
            }

            if ( forceExternal == false ) {

                // step 2. search from local db
                const localJson = await MovieDataHandler.getDetail(media_id);
                if ( localJson !== null ) {

                    const model = MovieModel.fromDB(localJson);
                    if ( model !== null ) {
                        movieContainer.addLocalCacheData(media_id, model);
                        return model;
                    }
                }
            }

            // step 3. search from external service
            const externalJson = await ExternalService.getMediaDetail(MediaType.MOVIE, media_id);
            if (externalJson != null) {

                const model = MovieModel.fromExternal(externalJson);
                if ( model !== null ) {
                    // add to cache
                    // 여기로 들어가면 시간을 봐서 한적할 때 db에 저장한다.
                    movieContainer.addExternalCacheData(media_id, model);
                    return model;
                }
            }

            return null;

        } catch (err) {
            logger.error(`[service] MovieService.getDetail, error: ${err}`);
        }

        return null;
    }
}


module.exports = MovieService;