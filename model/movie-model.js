
const TypeValidator = require('../config/type-validator');

class MovieModel {

    constructor(media_id, title, original_title, original_language, release_date, overview, popularity, poster_path, backdrop_path, runtime, status, tagline, genres, production_companies, production_countries, spoken_languages, cast, crew, adult, video, vote_average, vote_count, belongs_to_collection) {
        this.media_id = TypeValidator.isNumber(media_id) ? media_id : null;
        this.title = TypeValidator.isString(title) ? title : null;
        this.original_title = TypeValidator.isString(original_title) ? original_title : null;
        this.original_language = TypeValidator.isString(original_language) ? original_language : null;
        this.release_date = TypeValidator.isDateString(release_date) ? release_date : null;
        this.overview = TypeValidator.isString(overview) ? overview : null;
        this.popularity = TypeValidator.isNumber(popularity) ? popularity : null;
        this.poster_path = TypeValidator.isString(poster_path) ? poster_path : null;
        this.backdrop_path = TypeValidator.isString(backdrop_path) ? backdrop_path : null;
        this.runtime = TypeValidator.isNumber(runtime) ? runtime : null;
        this.status = TypeValidator.isString(status) ? status : null;
        this.tagline = TypeValidator.isString(tagline) ? tagline : null;
        this.genres = TypeValidator.isString(genres) ? genres : null;
        this.production_companies = TypeValidator.isString(production_companies) ? production_companies : null;
        this.production_countries = TypeValidator.isString(production_countries) ? production_countries : null;
        this.spoken_languages = TypeValidator.isString(spoken_languages) ? spoken_languages : null;
        this.cast = TypeValidator.isString(cast) ? cast : null;
        this.crew = TypeValidator.isString(crew) ? crew : null;
        this.adult = TypeValidator.isBoolean(adult) ? adult : null;
        this.video = TypeValidator.isBoolean(video) ? video : null;
        this.vote_average = TypeValidator.isNumber(vote_average) ? vote_average : null;
        this.vote_count = TypeValidator.isNumber(vote_count) ? vote_count : null;
        this.belongs_to_collection = TypeValidator.isString(belongs_to_collection) ? belongs_to_collection : null;
    }

    static fromDB(movie) {
        return new MovieModel(
            movie.media_id,
            movie.title,
            movie.original_title,
            movie.original_language,
            movie.release_date,
            movie.overview,
            movie.popularity,
            movie.poster_path,
            movie.backdrop_path,
            movie.runtime,
            movie.status,
            movie.tagline,
            movie.genres,
            movie.production_companies,
            movie.production_countries,
            movie.spoken_languages,
            movie.cast,
            movie.crew,
            movie.adult,
            movie.video,
            movie.vote_average,
            movie.vote_count,
            movie.belongs_to_collection
        );
    }

    static fromExternal(movie) {
        return new MovieModel(
            movie.id,
            movie.title,
            movie.original_title,
            movie.original_language,
            movie.release_date,
            movie.overview,
            movie.popularity,
            movie.poster_path,
            movie.backdrop_path,
            movie.runtime,
            movie.status,
            movie.tagline,
            JSON.stringify(movie.genres),
            JSON.stringify(movie.production_companies),
            JSON.stringify(movie.production_countries),
            JSON.stringify(movie.spoken_languages),
            JSON.stringify(movie.cast),
            JSON.stringify(movie.crew),
            movie.adult,
            movie.video,
            movie.vote_average,
            movie.vote_count,
            JSON.stringify(movie.belongs_to_collection)
        );
    }
}

module.exports = MovieModel;
