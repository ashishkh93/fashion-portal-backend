const Joi = require('joi');

const addArtistInfo = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    businessName: Joi.string(),
    bankName: Joi.string().required(),
    bankAccountHolderName: Joi.string().required(),
    bankAccountNumber: Joi.string().required(),
    bankIfscCode: Joi.string().required(),
    cancelChequeImage: Joi.string().required(),
    aadharCardNumber: Joi.string() // aadhar card number validation pattern
      .length(12)
      .pattern(/^[0-9]+$/)
      .required(),
    aadharCardFrontImage: Joi.string().required(),
    aadharCardBackImage: Joi.string().required(),
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

const getAndeditArtistInfo = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
  }),
};

module.exports = {
  addArtistInfo,
  getAndeditArtistInfo,
};
