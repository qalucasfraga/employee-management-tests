const Joi = require('joi');

const loginSuccessResponseSchema = Joi.object({
  status: Joi.string().valid('ok').required(),
  token: Joi.string().required(),
  user: Joi.object().optional(),
}).unknown(true);

const loginErrorResponseSchema = Joi.object({
  status: Joi.string().valid('error').required(),
  message: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).required(),
}).unknown(true);

module.exports = {
  loginSuccessResponseSchema,
  loginErrorResponseSchema,
};