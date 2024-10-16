const logger = require('../config/logger');
const mysqlPool = require("../db/mysqlConfig");
const MovieModel = require('../model/media-model');

class MediaDataHandler {

    /*
        get MediaModels from db

        @return
            mediaModels : List<JsonObject>
    */
    static async getMediaModels(title) {

        const searchSql = `
            SELECT * FROM media_table
            WHERE title LIKE CONCAT('%', ?, '%')
        `;

        let connection = null;

        try {

            connection = await mysqlPool.getConnection(async (conn) => conn);
            const [results] = await connection.query(searchSql, [title]);

            if (results.length > 0) {
                return results;
            } else {
                return null;
            }
        } catch (error) {
            logger.error(`[MediaDataHandler] getMediaModels, error : ${error}`);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    static async getMediaModel(media_type, media_id) {

        const searchSql = `
            SELECT * FROM media_table
            WHERE media_type = ? AND media_id = ?
        `;

        let connection = null;

        try {

            connection = await mysqlPool.getConnection(async (conn) => conn);
            const [results] = await connection.query(searchSql, [media_type, media_id]);

            if (results.length === 1) {
                return results[0];
            } else {
                return null;
            }
            
        } catch (error) {
            logger.error(`[MediaDataHandler] getMediaModel, error : ${error}`);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    static async insertMediaModels(models) {

        let connection = null;

        try {

            if (models == null || models.length == 0) {
                return false;
            }

            connection = await mysqlPool.getConnection(async (conn) => conn);

            const results = await Promise.all(models.map(async mediaModel => {
                await MediaDataHandler.insertMediaModel(mediaModel, connection);
            }));

            const falseCount = results.filter(result => result === false).length;
            if (falseCount > 0) {
                logger.warn(`[MediaDataHandler] insertMediaModels, ${falseCount} insert query is failed`);
            }

            return falseCount === 0;

        } catch (err) {
            logger.error(`[MediaDataHandler], insertMediaModels error : ${err}`);
            throw err;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    static async insertMediaModel(model, connection) {

        const sqlQuery = `
            INSERT INTO media_table (
                media_id, media_type, original_language, title, overview,
                popularity, poster_path, backdrop_path, vote_average, vote_count,
                release_date, adult, genre_ids
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?
            )
            ON DUPLICATE KEY UPDATE
                media_type = VALUES(media_type),
                original_language = VALUES(original_language),
                title = VALUES(title),
                overview = VALUES(overview),
                popularity = VALUES(popularity),
                poster_path = VALUES(poster_path),
                backdrop_path = VALUES(backdrop_path),
                vote_average = VALUES(vote_average),
                vote_count = VALUES(vote_count),
                release_date = VALUES(release_date),
                adult = VALUES(adult),
                genre_ids = VALUES(genre_ids);
        `;

        try {

            const values = [
                model.media_id, model.media_type, model.original_language, model.title, model.overview,
                model.popularity, model.poster_path, model.backdrop_path, model.vote_average, model.vote_count,
                model.release_date, model.adult, model.genre_ids
            ];

            const [result] = await connection.query(sqlQuery, values);
            return result.affectedRows === 1;

        } catch (err) {
            logger.error(`[MediaDataHandler], insertMedia error : ${err}`);
        }
    }

    static async getTitleSearchHistory(title) {

        const searchSql = `
            SELECT * FROM title_search_histories
            WHERE title = ?
        `;

        let connection = null;

        try {

            connection = await mysqlPool.getConnection(async (conn) => conn);
            const [results] = await connection.query(searchSql, [title]);

            if (results.length === 1) {
                return results[0];
            } else {
                return null;
            }
        } catch (error) {
            logger.error(`[MediaDataHandler] getTitleSearchHistory, error : ${error}`);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    static async updateTitleSearchHistory(title, date) {

        const sqlQuery = `
            INSERT INTO title_search_histories (
                title, last_search_date
            ) VALUES ( 
                ?, ?
            ) 
            ON DUPLICATE KEY UPDATE
                last_search_date = VALUES(last_search_date);
        `;

        let connection = null;

        try {

            connection = await mysqlPool.getConnection(async (conn) => conn);

            const [result] = await connection.query(sqlQuery, [title, date]);
            return result.affectedRows === 1;

        } catch (err) {
            logger.error(`[MediaDataHandler] updateTitleSearchHistory, title: ${title}, date: ${date}, error :${err}`);
            throw err;

        } finally {
            if (connection !== null) {
                connection.release();
            }
        }
    }

    static async getDetailSearchHistory(media_type, media_id) {
        const searchSql = `
            SELECT * FROM detail_search_histories
            WHERE media_id = ? AND media_type = ?
        `;

        let connection = null;

        try {
            connection = await mysqlPool.getConnection(async (conn) => conn);
            const [results] = await connection.query(searchSql, [media_id, media_type]);

            if (results.length === 1) {
                return results[0];
            } else {
                return null;
            }
        } catch (error) {
            logger.error(`[MediaDataHandler] getDetailSearchHistory, error : ${error}`);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    static async updateDetailSearchHistory(media_type, media_id, date) {
        const sqlQuery = `
            INSERT INTO detail_search_histories (
                media_id, media_type, last_search_date
            ) VALUES ( 
                ?, ?, ?
            ) 
            ON DUPLICATE KEY UPDATE
                last_search_date = VALUES(last_search_date);
        `;

        let connection = null;

        try {
            connection = await mysqlPool.getConnection(async (conn) => conn);
            const [result] = await connection.query(sqlQuery, [media_id, media_type, date]);
            return result.affectedRows === 1;

        } catch (err) {
            logger.error(`[MediaDataHandler] updateDetailSearchHistory, media_id: ${media_id}, media_type: ${media_type}, date: ${date}, error :${err}`);
            throw err;

        } finally {
            if (connection !== null) {
                connection.release();
            }
        }
    }

}

module.exports = MediaDataHandler;