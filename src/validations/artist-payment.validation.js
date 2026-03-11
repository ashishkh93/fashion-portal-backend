const Joi = require('joi');

const getPaymentDashboard = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid(),
  }),
};

const getPaymentHistory = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().min(0),
    size: Joi.number().integer().min(1).max(100),
  }),
};

const getTransferOrders = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid(),
    transferId: Joi.string().required().uuid(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().min(0),
    size: Joi.number().integer().min(1).max(100),
  }),
};

module.exports = {
  getPaymentDashboard,
  getPaymentHistory,
  getTransferOrders,
};
