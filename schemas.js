const BaseJoi = require("joi")
const sanitizeHTML = require('sanitize-html')

const extention = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                })
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean
            }
        }
    }     
})

const Joi = BaseJoi.extend(extention)

module.exports.supplySchema = Joi.object({
    store: Joi.object({
        title: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        // image: Joi.string().required(),
        description: Joi.string().required().escapeHTML(),
        category: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})