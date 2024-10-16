const { body, query } = require('express-validator');

class MediaValidator {
    
    static searchTitle() {
        return [
            query('title').isString().notEmpty(),
            query('release_year').isString()
        ];
    }

    static getMediaModel() {
        return [
            query('media_type').isInt({min: 0, max: 1}),
            query('media_id').isInt({min:1})
        ];
    }

    static getDetail() {
        return [
            query('media_type').isInt({min: 0, max: 1}),
            query('media_id').isInt({min:1})
        ];
    }
}



module.exports = MediaValidator;