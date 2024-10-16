const express = require("express");
const router = express.Router();

const validator = require("../validator/validator");
const MediaValidator = require('../validator/media-validator');

const MediaController = require('../controller/media-controller');

router.get("/searchTitle", 
    (req, res, next) => {
        req.locals = { validators: MediaValidator.searchTitle() };
        next();
    },
    validator,
    MediaController.searchTitle
);

router.get("/getMediaModel", 
    (req, res, next) => {
        req.locals = { validators: MediaValidator.getMediaModel() };
        next();
    },
    validator,
    MediaController.getMediaModel
);

router.get("/getDetail", 
    (req, res, next) => {
        req.locals = { validators: MediaValidator.getDetail() };
        next();
    },
    validator,
    MediaController.getDetail
);

module.exports = router;
