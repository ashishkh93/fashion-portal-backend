const Joi = require("joi");

const vendorSplit = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
    artistId: Joi.string().required(),
  }),
};

module.exports = {
  vendorSplit,
};
