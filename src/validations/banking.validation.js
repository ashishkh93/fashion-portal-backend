const Joi = require('joi');
const { validateUUID } = require('./common.validation');
const { UPI_REGEX } = require('../utils/constants');

// Define the UPI regex pattern
// const upiRegex = /^[\w.-]+@[\w.-]+$/;
// const upiRegex = /^[a-zA-Z0-9.-]{2,256}@[a-zA-Z.-]{2,64}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const upiValidationWithJoi = () => {
  return Joi.string().pattern(UPI_REGEX).required().messages({
    'string.empty': 'UPI is required',
    'string.pattern.base': 'UPI is invalid, please enter a valid UPI',
  });
};

const addArtistBankingInfo = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid(),
  }),
  body: Joi.object().keys({
    /** Banking info */
    upi: upiValidationWithJoi(),
    // accountHolderName: Joi.string().required(),
    // upiVerified: Joi.bool().required(),

    // bankName: Joi.string().required(),
    // pan: Joi.string().pattern(panRegex).required().messages({
    //   'string.empty': 'PAN number is required',
    //   'string.pattern.base': 'PAN number is invalid, please enter a valid PAN number',
    // }),
    // panImage: Joi.string().required(),
    // bankAccountHolderName: Joi.string().required(),
    // bankAccountNumber: Joi.string().required(),
    // bankIfscCode: Joi.string().required(),
    // cancelChequeImage: Joi.string().required(),
    // aadharCardNumber: Joi.string() // aadhar card number validation pattern
    //   .length(12)
    //   .pattern(/^[0-9]+$/)
    //   .required(),
    // aadharCardFrontImage: Joi.string().required(),
    // aadharCardBackImage: Joi.string().required(),
  }),
};

const initiateOTPRequestToUpdateUpi = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid(),
  }),
  body: Joi.object().keys({
    phone: Joi.string().required().length(10),
  }),
};

const verifyOTPToUpdateUpi = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid(),
  }),
  body: Joi.object().keys({
    phone: Joi.string().required().length(10),
    otp: Joi.string().required().length(6),
  }),
};

const editUpi = {
  params: Joi.object().keys({
    artistId: validateUUID(),
  }),
  body: Joi.object().keys({
    upi: upiValidationWithJoi(),
    phone: Joi.string().required().length(10),
  }),
};

const verifyUpi = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
    artistId: Joi.string().required(),
  }),
};

const verifyUpiInArtist = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    upi: upiValidationWithJoi(),
  }),
};

const verifyPAN = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    pan: Joi.string().pattern(panRegex).required().messages({
      'string.empty': 'PAN number is required',
      'string.pattern.base': 'PAN number is invalid, please provide valid PAN number',
    }),
  }),
};

module.exports = {
  editUpi,
  verifyUpi,
  verifyUpiInArtist,
  verifyPAN,
  addArtistBankingInfo,
  initiateOTPRequestToUpdateUpi,
  verifyOTPToUpdateUpi,
};
