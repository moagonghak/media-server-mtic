const logger = require("../config/logger");
const UTCDate = require("../config/utc-date");


const { Mutex } = require('async-mutex');
const mutex = new Mutex();

class CacheContainer {

    constructor(name, lifeTime, updateSec) {
        this.name = name;
        this.localCahced = new Map();        // [ title, List<MediaModel> ]
        this.externalCached = new Map();     // [ title, List<MediaModel> ]

        const intLifeTime = Number.isInteger(lifeTime) ? lifeTime : parseInt(lifeTime);
        this.cacheSeconds = intLifeTime;

        const intUpdateSec = Number.isInteger(updateSec) ? updateSec : parseInt(updateSec);
        this.updateMilliSec = intUpdateSec * 1000;

        setInterval(async () => {
            await this.updateContainer();
        }, this.updateMilliSec);
    }

    addLocalCacheData(key, data) {

        if (this.localCahced.get(key) !== undefined) {
            return false;
        }

        const now = UTCDate.now();

        this.localCahced.set(key, {
            data: data,
            lastAccessed: now,
            accessCount: 0
        });

        return true;
    }

    addExternalCacheData(key, data) {

        if (this.externalCached.get(key) !== undefined) {
            return false;
        }

        const now = UTCDate.now();

        this.externalCached.set(key, {
            data: data,
            lastAccessed: now,
            cachedDate: now,
            accessCount: 0
        });

        return true;
    }

    getCachedData(key) {

        const now = UTCDate.now();

        const localCachedData = this.localCahced.get(key);
        if (localCachedData !== undefined ) {

            localCachedData.lastAccessed = now;
            localCachedData.accessCount++;
        
            return localCachedData.data;
        }

        const externalCachedData = this.externalCached.get(key);
        if (externalCachedData !== undefined ) {

            externalCachedData.lastAccessed = now;
            externalCachedData.accessCount++;
             
            return externalCachedData.data;
        }

        return null;
    }

    async updateContainer() {

        const release = await mutex.acquire();

        try {

            const externalCacheCount = this.externalCached.size;
            if (externalCacheCount > 0) {

                logger.verbose(`[container] updateContainer, [name: ${this.name}] try to save ${externalCacheCount} external data`);

                // step 1. 일단 external CacheData에 있는 것들은 db 저장
                await this.saveExternalCache();

                // step 2. external cache data를 local cache data로 이동하고 날리기

                // externalCached 에 저장된 data는 localCached에 들어갈 일이 없음.
                // 중복 검색 하지 않고 넣어도 무방
                for (const [key, externalCache] of this.externalCached.entries()) {
                    this.localCahced.set(key, externalCache);
                }
                this.externalCached.clear();
            }

            const now = UTCDate.now();
            const expire_time = now.addDuration('seconds', this.cacheSeconds);

            if (this.localCahced.size > 0) {

                logger.verbose(`[container] updateContainer, [name: ${this.name}] try to delete old cache data`);

                // step 3. localCached 에 lifetime이 지난 것들은 제거
                for (const [key, localCache] of this.localCahced.entries()) {

                    if ( expire_time.isAfter(now) ) {
                        this.localCahced.delete(key);
                    }
                }
            }

        } catch (err) {
            logger.error(`[container] updateContainer, [name: ${this.name}] has an error while updateContainer, error: ${err}`);
            throw err;
        } finally {
            release();
        }
    }

    async saveExternalCache() {
        throw new Error("saveExternalCache() must be overridden in the subclass");
    }

}

module.exports = CacheContainer;