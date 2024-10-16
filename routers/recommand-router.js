const express = require("express");
const router = express.Router();

const RecommandController = require('../controller/recommand-controller');

router.get("/getPopularMedias", RecommandController.getPopularMedias);
router.get("/getUpcomingMedias", RecommandController.getUpcomingMedias);
router.get("/getOnAirMedias", RecommandController.getOnAirMedias);

module.exports = router;
