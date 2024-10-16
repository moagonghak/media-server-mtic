const logger = require("../config/logger");

const CacheContainer = require('./cache-container');
const PreviewDataHandler = require('../datahandler/preview-datahandler');

class PreviewContainer extends CacheContainer {

  async saveExternalCache() {

    try {
      const cacheInfoList = Array.from(this.externalCached.values());
      const externalModels = cacheInfoList.flatMap(cacheInfo => cacheInfo.data);

      await PreviewDataHandler.insertPreviewModels(externalModels);

    } catch (err) {
      logger.error(`[PreviewContainer] saveExternalCache, has an error : ${err}`);
      throw err;
    }
    
  }

}

module.exports = PreviewContainer;