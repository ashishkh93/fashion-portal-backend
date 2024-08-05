const Joi = require('joi');
const moment = require('moment');

const dateValidation = (value) => {
  const isValidDate = moment(value, 'YYYY-MM-DD', true).isValid();
  return isValidDate;
};

const endDateValidation = (value, helpers) => {
  const isValidDate = dateValidation(value);
  if (!isValidDate) {
    return helpers.message('Invalid end date or format');
  }

  const startDate = helpers.state.ancestors[0].startDate;

  if (moment(value).isSameOrBefore(startDate)) {
    return helpers.message('Vacation end date must be greater than start date');
  }

  return value;
};

const startDateValidate = (value, helpers) => {
  const isValidDate = dateValidation(value);
  if (!isValidDate) {
    return helpers.message('Invalid start date or format');
  }
  return value;
};

const addVacation = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid(),
  }),
  body: Joi.object().keys({
    title: Joi.string().required(),
    startDate: Joi.string().required().custom(startDateValidate, 'startDate format validation'),
    endDate: Joi.string().required().custom(endDateValidation, 'endDate format validation'),
  }),
};

const editVacation = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid().messages({ 'string.guid': 'Invalid vacationId' }),
    vacationId: Joi.string().required().uuid().messages({ 'string.guid': 'Invalid vacationId' }),
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    startDate: Joi.string().custom(startDateValidate, 'startDate format validation'),
    endDate: Joi.string().custom(endDateValidation, 'endDate format validation'),
  }),
};

const deleteVacation = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid().messages({ 'string.guid': 'Invalid artistId' }),
    vacationId: Joi.string().required().uuid().messages({ 'string.guid': 'Invalid vacationId' }),
  }),
};

const getAllVacations = {
  params: Joi.object().keys({
    artistId: Joi.string().required().uuid().messages({ 'string.guid': 'Invalid artistId' }),
  }),
};

module.exports = {
  addVacation,
  editVacation,
  deleteVacation,
  getAllVacations,
};
