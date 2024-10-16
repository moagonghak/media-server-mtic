
const TypeValidator = require('../config/type-validator');

class WatchProviderModel {

    constructor(media_type, media_id, provider_id, provider_name, last_updated) {
        this.media_type = TypeValidator.isNumber(media_type) ? media_type : null;
        this.media_id = TypeValidator.isNumber(media_id) ? media_id : null;
        this.provider_id = TypeValidator.isNumber(provider_id) ? provider_id : null;
        this.provider_name = TypeValidator.isString(provider_name) ? provider_name : null;
        this.last_updated = TypeValidator.isDateString(last_updated) ? last_updated : null;
    }

    static fromDB(data) {
        return new WatchProviderModel(
            data.media_type,
            data.media_id,
            data.provider_id,
            data.provider_name,
            data.last_updated
        );
    }

    static fromExternal(data, media_type, media_id) {
        return new WatchProviderModel(
            media_type,
            media_id,
            data.provider_id,
            data.provider_name,
            null
        );
    }
}

module.exports = WatchProviderModel;
