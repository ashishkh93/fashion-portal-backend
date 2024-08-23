const Joi = require('joi');

const validateUUID = () => {
  return Joi.string().required().uuid().messages({ 'string.guid': 'Invalid id' });
};

module.exports = { validateUUID };
