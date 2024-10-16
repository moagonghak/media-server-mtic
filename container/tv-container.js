const logger = require("../config/logger");

const CacheContainer = require('./cache-container');
const TVDataHandler = require('../datahandler/tv-datahandler');
const MediaDataHandler = require("../datahandler/media-datahandler");
const { MediaType } = require('../model/media-model');

class TVContainer extends CacheContainer {

    async saveExternalCache() {

        try {
            const cahceInfoList = Array.from(this.externalCached.values());
            const externalModels = cahceInfoList.map(cacheInfo => cacheInfo.data);

            await TVDataHandler.insertTVModels(externalModels);

            // Save get detail history for each key
            const searchHistoryPromises = [];
            for (const [key, cacheInfo] of this.externalCached.entries()) {
                searchHistoryPromises.push(MediaDataHandler.updateDetailSearchHistory(MediaType.TV, key, cacheInfo.cachedDate.dateString()));
            }

        } catch (err) {

            logger.error(`[TVContainer] saveExternalCache, has an error : ${err}`);
            throw err;
        }

    }
}

module.exports = TVContainer;