const logger = require('../config/logger');
const dotenv = require("dotenv");
dotenv.config();

const ExternalService = require("./external-service");
const WatchProviderContainer = require("../container/watchprovider-container");
const WatchProviderDataHandler = require('../datahandler/watchprovider-datahandler');
const MediaDataHandler = require('../datahandler/media-datahandler');

const UTCDate = require('../config/utc-date');
const WatchProviderModel = require('../model/watchprovider-model');
const MediaService = require('./media-service');
const TypeValidator = require('../config/type-validator');
const { WatchProvider } = require('../config/watch-provider');

const providerContainer = new WatchProviderContainer('watchprovider', process.env.CONTAINER_CACHE_LIFETIME, process.env.CONTAINER_UPDATE_SECONDS);
const PREVIEW_UPDATE_EXPIRE_DAYS = JSON.parse(process.env.PREVIEW_UPDATE_EXPIRE_DAYS);

class WatchProviderService {

    static generateUniqueId(media_type, media_id) {
        return `${media_type}_${media_id}`;
    }

    static async getWatchProviders(media_type, media_id) {
        return new Promise(async (resolve, reject) => {
            try {

                const uniqueId = WatchProviderService.generateUniqueId(media_type, media_id);

                // step 1. search from cache
                const cachedModel = providerContainer.getCachedData(uniqueId);
                if (cachedModel !== null) {
                    resolve(cachedModel);
                    return;
                }

                // preview 영상은 Expire Term을 길게 가져간다. 다만, 갱신의 주체는 MediaService.getDetail에서 요청한 값을 그대로 사용
                const isExpired = await WatchProviderService.isExpiredWatchProviders(media_type, media_id, PREVIEW_UPDATE_EXPIRE_DAYS);
                if (isExpired === false) {

                    // step 2. search from local db
                    const localJsonList = await WatchProviderDataHandler.getProviders(media_type, media_id);
                    if (localJsonList !== null) {

                        const models = [];

                        for (const localJson of localJsonList) {
                            const model = WatchProviderModel.fromDB(localJson);
                            models.push(model);
                        }

                        providerContainer.addLocalCacheData(uniqueId, models);
                        resolve(models);

                        return;
                    }
                }


                const now = UTCDate.now();

                const allProviders = WatchProvider.getAllProviders();

                // step 3. search from external service
                const externalJson = await ExternalService.getWatchProviders(media_type, media_id);
                if (externalJson != null && externalJson.hasOwnProperty('KR')) {

                    if ( TypeValidator.isArray(externalJson['KR']['flatrate']) ) {

                        const providerJsonList = externalJson.KR.flatrate;

                        const models = [];

                        for (const providerJson of providerJsonList) {

                            // 명시적으로 제공하는 Provider 중에 있어야만 진행
                            if ( allProviders.includes(providerJson.provider_id) ) {
                                const model = WatchProviderModel.fromExternal(providerJson, media_type, media_id);
                                model.last_updated = now.dateString();
                                models.push(model);
                            }
                        }
    
                        if (models.length > 0) {
    
                            // add to cache
                            // 여기로 들어가면 시간을 봐서 한적할 때 db에 저장한다.
                            providerContainer.addExternalCacheData(uniqueId, models);
                            resolve(models);

                            return;
                        } 
                    }
                }

                logger.warn(`[getWatchProviders] getWatchProviders, media_type:${media_type}, media_id:${media_id} can't found.`);
                resolve(null);

            } catch (err) {

                logger.error(`[getWatchProviders] getWatchProviders, media_type:${media_type}, media_id:${media_id} can't found, error: ${err}`);
                reject(null);

                throw err;
            }
        });
    }

    static async isExpiredWatchProviders(media_type, media_id, days) {
        try {

            const searchHistory = await MediaDataHandler.getDetailSearchHistory(media_type, media_id);
            if ( searchHistory !== null ) {

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

        } catch ( err ) {
            throw err;
        }
    }
}


module.exports = WatchProviderService;