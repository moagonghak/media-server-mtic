
const TypeValidator = require('../config/type-validator');

class PreviewModel {

    constructor(id, media_type, media_id, iso_639_1, iso_3166_1, name, video_key, site, size, type, official, published_at, last_updated) {
        this.id = TypeValidator.isString(id) ? id : null;
        this.media_type = TypeValidator.isNumber(media_type) ? media_type : null;
        this.media_id = TypeValidator.isNumber(media_id) ? media_id : null;
        this.iso_639_1 = TypeValidator.isString(iso_639_1) ? iso_639_1 : null;
        this.iso_3166_1 = TypeValidator.isString(iso_3166_1) ? iso_3166_1 : null;
        this.name = TypeValidator.isString(name) ? name : null;
        this.video_key = TypeValidator.isString(video_key) ? video_key : null;
        this.site = TypeValidator.isString(site) ? site : null;
        this.size = TypeValidator.isNumber(size) ? size : null;
        this.type = TypeValidator.isString(type) ? type : null;
        this.official = TypeValidator.isNumber(official) ? official : null;
        this.published_at = TypeValidator.isDateString(published_at) ? published_at : null;
    }

    static fromDB(data) {
        return new PreviewModel(
            data.id,
            data.media_type,
            data.media_id,
            data.iso_639_1,
            data.iso_3166_1,
            data.name,
            data.video_key,
            data.site,
            data.size,
            data.type,
            data.official,
            data.published_at
        );
    }

    static fromExternal(data, media_type, media_id) {

        return new PreviewModel(
            data.id,
            media_type,
            media_id,
            data.iso_639_1,
            data.iso_3166_1,
            data.name,
            data.key,
            data.site,
            data.size,
            data.type,
            data.official,
            data.published_at
        );
    }

}


module.exports = PreviewModel;
