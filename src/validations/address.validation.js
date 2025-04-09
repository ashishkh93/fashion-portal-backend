const Joi = require('joi');
const { validateUUID } = require('./common.validation');

const addAddress = {
  params: Joi.object().keys({
    customerId: validateUUID(),
  }),
  body: Joi.object().keys({
    street: Joi.string().required(),
    buildingNumber: Joi.string().allow(null).allow(''),
    houseNumber: Joi.string().required(),
    landmark: Joi.string().allow(null).allow(''),
    pincode: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required().valid('india').messages({ 'any.only': 'Invalid country' }),
  }),
};

const editAddress = {
  params: Joi.object().keys({
    customerId: validateUUID(),
    addressId: validateUUID(),
  }),
  body: Joi.object().keys({
    street: Joi.string().required(),
    buildingNumber: Joi.string().allow(null).allow(''),
    houseNumber: Joi.string().required(),
    landmark: Joi.string().allow(null).allow(''),
    pincode: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required().valid('india').messages({ 'any.only': 'Invalid country' }),
  }),
};

const getAllAddress = {
  params: Joi.object().keys({
    customerId: validateUUID(),
  }),
};

module.exports = {
  addAddress,
  editAddress,
  getAllAddress,
};
