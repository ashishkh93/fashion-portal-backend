const Joi = require('joi');
const { validateUUID } = require('./common.validation');

// Define the UPI regex pattern
// const upiRegex = /^[\w.-]+@[\w.-]+$/;
// const upiRegex = /^[a-zA-Z0-9.-]{2,256}@[a-zA-Z.-]{2,64}$/;
const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const upiValidationWithJoi = () => {
  return Joi.string().pattern(upiRegex).required().messages({
    'string.empty': 'UPI is required',
    'string.pattern.base': 'UPI is invalid, please enter a valid UPI',
  });
};

const addArtistInfo = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid(),
  }),
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    businessName: Joi.string(),
    // upi: upiValidationWithJoi(),
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
    artistId: Joi.string().required().uuid(),
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

const uplodPrivateImage = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid(),
  }),
  // body: Joi.object().keys({
  //   privateDocKey: Joi.string().required(),
  // }),
};

const getPrivateImage = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid(),
  }),
  body: Joi.object().keys({
    key: Joi.string().required(),
  }),
};

// The Regex pattern for a valid S3 bucket URL
const s3UrlPattern = /^https:\/\/[a-zA-Z0-9.-]+\.s3\.[a-zA-Z0-9-]+\.amazonaws\.com\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=%]+$/;

const uploadRecentWorkImage = {
  params: Joi.object().keys({
    artistId: validateUUID(), // Assuming validateUUID is your custom UUID validation function
  }),
  body: Joi.object().keys({
    recentWorkImages: Joi.array()
      .items(
        Joi.string().pattern(s3UrlPattern).required().messages({
          'string.pattern.base': 'Invalid Image URL.',
          'string.empty': 'Image URL is required.',
          'any.required': 'Image URL is required.',
        })
      )
      .min(1)
      .required(),
  }),
};

const getArtists = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
    searchToken: Joi.string().allow('').allow(null),
    status: Joi.string()
      .valid('PENDING', 'APPROVED', 'REJECTED', 'BLOCKED', 'SUSPENDED')
      .allow('')
      .allow(null)
      .messages({ 'any.only': 'Invalid status' }),
  }),
  params: Joi.object().keys({
    adminId: Joi.string().required(),
  }),
};

const getCustomers = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
    searchToken: Joi.string().allow('').allow(null),
    status: Joi.string()
      .valid('PENDING', 'APPROVED', 'BLOCKED')
      .allow('')
      .allow(null)
      .messages({ 'any.only': 'Invalid stauts' }),
  }),
  params: Joi.object().keys({
    adminId: Joi.string().required(),
  }),
};

const getArts = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
    searchToken: Joi.string().allow('').allow(null),
    status: Joi.string()
      .valid('PENDING', 'APPROVED', 'REJECTED')
      .allow('')
      .allow(null)
      .messages({ 'any.only': 'Invalid stauts' }),
  }),
  params: Joi.object().keys({
    adminId: Joi.string().required(),
  }),
};

module.exports = {
  addArtistInfo,
  getArtistInfo,
  editArtistInfo,
  updateLatLong,
  getReviewsForSingleArtist,
  getAllReviews,
  getOrdersForSingleCustomer,
  uplodPrivateImage,
  uploadRecentWorkImage,
  getPrivateImage,
  getArtists,
  getCustomers,
  getArts,
};
