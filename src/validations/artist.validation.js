const Joi = require('joi');

// Define the UPI regex pattern
const upiRegex = /^[\w.-]+@[\w.-]+$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// const upiRegex = /^[a-zA-Z0-9.-]{2,256}@[a-zA-Z.-]{2,64}$/;

const addArtistInfo = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid(),
  }),
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    businessName: Joi.string(),
    bankName: Joi.string().required(),
    upi: Joi.string().pattern(upiRegex).required().messages({
      'string.empty': 'UPI is required',
      'string.pattern.base': 'UPI is invalid, please enter a valid UPI',
    }),
    pan: Joi.string().pattern(panRegex).required().messages({
      'string.empty': 'PAN number is required',
      'string.pattern.base': 'PAN number is invalid, please enter a valid PAN number',
    }),
    panImage: Joi.string().required(),
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
    aboutInfo: Joi.string().required(),
    workingTime: Joi.string().required(),
    services: Joi.array().required(),
    location: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
  }),
};

const editArtistInfo = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    fullName: Joi.string(),
    businessName: Joi.string(),
    email: Joi.string().email(),
    dob: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
      .messages({
        'string.empty': `"DOB" cannot be empty`,
        'string.pattern.name': `"DOB" must be in YYYY-MM-DD format`,
      }),
    gender: Joi.string().valid('male', 'female'),
    profilePic: Joi.string(),
    aboutInfo: Joi.string(),
    workingTime: Joi.string(),
    services: Joi.array(),
    location: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    newServices: Joi.array().items(Joi.string()),
    deletedServices: Joi.array().items(Joi.string()),
  }),
};

const editUpi = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    upi: Joi.string().pattern(upiRegex).required().messages({
      'string.empty': 'UPI is required',
      'string.pattern.base': 'UPI is invalid, please enter a valid UPI',
    }),
  }),
};

const getArtistInfo = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid(),
  }),
};

const updateLatLong = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }),
};

const verifyUpi = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
    artistId: Joi.string().required(),
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

const getReviewsForSingleArtist = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
  }),
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    artistId: Joi.string().required().uuid(),
  }),
};

const getOrdersForSingleCustomer = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
  }),
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    customerId: Joi.string().required().uuid(),
  }),
};

const getAllReviews = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
  }),
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
  }),
};

module.exports = {
  addArtistInfo,
  getArtistInfo,
  editArtistInfo,
  editUpi,
  updateLatLong,
  verifyUpi,
  getReviewsForSingleArtist,
  getAllReviews,
  getOrdersForSingleCustomer,
  verifyPAN,
};
