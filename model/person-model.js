
const TypeValidator = require('../config/type-validator');


function isKorean(text) {
    const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/;
    return koreanRegex.test(text);
}

class PersonModel {

    constructor(adult, also_known_as, biography, birthday, deathday, gender, homepage, id, imdb_id, known_for_department, name, place_of_birth, popularity, profile_path, korean_name, last_updated) {
        this.adult = TypeValidator.isBoolean(adult) ? adult : null;
        this.also_known_as = TypeValidator.isString(also_known_as) ? also_known_as : null;
        this.biography = TypeValidator.isString(biography) ? biography : null;
        this.birthday = TypeValidator.isDateString(birthday) ? birthday : null;
        this.deathday = TypeValidator.isDateString(deathday) ? deathday : null;
        this.gender = TypeValidator.isNumber(gender) ? gender : null;
        this.homepage = TypeValidator.isString(homepage) ? homepage : null;
        this.id = TypeValidator.isNumber(id) ? id : null;
        this.imdb_id = TypeValidator.isString(imdb_id) ? imdb_id : null;
        this.known_for_department = TypeValidator.isString(known_for_department) ? known_for_department : null;
        this.name = TypeValidator.isString(name) ? name : null;
        this.place_of_birth = TypeValidator.isString(place_of_birth) ? place_of_birth : null;
        this.popularity = TypeValidator.isNumber(popularity) ? popularity : null;
        this.profile_path = TypeValidator.isString(profile_path) ? profile_path : null;
        this.korean_name = TypeValidator.isString(korean_name) ? korean_name : null;
        this.last_updated = TypeValidator.isDateString(last_updated) ? last_updated : null;
    }

    static fromDB(data) {
        return new PersonModel(
            data.adult,
            data.also_known_as,
            data.biography,
            data.birthday,
            data.deathday,
            data.gender,
            data.homepage,
            data.id,
            data.imdb_id,
            data.known_for_department,
            data.name,
            data.place_of_birth,
            data.popularity,
            data.profile_path,
            data.korean_name,
            data.last_updated
        );
    }

    static fromExternal(tmdbData) {
        const koreanName = tmdbData.also_known_as.find((name) => isKorean(name));

        return new PersonModel(
            tmdbData.adult,
            tmdbData.also_known_as,
            tmdbData.biography,
            tmdbData.birthday,
            tmdbData.deathday,
            tmdbData.gender,
            tmdbData.homepage,
            tmdbData.id,
            tmdbData.imdb_id,
            tmdbData.known_for_department,
            tmdbData.name,
            tmdbData.place_of_birth,
            tmdbData.popularity,
            tmdbData.profile_path,
            koreanName,
            null
        );
    }
}

module.exports = PersonModel;