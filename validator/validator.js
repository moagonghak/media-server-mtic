const { StatusCodes } = require('http-status-codes');
const { validationResult } = require('express-validator');

const validator = async (req, res, next) => {
    try {
        const validators = req.locals.validators;

        if (validators && validators.length > 0) {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                throw new Error('invalid parameter');
            }
        }

        next();
    } catch (error) {
        console.error("Error in validator:", error);
        return res.status(StatusCodes.BAD_REQUEST).send({ message: "invalid parameter" });
    }
};


module.exports = validator;