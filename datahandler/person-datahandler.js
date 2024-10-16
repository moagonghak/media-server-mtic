const logger = require('../config/logger');
const mysqlPool = require("../db/mysqlConfig");

class PersonDataHandler {

    static async getDetail(person_id) {

        const searchSql = `
            SELECT * FROM person_table
            WHERE id = ?
        `;

        let connection = null;

        try {

            connection = await mysqlPool.getConnection(async (conn) => conn);

            const [results] = await connection.query(searchSql, [person_id]);

            if ( results.length === 1 ) {
                return results[0];
            } 

            return null;

        } catch (err) {
            logger.error(`[PersonDataHandler] getDetail, error : ${err}`);
        } finally {
            if (connection) connection.release();
        }
    }

    static async insertPersonModels(personModels) {

        let connection = null;

        try {

            if ( personModels == null || personModels.length == 0 ) {
                return false;
            }

            connection = await mysqlPool.getConnection(async (conn) => conn);

            const results = await Promise.all(personModels.map(async personModel => {
                await PersonDataHandler.insertPersonModel(personModel, connection);
            }));

            const falseCount = results.filter(result => result === false).length;
            if ( falseCount > 0 ) {
                logger.warn(`[PersonDataHandler] insertPersonModels, ${falseCount} insert query is failed`);
            }
            
            return falseCount === 0;

        } catch (err) {
            logger.error(`[PersonDataHandler] insertPersonModels, error : ${err}`);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    static async insertPersonModel(personModel, connection) {

        try {
            const query = `
                INSERT IGNORE INTO person_table (
                    adult, also_known_as, biography, birthday, deathday, gender, homepage, id, imdb_id, known_for_department, name, place_of_birth, popularity, profile_path, korean_name, last_updated
                ) VALUES (
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?
                );
            `;

            const values = [
                personModel.adult,
                JSON.stringify(personModel.also_known_as),
                personModel.biography,
                personModel.birthday,
                personModel.deathday,
                personModel.gender,
                personModel.homepage,
                personModel.id,
                personModel.imdb_id,
                personModel.known_for_department,
                personModel.name,
                personModel.place_of_birth,
                personModel.popularity,
                personModel.profile_path,
                personModel.korean_name,
                personModel.last_updated
            ];

            const [result] = await connection.query(query, values);
            return result.affectedRows === 1;
            
        } catch (err) {
            logger.error(`[PersonDataHandler], person_id : ${personModel.id}, insertPersonModel error : ${err}`);
            throw err;
        } 
    }
}

module.exports = PersonDataHandler;