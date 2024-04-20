const Joi = require('joi');

const orderInitate = {
  params: Joi.object().keys({
    customerId: Joi.string().required(),
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    artIds: Joi.array().items(Joi.string().required()).min(1).required(),
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
      .required()
      .messages({
        'string.empty': `"Date" is required`,
        'string.pattern.name': `"Date" must be in YYYY-MM-DD format`,
        'any.required': `"Date" is a required`,
      }),
    time: Joi.string()
      .pattern(/^([1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/, 'HH:MM AM/PM')
      .required()
      .messages({
        'string.empty': `"Time" is required`,
        'string.pattern.name': `"Time" must be in 'HH:MM AM' or 'HH:MM PM' format`,
        'any.required': `"Time" is a required field`,
      }),
    status: Joi.string().required().valid('pending'),
    customerOrderNote: Joi.string(),
  }),
};

const getOrdersForArtist = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
  }),
  params: Joi.object().keys({
    artistId: Joi.string().required(),
  }),
};

const getSingleOrderForArtist = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
    orderId: Joi.string().required(),
  }),
};

const editOrderForArtist = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
    orderId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .required()
      .valid('approved', 'rejected', 'cancelled by artist')
      .messages({ 'any.only': `Invalid status` }),
    artistOrderNote: Joi.string().when('status', {
      is: Joi.valid('cancelled by artist', 'rejected'),
      then: Joi.required(),
      // otherwise: Joi.forbidden(),
    }),
  }),
};

module.exports = {
  orderInitate,
  getOrdersForArtist,
  getSingleOrderForArtist,
  editOrderForArtist,
};
