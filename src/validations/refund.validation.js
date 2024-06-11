const Joi = require('joi');

const fetchRefundRequests = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
  }),
};

const initiateRefund = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
    orderId: Joi.string().required(),
    customerId: Joi.string().required(),
  }),
};

module.exports = {
  fetchRefundRequests,
  initiateRefund,
};
