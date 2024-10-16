const logger = require("../config/logger");

const CacheContainer = require('./cache-container');
const MovieDataHandler = require('../datahandler/movie-datahandler');
const MediaDataHandler = require("../datahandler/media-datahandler");
const { MediaType } = require('../model/media-model');

class MovieContainer extends CacheContainer {

    async saveExternalCache() {

        try {
            const cahceInfoList = Array.from(this.externalCached.values());
            const externalModels = cahceInfoList.map(cacheInfo => cacheInfo.data);

            await MovieDataHandler.insertMovieModels(externalModels);


            // Save get detail history for each key
            const searchHistoryPromises = [];
            for (const [key, cacheInfo] of this.externalCached.entries()) {
                searchHistoryPromises.push(MediaDataHandler.updateDetailSearchHistory(MediaType.MOVIE, key, cacheInfo.cachedDate.dateString()));
            }

        } catch (err) {

            logger.error(`[MovieContainer] saveExternalCache, has an error : ${err}`);
            throw err;
        }

    }
}

module.exports = MovieContainer;