const Joi = require('joi');

const addBeneficiary = {
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    artistId: Joi.string().required().uuid(),
  }),
};

const payout = {
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
  }),
  body: Joi.object().keys({
    rights: Joi.string().required().messages({
      'any.required': 'You have not provided the privileges to access this resource.',
    }),
    fromDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
      .required()
      .messages({
        'string.empty': `"fromDate" is required`,
        'string.pattern.name': `"toDate" must be in YYYY-MM-DD format`,
        'any.required': `"fromDate" is a required`,
      }),
    toDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
      .required()
      .messages({
        'string.empty': `"toDate" is required`,
        'string.pattern.name': `"toDate" must be in YYYY-MM-DD format`,
        'any.required': `"toDate" is a required`,
      }),
  }),
};

const payoutVerify = {
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    batchTransferId: Joi.string().required(),
  }),
};

const getAllPayouts = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
  }),
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
  }),
};

module.exports = {
  addBeneficiary,
  payout,
  payoutVerify,
  getAllPayouts,
};
