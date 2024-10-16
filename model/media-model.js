
const TypeValidator = require('../config/type-validator');
const UTCDate = require('../config/utc-date');

const MediaType = {
    MOVIE: 0,
    TV: 1,
};

class MediaModel {
    constructor(media_id, media_type, original_language, title, overview, popularity, poster_path, backdrop_path, vote_average, vote_count, release_date, adult, genre_ids) {
        this.media_id = TypeValidator.isNumber(media_id) ? media_id : null;
        this.media_type = TypeValidator.isNumber(media_type) ? media_type : null;
        this.original_language = TypeValidator.isString(original_language) ? original_language : null;
        this.title = TypeValidator.isString(title) ? title : null;
        this.overview = TypeValidator.isString(overview) ? overview : null;
        this.popularity = TypeValidator.isNumber(popularity) ? popularity : null;
        this.poster_path = TypeValidator.isString(poster_path) ? poster_path : null;
        this.backdrop_path = TypeValidator.isString(backdrop_path) ? backdrop_path : null;
        this.vote_average = TypeValidator.isNumber(vote_average) ? vote_average : null;
        this.vote_count = TypeValidator.isNumber(vote_count) ? vote_count : null;
        this.release_date = TypeValidator.isDateString(release_date) ? release_date : null;
        this.adult = TypeValidator.isBoolean(adult) ? adult : null;
        this.genre_ids = TypeValidator.isString(genre_ids) ? genre_ids : null;
    }
    static fromDB(data) {
        return new MediaModel(
            data.media_id,
            data.media_type,
            data.original_language,
            data.title,
            data.overview,
            data.popularity,
            data.poster_path,
            data.backdrop_path,
            data.vote_average,
            data.vote_count,
            data.release_date,
            data.adult,
            data.genre_ids
        );
    }

    static fromExternalMovie(data) {
        return new MediaModel(
            data.id,
            MediaType.MOVIE,
            data.original_language,
            data.title,
            data.overview,
            data.popularity,
            data.poster_path,
            data.backdrop_path,
            data.vote_average,
            data.vote_count,
            data.release_date,
            data.adult,
            JSON.stringify(data.genre_ids),
        );
    }

    static fromExternalTV(data) {
        return new MediaModel(
            data.id,
            MediaType.TV,
            data.original_language,
            data.name,
            data.overview,
            data.popularity,
            data.poster_path,
            data.backdrop_path,
            data.vote_average,
            data.vote_count,
            data.first_air_date,
            data.adult,
            JSON.stringify(data.genre_ids)
        );
    }

    static fromMovieDetail(model) {
        
        if ( null == model || TypeValidator.isMovieModel(model) ) {
            return null;
        }

        const genre_ids = MediaModel.exportGenreIdList(model.genres);

        return new MediaModel(
            model.media_id,
            MediaType.MOVIE,
            model.original_language,
            model.title,
            model.overview,
            model.popularity,
            model.poster_path,
            model.backdrop_path,
            model.vote_average,
            model.vote_count,
            model.release_date,
            model.adult,
            JSON.stringify(genre_ids)
        );
    }

    static fromTVDetail(model) {
        
        if ( null == model || TypeValidator.isTVModel(model) ) {
            return null;
        }

        const genre_ids = MediaModel.exportGenreIdList(model.genres);

        return new MediaModel(
            model.media_id,
            MediaType.TV,
            model.original_language,
            model.name,
            model.overview,
            model.popularity,
            model.poster_path,
            model.backdrop_path,
            model.vote_average,
            model.vote_count,
            model.first_air_date,
            model.adult,
            JSON.stringify(genre_ids)
        );
    }

    static exportGenreIdList(genres) {
        if ( TypeValidator.isString(genres) == false ) {
            return null;
        }

        const genresArray = JSON.parse(genres);
        const ids = genresArray.map(genre => genre.id);
        if ( ids.length > 0 ) {
            return ids;
        }

        return null;
    }

    static isMovie(media_type) {
        return media_type == MediaType.MOVIE;
    }
    
    static isTVSeries(media_type) {
        return media_type == MediaType.TV;
    }
}

module.exports = {
    MediaModel,
    MediaType
};