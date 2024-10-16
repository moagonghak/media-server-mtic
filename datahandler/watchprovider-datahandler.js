const logger = require('../config/logger');
const mysqlPool = require("../db/mysqlConfig");

class WatchProviderDataHandler {

    static async getProviders(media_type, media_id) {

        const searchSql = `
            SELECT * FROM watch_provider_table
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
            logger.error(`[WatchProviderDataHandler] getProviders, media_type:${media_type}, media_id:${media_id}, error : ${err}`);
        } finally {
            if (connection) connection.release();
        }
    }

    static async insertProviderModels(models) {

        let connection = null;

        try {

            if (models == null || models.length == 0) {
                return false;
            }

            connection = await mysqlPool.getConnection(async (conn) => conn);

            const results = await Promise.all(models.map(async previewModel => {
                await WatchProviderDataHandler.insertProvider(previewModel, connection);
            }));

            const falseCount = results.filter(result => result === false).length;
            if (falseCount > 0) {
                logger.warn(`[WatchProviderDataHandler] insertProviderModels, ${falseCount} insert query is failed`);
            }

            return falseCount === 0;

        } catch (err) {
            logger.error(`[WatchProviderDataHandler] insertProviderModels, error : ${err}`);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    static async insertProvider(model, connection) {

        const query = `
            INSERT IGNORE INTO watch_provider_table (
                media_type, media_id, provider_id, provider_name, last_updated
            ) 
            VALUES (
                ?, ?, ?, ?, ?
            )
        `;
        try {
            const values = [model.media_type, model.media_id, model.provider_id, model.provider_name, model.last_updated];

            const [result] = await connection.query(query, values);
            return result.affectedRows === 1;

        } catch (err) {
            logger.error(`[WatchProviderDataHandler] insertProvider, media_type:${model.media_type}, media_id : ${model.media_id}, provider_id: ${model.provider_id} error : ${err}`);
        }
    }
}

module.exports = WatchProviderDataHandler;