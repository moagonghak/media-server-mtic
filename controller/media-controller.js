const { StatusCodes } = require('http-status-codes');
const MediaService = require('../services/media-service');

class MediaController {

    static async searchTitle(req, res) {

        try {
            const { title, release_year } = req.query;

            let models = null;
            if ( release_year !== undefined ) {
                models = await MediaService.getMediaModelsWithYear(title, release_year);
            } else {
                models = await MediaService.getMediaModels(title);
            }

            if ( models !== null ) {
                return res.status(StatusCodes.OK).json({
                    message: "success to get media list",
                    result: models
                });
            } else {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "failed to get media list",
                    result: null
                });
            }

        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to get media list",
                result: null
            });
        }
    }

    static async getMediaModel(req, res) {

        try {
            const { media_type, media_id } = req.query;

            const model = await MediaService.getMediaModel(media_type, media_id);
            if ( model !== null ) {
                return res.status(StatusCodes.OK).json({
                    message: "success to get media model",
                    result: model
                });
    
            } else {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "failed to get media model",
                    result: null
                });
    
            }

        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to get media model",
                result: null
            });
        }

    }

    static async getDetail(req, res) {

        try {
            const { media_type, media_id } = req.query;

            const detailData = await MediaService.getMediaDetail(media_type, media_id);
            if ( detailData !== null ) {
                return res.status(StatusCodes.OK).json({
                    message: "success to get detail",
                    result: detailData
                });
    
            } else {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "failed to get detail",
                    result: null
                });
    
            }

        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to get detail",
                result: null
            });
        }

    }
}


module.exports = MediaController;