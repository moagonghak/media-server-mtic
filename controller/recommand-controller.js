const logger = require('../config/logger');

const { StatusCodes } = require('http-status-codes');
const RecommandService = require('../services/recommand-service');

class RecommandController {

    static async getPopularMedias(req, res) {
        try {
            res.status(StatusCodes.OK).send(RecommandService.getPopularMedias());
        } catch (error) {
            logger.error(`[RecommandController] getPopularMedias, error: ${error}`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
        }
    }

    static async getUpcomingMedias(req, res) {
        try {
            res.status(StatusCodes.OK).send(RecommandService.getUpcomingMedias());
        } catch (error) {
            logger.error(`[RecommandController] getUpcomingMedias, error: ${error}`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
        }
    }

    static async getOnAirMedias(req, res) {
        try {
            res.status(StatusCodes.OK).send(RecommandService.getOnAirMedias());
        } catch (error) {
            logger.error(`[RecommandController] getOnAirMedias, error: ${error}`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
        }
    }
}

module.exports = RecommandController;