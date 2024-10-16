const logger = require("../config/logger");

const CacheContainer = require('./cache-container');
const WatchProviderDataHandler = require('../datahandler/watchprovider-datahandler');

class WatchProviderContainer extends CacheContainer {

  async saveExternalCache() {

    try {
      const cacheInfoList = Array.from(this.externalCached.values());
      const externalModels = cacheInfoList.flatMap(cacheInfo => cacheInfo.data);

      await WatchProviderDataHandler.insertProviderModels(externalModels);

    } catch (err) {
      logger.error(`[WatchProviderDataHandler] saveExternalCache, has an error : ${err}`);
      throw err;
    }
    
  }

}

module.exports = WatchProviderContainer;