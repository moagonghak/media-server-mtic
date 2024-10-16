const logger = require('../config/logger');
const mysqlPool = require("../db/mysqlConfig");

class TVDataHandler {

    static async getDetail(media_id) {

        const searchSql = `
            SELECT * FROM tvseries_table
            WHERE media_id = ?
        `;

        let connection = null;

        try {

            connection = await mysqlPool.getConnection(async (conn) => conn);

            const [results] = await connection.query(searchSql, [media_id]);

            if ( results.length === 1 ) {
                return results[0];
            } 

            return null;

        } catch (err) {
            logger.error(`[TVDataHandler] getDetail, error : ${err}`);
        } finally {
            if (connection) connection.release();
        }
    }

    
    static async insertTVModels(tvModels) {

        let connection = null;

        try {

            if ( tvModels == null || tvModels.length === 0 ) {
                return false;
            }

            connection = await mysqlPool.getConnection(async (conn) => conn);

            const results = await Promise.all(tvModels.map(async tvModel => {
                await TVDataHandler.insertTVModel(tvModel, connection);
            }));

            const falseCount = results.filter(result => result === false).length;
            if ( falseCount > 0 ) {
                logger.warn(`[TVDataHandler] insertTVModels, ${falseCount} insert query is failed`);
            }

            return falseCount === 0;

        } catch (err) {
            logger.error(`[TVDataHandler], insertTVModels error : ${err}`);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    static async insertTVModel(tvModel, connection) {

        const query = `
            INSERT IGNORE INTO tvseries_table (
                media_id, adult, backdrop_path, created_by, episode_run_time, first_air_date, genres, homepage, in_production, languages, last_air_date, last_episode_to_air, name, networks, number_of_episodes, number_of_seasons, origin_country, original_language, original_name, overview, popularity, poster_path, production_companies, production_countries, seasons, spoken_languages, status, tagline, type, vote_average, vote_count, cast, crew
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?
            );
        `;

        try {
            const values = [
                tvModel.media_id, tvModel.adult, tvModel.backdrop_path, tvModel.created_by, tvModel.episode_run_time, tvModel.first_air_date, tvModel.genres, tvModel.homepage, tvModel.in_production, tvModel.languages, tvModel.last_air_date, tvModel.last_episode_to_air, tvModel.name, tvModel.networks, tvModel.number_of_episodes, tvModel.number_of_seasons, tvModel.origin_country, tvModel.original_language, tvModel.original_name, tvModel.overview, tvModel.popularity, tvModel.poster_path, tvModel.production_companies, tvModel.production_countries, tvModel.seasons, tvModel.spoken_languages, tvModel.status, tvModel.tagline, tvModel.type, tvModel.vote_average, tvModel.vote_count, tvModel.cast, tvModel.crew
            ];
           
            const [result] = await connection.query(query, values);
            return result.affectedRows === 1;

        } catch (error) {
            logger.error(`[TVDataHandler] insertTVModel, error : ${err}`);
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
}

module.exports = TVDataHandler;