const logger = require('../config/logger');
const dotenv = require("dotenv");
dotenv.config();

const PreviewModel = require('../model/preview-model');

const ExternalService = require("./external-service");
const PreviewContainer = require("../container/preview-container");
const PreviewDataHandler = require('../datahandler/preview-datahandler');
const MediaDataHandler = require('../datahandler/media-datahandler');

const UTCDate = require('../config/utc-date');

const previewContainer = new PreviewContainer('preview', process.env.CONTAINER_CACHE_LIFETIME, process.env.CONTAINER_UPDATE_SECONDS);
const PREVIEW_UPDATE_EXPIRE_DAYS = JSON.parse(process.env.PREVIEW_UPDATE_EXPIRE_DAYS);



class PreviewService {

    static generateUniqueId(media_type, media_id) {
        return `${media_type}_${media_id}`;
    }

    static async getPreviews(media_type, media_id) {
        return new Promise(async (resolve, reject) => {
            try {

                const uniqueId = PreviewService.generateUniqueId(media_type, media_id);

                // step 1. search from cache
                const cachedModel = previewContainer.getCachedData(uniqueId);
                if (cachedModel !== null) {
                resolve(cachedModel);
                    return;
                }

                // preview 영상은 Expire Term을 길게 가져간다. 다만, 갱신의 주체는 MediaService.getDetail에서 요청한 값을 그대로 사용
                const isExpired = await PreviewService.isExpiredDetail(media_type, media_id, PREVIEW_UPDATE_EXPIRE_DAYS);
                if (isExpired === false) {

                    // step 2. search from local db
                    const localJsonList = await PreviewDataHandler.getVideos(media_type, media_id);
                    if (localJsonList !== null) {

                        const models = [];

                        for (const localJson of localJsonList) {
                            const model = PreviewModel.fromDB(localJson);
                            models.push(model);
                        }

                        previewContainer.addLocalCacheData(uniqueId, models);
                        resolve(models);

                        return;
                    }
                }

                // step 3. search from external service

                const externalJsonList = await ExternalService.getPreviewVideos(media_type, media_id);
                if (externalJsonList != null) {

                    const models = [];

                    for (const externalJson of externalJsonList) {
                        const model = PreviewModel.fromExternal(externalJson, media_type, media_id);
                        models.push(model);
                    }

                    if (models.length > 0) {

                        // add to cache
                        // 여기로 들어가면 시간을 봐서 한적할 때 db에 저장한다.
                        previewContainer.addExternalCacheData(uniqueId, models);

                        resolve(models);
                    } else {
                        resolve(null);
                    }

                    return;
                }

                logger.warn(`[PreviewService] getPreviews, media_type:${media_type}, media_id:${media_id} can't found.`);
                resolve(null);

            } catch (err) {

                logger.error(`[PreviewService] getPreviews, media_type:${media_type}, media_id:${media_id} can't found, error: ${err}`);
                reject(null);

                throw err;
            }
        });
    }

    static async isExpiredDetail(media_type, media_id, days) {
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


module.exports = PreviewService;