const logger = require('../config/logger');
const dotenv = require("dotenv");
dotenv.config();

const PersonModel = require('../model/person-model');

const ExternalService = require("./external-service");
const PersonContainer = require("../container/person-container");
const PersonDataHandler = require('../datahandler/person-datahandler');
const UTCDate = require('../config/utc-date');

const personContainer = new PersonContainer('person', process.env.CONTAINER_CACHE_LIFETIME, process.env.CONTAINER_UPDATE_SECONDS);
const PERSON_UPDATE_EXPIRE_DAYS = JSON.parse(process.env.PERSON_UPDATE_EXPIRE_DAYS);

class PersonService {

    static async getPersonDetail(person_id) {
        return new Promise(async (resolve, reject) => {
            try {

                // step 1. search from cache
                const cachedModel = personContainer.getCachedData(person_id);
                if (cachedModel !== null) {
                    resolve(cachedModel);
                    return;
                }

                const now = UTCDate.now();

                // step 2. search from local db
                const localJson = await PersonDataHandler.getDetail(person_id);
                if (localJson !== null) {

                    const model = PersonModel.fromDB(localJson);

                    const last_searched_date = UTCDate.fromString(model.last_updated);
                    if ( last_searched_date !== null) {
                        const expire_date = last_searched_date.addDuration('days', PERSON_UPDATE_EXPIRE_DAYS);

                        /*
                            expire_date  ------>      now       : isAfterNow() = false
                                now      ------>  expire_date   : isAfterNow() = true


                            expire_date.isAfterNow() 가 true라면 아직 만료 전임
                            external 요청하지 않고 그냥 db자료 사용
                        */
                        if ( expire_date.isAfterNow() ) {
                            personContainer.addLocalCacheData(person_id, model);
                            resolve(model);
                            return;
                        }
                    }
                }

                // step 3. search from external service

                const externalJson = await ExternalService.getPersonDetail(person_id);
                if (externalJson != null) {

                    const model = PersonModel.fromExternal(externalJson);
                    model.last_updated = now.dateString();

                    // add to cache
                    // 여기로 들어가면 시간을 봐서 한적할 때 db에 저장한다.
                    personContainer.addExternalCacheData(person_id, model);

                    resolve(model);
                    return;
                }

                logger.warn(`[PersonService] getPersonDetail, person_id:${person_id} can't found.`);
                resolve(null);

            } catch (err) {

                logger.error(`[PersonService] getPersonDetail, person_id:${person_id} can't found, error: ${err}`);
                reject(null);

                throw err;
            }
        });
    }
}


module.exports = PersonService;