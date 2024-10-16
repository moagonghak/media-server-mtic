const logger = require('../config/logger');
const mysqlPool = require("../db/mysqlConfig");
const MovieModel = require('../model/movie-model');

class MovieDataHandler {

    static async getDetail(media_id) {

        const searchSql = `
            SELECT * FROM movie_table
            WHERE media_id = ?
        `;

        let connection = null;

        try {

            connection = await mysqlPool.getConnection(async (conn) => conn);

            const [results] = await connection.query(searchSql, [media_id]);

            if (results.length === 1) {
                return results[0];
            }

            return null;

        } catch (err) {
            logger.error(`[MovieDataHandler] getDetail, error : ${err}`);
        } finally {
            if (connection) connection.release();
        }
    }

    static async insertMovieModels(movieModels) {

        let connection = null;

        try {

            if (movieModels == null || movieModels.length == 0) {
                return false;
            }

            connection = await mysqlPool.getConnection(async (conn) => conn);

            const results = await Promise.all(movieModels.map(async movieModel => {
                await MovieDataHandler.insertMovieModel(movieModel, connection);
            }));

            const falseCount = results.filter(result => result === false).length;
            if (falseCount > 0) {
                logger.warn(`[MovieDataHandler] insertMediaModels, ${falseCount} insert query is failed`);
            }

            return falseCount === 0;

        } catch (err) {
            logger.error(`[MovieDataHandler], insertMovies error : ${err}`);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    static async insertMovieModel(movieModel, connection) {

        try {
            const query = `
            INSERT INTO movie_table (
                media_id, title, original_title, original_language, release_date, overview,
                popularity, poster_path, backdrop_path, runtime, status, tagline, genres,
                production_companies, production_countries, spoken_languages,
                cast, crew,
                adult, video, vote_average, vote_count, belongs_to_collection
            ) 
            VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, 
                ?, ?,
                ?, ?, ?, ?, ?
            ) 
            ON DUPLICATE KEY UPDATE 
                overview = VALUES(overview),
                popularity = VALUES(popularity),
                poster_path = VALUES(poster_path),
                backdrop_path = VALUES(backdrop_path),
                cast = VALUES(cast),
                crew = VALUES(crew),
                video = VALUES(video),
                vote_average = VALUES(vote_average),
                vote_count = VALUES(vote_count),
                belongs_to_collection = VALUES(belongs_to_collection)
            `;

            const values = [
                movieModel.media_id, movieModel.title, movieModel.original_title, movieModel.original_language, movieModel.release_date, movieModel.overview,
                movieModel.popularity, movieModel.poster_path, movieModel.backdrop_path, movieModel.runtime, movieModel.status, movieModel.tagline, movieModel.genres,
                movieModel.production_companies, movieModel.production_countries, movieModel.spoken_languages,
                movieModel.cast, movieModel.crew,
                movieModel.adult, movieModel.video, movieModel.vote_average, movieModel.vote_count, movieModel.belongs_to_collection
            ];

            const [result] = await connection.query(query, values);
            return result.affectedRows === 1;

        } catch (err) {
            logger.error(`[MovieDataHandler], media_id : ${movieModel.media_id}, insertMovieModel error : ${err}`);
        }
    }
}

module.exports = MovieDataHandler;