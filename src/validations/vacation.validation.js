const Joi = require('joi');
const { startDateValidate, endDateValidation } = require('./date.validation');

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
