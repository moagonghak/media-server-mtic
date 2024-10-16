const logger = require('../config/logger');

const ExternalService = require('./external-service');
const { MediaType, MediaModel } = require('../model/media-model');


let upcomingMedias = [];
let popularMedias = [];
let onAirMedias = [];

const isUpdateRecommand = JSON.parse(process.env.UPATE_RECOMMANDS.toLowerCase());


class RecommandService {

    static async fetchUpcomingMedias() {

        try {

            const [movies, tvs] = await Promise.all([ExternalService.getUpcomingMovies(), ExternalService.getUpcomingTVSeires()]);

            const movieMediaModels = movies.map(result => MediaModel.fromExternalMovie(result));
            const tvMediaModels = tvs.map(result => MediaModel.fromExternalTV(result));

            return [...movieMediaModels, ...tvMediaModels];

        } catch (err) {
            logger.error(`[RecommandService] fetchUpcomingMedias, error: ${err}`);
            throw err;
        }
    }

    static async fetchPopularMedias() {
        try {

            const [movies, tvs] = await Promise.all([ExternalService.getPopularMovies(), ExternalService.getPopularTVSeires()]);

            const movieMediaModels = movies.map(result => MediaModel.fromExternalMovie(result));
            const tvMediaModels = tvs.map(result => MediaModel.fromExternalTV(result));

            return [...movieMediaModels, ...tvMediaModels];

        } catch (err) {
            logger.error(`[RecommandService] fetchPopularMedias, error: ${err}`);
            throw err;
        }
    }

    static async fetchOnAirMedias() {
        try {

            const [movies, tvs] = await Promise.all([ExternalService.getOnAirMovies(), ExternalService.getOnAirTVSeires()]);

            const movieMediaModels = movies.map(result => MediaModel.fromExternalMovie(result));
            const tvMediaModels = tvs.map(result => MediaModel.fromExternalTV(result));

            return [...movieMediaModels, ...tvMediaModels];

        } catch (err) {
            logger.error(`[RecommandService] fetchOnAirMedias, error: ${err}`);
            throw err;
        }
    }

    static async fetchRecommands() {
        if ( isUpdateRecommand ) {
            upcomingMedias = await RecommandService.fetchUpcomingMedias();
            popularMedias = await RecommandService.fetchPopularMedias();
            onAirMedias = await RecommandService.fetchOnAirMedias();
        }
    }

    static getPopularMedias() {
        return popularMedias;
    }

    static getUpcomingMedias() {
        return upcomingMedias;
    }

    static getOnAirMedias() {
        return onAirMedias;
    }
}


async function updateRecommands() {

    const hourPeriod = 24;

    await RecommandService.fetchRecommands();
    setTimeout(updateRecommands, hourPeriod * 60 * 60 * 1000); // 24 hours
}

updateRecommands();

module.exports = RecommandService;