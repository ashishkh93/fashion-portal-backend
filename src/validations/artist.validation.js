const Joi = require('joi');
const { validateUUID, dateRangeValidaton } = require('./common.validation');

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
    businessProfilePic: Joi.string(),
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
    businessProfilePic: Joi.string(),
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
    searchToken: Joi.string().allow('').allow(null),
    ...dateRangeValidaton(),
  }),
  params: Joi.object().keys({
    adminId: validateUUID(),
    artistId: validateUUID(),
  }),
};

const orderQueryParams = Joi.object().keys({
  page: Joi.number(),
  size: Joi.number(),
  searchToken: Joi.string().allow('').allow(null),
  status: Joi.string()
    .valid(
      'PENDING',
      'APPROVED',
      'REJECTED',
      'NOT_RESPONDED',
      'AUTO_CANCELLED_DUE_TO_UNPAID_ADVANCE_AMOUNT',
      'CANCELLED_BY_ARTIST',
      'CANCELLED_BY_CUSTOMER',
      'COMPLETED'
    )
    .allow('')
    .allow(null)
    .messages({ 'any.only': 'Invalid status' }),
  ...dateRangeValidaton(),
});

const getOrdersForSingleArtist = {
  query: orderQueryParams,
  params: Joi.object().keys({
    adminId: validateUUID(),
    artistId: validateUUID(),
  }),
};

const getOrdersForSingleCustomer = {
  query: orderQueryParams,
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    customerId: Joi.string().required().uuid(),
  }),
};

const getAllReviews = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
    searchToken: Joi.string().allow('').allow(null),
    ...dateRangeValidaton(),
  }),
  params: Joi.object().keys({
    adminId: validateUUID(),
  }),
};

const getAllOrdersForAdmin = {
  query: orderQueryParams,
  params: Joi.object().keys({
    adminId: validateUUID(),
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
    artistId: validateUUID(),
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
      .max(10)
      .required(),
  }),
};

const getArtists = {
  query: Joi.object().keys({
    page: Joi.number().allow(null).optional(),
    size: Joi.number().allow(null).optional(),
    searchToken: Joi.string().allow('').allow(null),
    status: Joi.string()
      .valid('PENDING', 'APPROVED', 'REJECTED', 'BLOCKED', 'SUSPENDED')
      .allow('')
      .allow(null)
      .messages({ 'any.only': 'Invalid status' }),
    ...dateRangeValidaton(),
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
    ...dateRangeValidaton(),
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
  getOrdersForSingleArtist,
  getAllReviews,
  getAllOrdersForAdmin,
  getOrdersForSingleCustomer,
  uplodPrivateImage,
  uploadRecentWorkImage,
  getPrivateImage,
  getArtists,
  getCustomers,
  getArts,
};
