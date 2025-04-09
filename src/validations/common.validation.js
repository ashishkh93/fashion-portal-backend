const Joi = require('joi');
const { startDateValidate, endDateValidation } = require('./date.validation');

const validateUUID = () => {
  return Joi.string().required().uuid().messages({ 'string.guid': 'Invalid id' });
};

const dateRangeValidaton = () => {
  return {
    startDate: Joi.alternatives().try(
      Joi.string().custom(startDateValidate, 'Start date format validation'),
      Joi.valid(null, '')
    ),
    endDate: Joi.alternatives().try(
      Joi.string().custom(endDateValidation, 'End date format validation'),
      Joi.valid(null, '')
    ),
  };
};

module.exports = { validateUUID, dateRangeValidaton };
