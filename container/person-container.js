const logger = require("../config/logger");

const CacheContainer = require('./cache-container');
const PersonDataHandler = require('../datahandler/person-datahandler');

class PersonContainer extends CacheContainer {
    
    async saveExternalCache() {
        
        try {
            const cahceInfoList = Array.from(this.externalCached.values());
            const externalModels = cahceInfoList.map(cacheInfo => cacheInfo.data);
            
            await PersonDataHandler.insertPersonModels(externalModels);

        } catch (err) {

            logger.error(`[PersonContainer] saveExternalCache, has an error : ${err}`);
            throw err;
        }
        
    }
}

module.exports = PersonContainer;