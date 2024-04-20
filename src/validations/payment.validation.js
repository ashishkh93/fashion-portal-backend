const Joi = require('joi');

const paymentInitate = {
  params: Joi.object().keys({
    customerId: Joi.string().required().messages({ 'any.messge': 'Required' }),
    orderId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    isAdvance: Joi.boolean().required().messages({ 'any.required': 'isAdvance required' }),
  }),
};

const paymentVerify = {
  params: Joi.object().keys({
    customerId: Joi.string().required().messages({ 'any.messge': 'Required' }),
    cfOrderId: Joi.string().required(),
  }),
};

const getPayment = {
  params: Joi.object().keys({
    customerId: Joi.string().required(),
    cfOrderId: Joi.string().required(),
    cfPaymentId: Joi.string().required(),
  }),
};

module.exports = {
  paymentInitate,
  paymentVerify,
  getPayment,
};
