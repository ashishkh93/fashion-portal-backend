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

module.exports = {
  addCustomerInfo,
  editCustomerInfo,
  getCustomerInfo,
};
