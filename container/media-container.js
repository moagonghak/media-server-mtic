const logger = require("../config/logger");

const CacheContainer = require('./cache-container');
const MediaDataHandler = require('../datahandler/media-datahandler');

const USELESS_TITLE_COUNT = parseInt(process.env.USELESS_TITLE_COUNT || 300)
const USELESS_TITLE_GC_COUNT = parseInt(process.env.USELESS_TITLE_GC_COUNT || 100);

class MediaContainer extends CacheContainer {

  constructor(name, lifeTime, updateSec) {
    super(name, lifeTime, updateSec);
    this.modelLocalCached = new Map();
    this.modelExternalCached = new Map();
    this.uselessTitleCached = new Map();
  }

  addLocalCacheData(key, data) {

    if (super.addLocalCacheData(key, data)) {

      for (const model of data) {
        this._addMediaModel(model, false);
      }

      return true;
    }

    return true;
  }

  addExternalCacheData(key, data) {

    if (super.addExternalCacheData(key, data)) {

      for (const model of data) {
        this._addMediaModel(model, true);
      }

      return true;
    }

    return false;
  }

  async saveExternalCache() {

    try {

      for (const [key, overviewExternalCache] of this.modelExternalCached.entries()) {
        this.modelLocalCached.set(key, overviewExternalCache);
      }

      const cacheInfoList = Array.from(this.externalCached.values());
      const externalModels = cacheInfoList.flatMap(cacheInfo => cacheInfo.data);

      // save media data
      await MediaDataHandler.insertMediaModels(externalModels);

      // Save search history for each key
      const searchHistoryPromises = [];
      for (const [key, cacheInfo] of this.externalCached.entries()) {
        searchHistoryPromises.push(MediaDataHandler.updateTitleSearchHistory(key, cacheInfo.cachedDate.dateString()));
      }

    await Promise.all(searchHistoryPromises);



    } catch (err) {
      logger.error(`[MediaContainer] saveExternalCache, has an error : ${err}`);
      throw err;
    }
  }

  static generateUniqueId(media_type, media_id) {
    return `${media_type}_${media_id}`;
  }

  _addMediaModel(model, isExternal) {

    if ( model === null || model === undefined ) {
      return false;
    }

    const uniqueId = MediaContainer.generateUniqueId(model.media_type, model.media_id);

    if (isExternal) {

      if (this.modelExternalCached.get(uniqueId) !== undefined) {
        return false;
      }

      this.modelExternalCached.set(uniqueId, model);

    } else {

      if (this.modelLocalCached.get(uniqueId) !== undefined) {
        return false;
      }

      this.modelLocalCached.set(uniqueId, model);
    }

    return true;
  }

  getMediaModel(media_type, media_id) {

    const uniqueId = MediaContainer.generateUniqueId(media_type, media_id);

    let model = this.modelLocalCached.get(uniqueId);
    if (model !== undefined) {
      return model;
    }

    model = this.modelExternalCached.get(uniqueId);
    if (model !== undefined) {
      return model;
    }

    return null;
  }

  
  addUselessTitle(title) {

    if (this.uselessTitleCached.has(title)) {
      // 기존에 존재하는 title이면 value를 증가시킨다.
      let count = this.uselessTitleCached.get(title);
      this.uselessTitleCached.set(title, count + 1);
    } else {
      // 새로운 title이면 value를 1로 설정한다.
      this.uselessTitleCached.set(title, 1);
    }

    /*
      USELESS_TITLE_COUNT 갯수가  넘어가면 하위 USELESS_TITLE_GC_COUNT 개는 날림
    */
    if ( this.uselessTitleCached.size > USELESS_TITLE_COUNT ) {
      this.gcUselessTitleCache(USELESS_TITLE_GC_COUNT);
    }
  }

  isUselessTitle(title) {
    // title이 존재하면 true를 반환하고, 그렇지 않으면 false를 반환한다.
    return this.uselessTitleCached.has(title);
  }

  gcUselessTitleCache(gcCount) {
      // Map을 배열로 변환하고 value에 따라 오름차순으로 정렬
      const sortedCache = Array.from(this.uselessTitleCached.entries()).sort((a, b) => a[1] - b[1]);
      
      // 삭제하는 리스트 로그 출력
      logger.info("Removing least frequently used titles:");
      sortedCache.slice(0, gcCount).forEach(([title, count]) => {
        logger.info(`Title: ${title}, searchedCount: ${count}`);
        this.uselessTitleCached.delete(title);
      });

      logger.info("Remaining titles in cache:");
      Array.from(this.uselessTitleCached.entries()).forEach(([title, count]) => {
        logger.info(`Title: ${title}, searchedCount: ${count}`);
      });
  }
}

module.exports = MediaContainer;