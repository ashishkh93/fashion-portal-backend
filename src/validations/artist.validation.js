const Joi = require('joi');

const addArtistInfo = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    businessName: Joi.string(),
    bankAccountNumber: Joi.string().required(),
    email: Joi.string().email().required(),
    dob: Joi.date().required(),
    gender: Joi.string().required().valid('male', 'female'),
    profilePic: Joi.string(),
    aboutInfo: Joi.string().required(),
    workingTime: Joi.string().required(),
    services: Joi.array().required(),
    location: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
  }),
};

module.exports = {
  addArtistInfo,
};
