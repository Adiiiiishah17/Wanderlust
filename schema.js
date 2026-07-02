const joi = require("joi");
const review = require("./models/review");

module.exports.reviewSchema= joi.object({
    review: joi.object({
        rating: joi.number().required(),
        comment: joi.string().required()
    }).required()
})