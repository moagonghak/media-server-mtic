const express = require("express");
const router = express.Router();

const recommandRouter = require('./recommand-router');
router.use('/recommand', recommandRouter);

const mediaRouter = require('./media-router');
router.use("/media", mediaRouter);


const WatchProviderService = require('../services/watchprovider-service');
const { HttpStatusCode } = require("axios");

router.use("/provider", async (req, res) => {

  const { media_type, media_id } = req.query;

  const mediaId = parseInt(media_id, 10);
  const mediaType = parseInt(media_type, 10);

  const providers = await WatchProviderService.getWatchProviders(mediaType, mediaId);
  res.status(HttpStatusCode.Ok).json(providers);
  
});

module.exports = router;
