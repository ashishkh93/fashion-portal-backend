const Joi = require('joi');
const config = require('../config/config');

const advanceAmountPT = config.pt.advanceAmountPT;

const addArt = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    serviceId: Joi.string().required(),
    categoryId: Joi.string().required(),
    name: Joi.string().required(),
    images: Joi.array().items(Joi.string().required()).min(1).required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    advanceAmount: Joi.number()
      .required()
      .custom((value, helpers) => {
        const price = helpers.state.ancestors[0].price;
        const maxAdvanceAmount = price * advanceAmountPT;

        if (value > maxAdvanceAmount) {
          return helpers.error('any.custom', { limit: maxAdvanceAmount });
        }

        return value;
      })
      .messages({
        'any.custom': 'advanceAmount cannot be more than {{#limit}}',
      }),

    searchKeywords: Joi.array().items(Joi.string()),
    timeToCompleteInMinutes: Joi.number(),
    renderIndex: Joi.number(),
    coverImage: Joi.string(),
  }),
};

const editArt = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
    artId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    serviceId: Joi.string(),
    categoryId: Joi.string(),
    name: Joi.string(),
    images: Joi.array().items(Joi.string()).min(1),
    description: Joi.string(),
    price: Joi.number(),
    advanceAmount: Joi.number()
      .custom((value, helpers) => {
        const price = helpers.state.ancestors[0].price;
        const maxAdvanceAmount = price * advanceAmountPT;

        if (value > maxAdvanceAmount) {
          return helpers.error('any.custom', { limit: maxAdvanceAmount });
        }

        return value;
      })
      .messages({
        'any.custom': "advanceAmount can't be more than {{#limit}}, it is calculated by maximum 20% of price",
      }),
    searchKeywords: Joi.array().items(Joi.string()),
    timeToCompleteInMinutes: Joi.number(),
    renderIndex: Joi.number(),
    coverImage: Joi.string(),
  }),
};

const getSingleArt = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
    artId: Joi.string().required(),
  }),
};

const udpateArtStatus = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
    artistId: Joi.string().required(),
    artId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    isActive: Joi.boolean().required(),
    reasonToDeclineArt: Joi.string().when('isActive', {
      is: false,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  }),
};

const getArts = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
  }),
};

module.exports = {
  addArt,
  editArt,
  getArts,
  getSingleArt,
  udpateArtStatus,
};
