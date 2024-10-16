const logger = require('../config/logger');
const mysqlPool = require("../db/mysqlConfig");
const MovieModel = require('../model/movie-model');

class PreviewDataHandler {

    static async getVideos(media_type, media_id) {

        const searchSql = `
            SELECT * FROM preview_table
            WHERE media_type = ? AND media_id = ?
        `;


        let connection = null;

        try {

            connection = await mysqlPool.getConnection(async (conn) => conn);

            const [results] = await connection.query(searchSql, [media_type, media_id]);

            if (results.length > 0) {
                return results;
            }

            return null;

        } catch (err) {
            logger.error(`[PreviewDataHandler] getVideos, error : ${err}`);
        } finally {
            if (connection) connection.release();
        }
    }

    static async insertPreviewModels(models) {

        let connection = null;

        try {

            if (models == null || models.length == 0) {
                return false;
            }

            connection = await mysqlPool.getConnection(async (conn) => conn);

            const results = await Promise.all(models.map(async previewModel => {
                await PreviewDataHandler.insertPreviewModel(previewModel, connection);
            }));

            const falseCount = results.filter(result => result === false).length;
            if (falseCount > 0) {
                logger.warn(`[PreviewDataHandler] insertPreviewModels, ${falseCount} insert query is failed`);
            }

            return falseCount === 0;

        } catch (err) {
            logger.error(`[PreviewDataHandler] insertPreviewModels, insertPreviewModels error : ${err}`);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    static async insertPreviewModel(model, connection) {

        const query = `
            INSERT INTO preview_table (
                id, media_type, media_id, iso_639_1, iso_3166_1, name, video_key,
                site, size, type, official, published_at
                ) 
            VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?
            )
            ON DUPLICATE KEY UPDATE 
                video_key = VALUES(video_key);
        `;
        try {
            const values = [
                model.id, model.media_type, model.media_id, model.iso_639_1, model.iso_3166_1, model.name, model.video_key,
                model.site, model.size, model.type, model.official, model.published_at
            ];

            const [result] = await connection.query(query, values);
            return result.affectedRows === 1;

        } catch (err) {
            logger.error(`[PreviewDataHandler] insertPreviewModel, media_type:${model.media_type}, media_id : ${model.media_id}, video_id: ${model.id} insertPreviewModel error : ${err}`);
        }
    }
}

module.exports = PreviewDataHandler;