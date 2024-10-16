
const TypeValidator = require('../config/type-validator');

class TVModel {
    constructor(media_id, adult, backdrop_path, created_by, episode_run_time, first_air_date, genres, homepage, in_production, languages, last_air_date, last_episode_to_air, name, networks, number_of_episodes, number_of_seasons, origin_country, original_language, original_name, overview, popularity, poster_path, production_companies, production_countries, seasons, spoken_languages, status, tagline, type, vote_average, vote_count, cast, crew) {
        this.media_id = TypeValidator.isNumber(media_id) ? media_id : null;
        this.adult = TypeValidator.isBoolean(adult) ? adult : null;
        this.backdrop_path = TypeValidator.isString(backdrop_path) ? backdrop_path : null;
        this.created_by = TypeValidator.isString(created_by) ? created_by : null;
        this.episode_run_time = TypeValidator.isString(episode_run_time) ? episode_run_time : null;
        this.first_air_date = TypeValidator.isDateString(first_air_date) ? first_air_date : null;
        this.genres = TypeValidator.isString(genres) ? genres : null;
        this.homepage = TypeValidator.isString(homepage) ? homepage : null;
        this.in_production = TypeValidator.isBoolean(in_production) ? in_production : null;
        this.languages = TypeValidator.isString(languages) ? languages : null;
        this.last_air_date = TypeValidator.isDateString(last_air_date) ? last_air_date : null;
        this.last_episode_to_air = TypeValidator.isString(last_episode_to_air) ? last_episode_to_air : null;
        this.name = TypeValidator.isString(name) ? name : null;
        this.networks = TypeValidator.isString(networks) ? networks : null;
        this.number_of_episodes = TypeValidator.isNumber(number_of_episodes) ? number_of_episodes : null;
        this.number_of_seasons = TypeValidator.isNumber(number_of_seasons) ? number_of_seasons : null;
        this.origin_country = TypeValidator.isString(origin_country) ? origin_country : null;
        this.original_language = TypeValidator.isString(original_language) ? original_language : null;
        this.original_name = TypeValidator.isString(original_name) ? original_name : null;
        this.overview = TypeValidator.isString(overview) ? overview : null;
        this.popularity = TypeValidator.isNumber(popularity) ? popularity : null;
        this.poster_path = TypeValidator.isString(poster_path) ? poster_path : null;
        this.production_companies = TypeValidator.isString(production_companies) ? production_companies : null;
        this.production_countries = TypeValidator.isString(production_countries) ? production_countries : null;
        this.seasons = TypeValidator.isString(seasons) ? seasons : null;
        this.spoken_languages = TypeValidator.isString(spoken_languages) ? spoken_languages : null;
        this.status = TypeValidator.isString(status) ? status : null;
        this.tagline = TypeValidator.isString(tagline) ? tagline : null;
        this.type = TypeValidator.isString(type) ? type : null;
        this.vote_average = TypeValidator.isNumber(vote_average) ? vote_average : null;
        this.vote_count = TypeValidator.isNumber(vote_count) ? vote_count : null;
        this.cast = TypeValidator.isString(cast) ? cast : null;
        this.crew = TypeValidator.isString(crew) ? crew : null;
    }
    static fromDB(data) {
        return new TVModel(
            data.media_id,
            data.adult,
            data.backdrop_path,
            data.created_by,
            data.episode_run_time,
            data.first_air_date,
            data.genres,
            data.homepage,
            data.in_production,
            data.languages,
            data.last_air_date,
            data.last_episode_to_air,
            data.name,
            data.networks,
            data.number_of_episodes,
            data.number_of_seasons,
            data.origin_country,
            data.original_language,
            data.original_name,
            data.overview,
            data.popularity,
            data.poster_path,
            data.production_companies,
            data.production_countries,
            data.seasons,
            data.spoken_languages,
            data.status,
            data.tagline,
            data.type,
            data.vote_average,
            data.vote_count,
            data.cast,
            data.crew
        );
    }

    static fromExternal(data) {
        return new TVModel(
            data.id,
            data.adult,
            data.backdrop_path,
            JSON.stringify(data.created_by),
            JSON.stringify(data.episode_run_time),
            data.first_air_date,
            JSON.stringify(data.genres),
            data.homepage,
            data.in_production,
            JSON.stringify(data.languages),
            data.last_air_date,
            JSON.stringify(data.last_episode_to_air),
            data.name,
            JSON.stringify(data.networks),
            data.number_of_episodes,
            data.number_of_seasons,
            JSON.stringify(data.origin_country),
            data.original_language,
            data.original_name,
            data.overview,
            data.popularity,
            data.poster_path,
            JSON.stringify(data.production_companies),
            JSON.stringify(data.production_countries),
            JSON.stringify(data.seasons),
            JSON.stringify(data.spoken_languages),
            data.status,
            data.tagline,
            data.type,
            data.vote_average,
            data.vote_count,
            JSON.stringify(data.cast),
            JSON.stringify(data.crew)
        );
    }
}


module.exports = TVModel;