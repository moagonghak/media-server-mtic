const axios = require('axios');
const dotenv = require("dotenv");
dotenv.config();


const logger = require('../config/logger');

const { MediaType } = require('../model/media-model');
const TVModel = require('../model/tv-model');
const TVDataHandler = require("../datahandler/tv-datahandler");
const ExternalService = require("./external-service");
const TVContainer = require("../container/tv-container");
const UTCDate = require('../config/utc-date');

const tvContainer = new TVContainer('tv', process.env.CONTAINER_CACHE_LIFETIME, process.env.CONTAINER_UPDATE_SECONDS);
const DETAIL_UPDATE_EXPIRE_DAYS = parseInt(process.env.DETAIL_UPDATE_EXPIRE_DAYS);


class TVService {

    static async getDetail(media_id, forceExternal = false) {

        try {

            if (Number.isInteger(media_id) === false) {
                logger.warn(`[service] TVService.getDetail, media_id is not type of integer`);
                return null;
            }

            // step 1. search from cache
            const cachedModel = tvContainer.getCachedData(media_id);
            if (cachedModel !== null) {
                return cachedModel;
            }

            if ( forceExternal == false ) {

                // step 2. search from local db
                const localJson = await TVDataHandler.getDetail(media_id);
                if ( localJson !== null ) {

                    const model = TVModel.fromDB(localJson);

                    if ( model !== null ) {
                        tvContainer.addLocalCacheData(media_id, model);
                        return model;
                    }
                }
            }

            // step 3. search from external service
            const externalJson = await ExternalService.getMediaDetail(MediaType.TV, media_id);
            if (externalJson != null) {

                const model = TVModel.fromExternal(externalJson);
                if ( model !== null ) {
                    // add to cache
                    // 여기로 들어가면 시간을 봐서 한적할 때 db에 저장한다.
                    tvContainer.addExternalCacheData(media_id, model);

                    return model;
                }
            }

            return null;

        } catch (err) {
            logger.error(`[service] TVService.getDetail, error: ${err}`);
        }

        return null;
    }
}


module.exports = TVService;