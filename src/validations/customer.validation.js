const Joi = require('joi');

const addCustomerInfo = {
  params: Joi.object().keys({
    customerId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    dob: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
      .required()
      .messages({
        'string.empty': `"DOB" cannot be empty`,
        'string.pattern.name': `"DOB" must be in YYYY-MM-DD format`,
        'any.required': `"DOB" is a required`,
      }),
    gender: Joi.string().required().valid('male', 'female'),
    profilePic: Joi.string(),
    city: Joi.string().required(),
    state: Joi.string().required(),
  }),
};

const editCustomerInfo = {
  params: Joi.object().keys({
    customerId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    fullName: Joi.string(),
    email: Joi.string().email(),
    dob: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
      .messages({
        'string.empty': `"DOB" cannot be empty`,
        'string.pattern.name': `"DOB" must be in YYYY-MM-DD format`,
      }),
    gender: Joi.string().valid('male', 'female'),
    profilePic: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
  }),
};

const getCustomerInfo = {
  params: Joi.object().keys({
    customerId: Joi.string().required(),
  }),
};

const addReview = {
  params: Joi.object().keys({
    customerId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    artistId: Joi.string().required(),
    orderId: Joi.string().required(),
    description: Joi.string(),
    reviewCount: Joi.number()
      .required()
      .custom((value, helpers) => {
        const limit = 5;
        if (value > 5) {
          return helpers.error('any.custom', { limit });
        }
        return value;
      })
      .messages({
        'any.custom': 'You can give maximun {{#limit}} star review for the order',
      }),
  }),
};

const getOrderReview = {
  params: Joi.object().keys({
    customerId: Joi.string().required(),
    orderId: Joi.string().required(),
  }),
};

const getFilteredArtists = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
  }),
  params: Joi.object().keys({
    customerId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    latitude: Joi.number(),
    longitude: Joi.number(),
    maxDistance: Joi.number(),
    minRating: Joi.number(),
    services: Joi.array().items(Joi.string().uuid().message('One or more values are not valid UUIDs')).messages({
      'array.base': 'Services must be an array',
      'array.includesRequiredUnknowns': 'Services must be an array of valid UUIDs',
    }),
  }),
};

const getSingleArtist = {
  params: Joi.object().keys({
    customerId: Joi.string().required().uuid(),
    artistId: Joi.string().required().uuid(),
  }),
};

module.exports = {
  addCustomerInfo,
  editCustomerInfo,
  getCustomerInfo,
  addReview,
  getOrderReview,
  getFilteredArtists,
  getSingleArtist,
};
