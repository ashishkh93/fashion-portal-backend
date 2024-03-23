const Joi = require('joi');
const { password } = require('./custom.validation');

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

const phoneVerify = {
  body: Joi.object().keys({
    phone: Joi.string().alphanum().max(10).min(10),
    otp: Joi.number().required(),
  }),
};

const phoneLogin = {
  body: Joi.object().keys({
    phone: Joi.string().required().alphanum().max(10).min(10),
    phone: Joi.string().required(),
  }),
};

const logout = {
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
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    isActive: Joi.boolean().required(),
    reasonToDecline: Joi.string().when('isActive', {
      is: false, // The condition where 'isActive' is false
      then: Joi.required(), // Make 'reason' field required if condition is met
      otherwise: Joi.forbidden(), // Make 'reason' field forbidden otherwise
    }),
  }),
};

module.exports = {
  register,
  createPassword,
  phoneLogin,
  login,
  phoneVerify,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  changeArtistStatus,
};
