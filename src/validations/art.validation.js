const Joi = require('joi');

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
    searchKeywords: Joi.array().items(Joi.string()),
    timeToCompleteInMinutes: Joi.number(),
    renderIndex: Joi.number(),
    coverImage: Joi.string(),
  }),
};

const editArt = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    artId: Joi.string().required(),
    serviceId: Joi.string(),
    categoryId: Joi.string(),
    name: Joi.string(),
    images: Joi.array().items(Joi.string()).min(1),
    description: Joi.string(),
    price: Joi.number(),
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
