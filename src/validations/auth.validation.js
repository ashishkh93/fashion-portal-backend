const Joi = require('joi');
const { password } = require('./custom.validation');
const { validateUUID } = require('./common.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    role: Joi.string().required(),
  }),
};

const createPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const adminPhoneVerify = {
  params: Joi.object().keys({
    adminId: validateUUID(),
  }),
  body: Joi.object().keys({
    phone: Joi.string().alphanum().max(10).min(10),
    otp: Joi.string().required().length(6),
  }),
};

const customerPhoneVerify = {
  params: Joi.object().keys({
    customerId: validateUUID(),
  }),
  body: Joi.object().keys({
    phone: Joi.string().alphanum().max(10).min(10),
    otp: Joi.string().required().length(6),
  }),
};

const artistPhoneVerify = {
  params: Joi.object().keys({
    artistId: validateUUID(),
  }),
  body: Joi.object().keys({
    phone: Joi.string().alphanum().max(10).min(10),
    otp: Joi.string().required().length(6),
  }),
};

const phoneLogin = {
  body: Joi.object().keys({
    phone: Joi.string().required().alphanum().max(10).min(10),
  }),
};

const adminPhoneLogin = {
  body: Joi.object().keys({
    phone: Joi.string().required().alphanum().max(10).min(10),
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
  }),
};

const logout = {
  params: Joi.object().keys({
    userId: validateUUID(),
  }),
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
    fcmToken: Joi.string().required(),
  }),
};

const adminLogout = {
  params: Joi.object().keys({
    userId: validateUUID(),
  }),
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const changeArtistStatus = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    isActive: Joi.boolean().required(),
    status: Joi.string().required().valid('PENDING', 'APPROVED', 'REJECTED', 'BLOCKED', 'SUSPENDED'),
    reasonToDecline: Joi.string().when('isActive', {
      is: false, // The condition where 'isActive' is false
      then: Joi.required(), // Make 'reason' field required if condition is met
      otherwise: Joi.forbidden(), // Make 'reason' field forbidden otherwise
    }),
  }),
};

const changeCustomerStatus = {
  params: Joi.object().keys({
    adminId: validateUUID(),
    customerId: validateUUID(),
  }),
  body: Joi.object().keys({
    isActive: Joi.boolean().required(),
    status: Joi.string().required().valid('PENDING', 'APPROVED', 'BLOCKED'),
    reasonToDecline: Joi.string().when('isActive', {
      is: false, // The condition where 'isActive' is false
      then: Joi.required(), // Make 'reason' field required if condition is met
      otherwise: Joi.forbidden(), // Make 'reason' field forbidden otherwise
    }),
  }),
};

const updateFcmToken = {
  params: Joi.object().keys({
    userId: validateUUID(),
  }),
  body: Joi.object().keys({
    fcmToken: Joi.string().required(),
  }),
};

module.exports = {
  register,
  createPassword,
  phoneLogin,
  adminPhoneLogin,
  login,
  artistPhoneVerify,
  adminPhoneVerify,
  customerPhoneVerify,
  logout,
  adminLogout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  changeArtistStatus,
  changeCustomerStatus,
  updateFcmToken,
};
