const Joi = require('joi');

const addBeneficiary = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    beneficiary_name: Joi.string().required(),
    beneficiary_email: Joi.string().required(),
    beneficiary_phone: Joi.string().alphanum().max(10).min(10),
    vpa: Joi.string().required(),
    beneficiary_address: Joi.string().required(),
    beneficiary_city: Joi.string().required(),
    beneficiary_state: Joi.string().required(),
    beneficiary_postal_code: Joi.string().required().max(6),
  }),
};

const payout = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
  }),
  body: Joi.object().keys({
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
    adminId: Joi.string().required(),
    batchTransferId: Joi.string().required(),
  }),
};

module.exports = {
  addBeneficiary,
  payout,
  payoutVerify,
};
