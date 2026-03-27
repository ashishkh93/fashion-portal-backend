const Joi = require('joi');

const paymentInitate = {
  params: Joi.object().keys({
    customerId: Joi.string().required().uuid().messages({ 'any.messge': 'Required' }),
    orderId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    // For advance payment pass isAdvance: true; for final payment omit the field entirely
    isAdvance: Joi.boolean().optional(),
  }),
};

const getPaymentOrder = {
  params: Joi.object().keys({
    customerId: Joi.string().required().messages({ 'any.messge': 'Required' }),
    orderId: Joi.string().required(),
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

const getOrderPaymentInfo = {
  params: Joi.object().keys({
    customerId: Joi.string().required().uuid(),
    orderId: Joi.string().required().uuid(),
  }),
};

module.exports = {
  paymentInitate,
  paymentVerify,
  getPayment,
  getPaymentOrder,
  getOrderPaymentInfo,
};
