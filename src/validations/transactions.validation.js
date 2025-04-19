const Joi = require('joi');
const { validateUUID, dateRangeValidaton } = require('./common.validation');

const txnQuery = Joi.object().keys({
  page: Joi.number(),
  size: Joi.number(),
  searchToken: Joi.string().allow('').allow(null),
  paymentType: Joi.string().valid('advance', 'final').allow('').allow(null).messages({ 'any.only': 'Invalid type' }),
  status: Joi.string()
    .valid('SUCCESS', 'FAILURE', 'VOID', 'INCOMPLETE', 'PENDING', 'FLAGGED', 'CANCELLED', 'USER_DROPPED')
    .allow('')
    .allow(null)
    .messages({ 'any.only': 'Invalid status' }),
  ...dateRangeValidaton(),
});

const getTransactionsForCustomersInAdmin = {
  query: txnQuery,
  params: Joi.object().keys({
    adminId: validateUUID(),
    customerId: validateUUID(),
  }),
};

const getTransactionsForAllCustomersInAdmin = {
  query: txnQuery,
  params: Joi.object().keys({
    adminId: validateUUID(),
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
  getTransactionsForAllCustomersInAdmin,
  getTransactionsForArtistInAdmin,
};
