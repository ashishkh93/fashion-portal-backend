const Joi = require('joi');

const getTransactionsForCustomersInAdmin = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
  }),
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    customerId: Joi.string().required().uuid(),
  }),
};

const getTransactionsForArtistInAdmin = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
  }),
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    artistId: Joi.string().required().uuid(),
  }),
};

module.exports = {
  getTransactionsForCustomersInAdmin,
  getTransactionsForArtistInAdmin,
};
