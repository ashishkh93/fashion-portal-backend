const moment = require('moment');

const dateValidation = (value) => {
  const isValidDate = moment(value, 'YYYY-MM-DD', true).isValid();
  return isValidDate;
};

const startDateValidate = (value, helpers) => {
  const isValidDate = dateValidation(value);
  if (!isValidDate) {
    return helpers.message('Invalid start date or format');
  }
  return value;
};

const endDateValidation = (value, helpers, msg) => {
  const isValidDate = dateValidation(value);
  if (!isValidDate) {
    return helpers.message('Invalid end date or format');
  }

  const startDate = helpers.state.ancestors[0].startDate;

  if (moment(value).isSameOrBefore(startDate)) {
    return helpers.message(msg || 'End date must be greater than start date');
  }

  return value;
};

module.exports = {
  dateValidation,
  startDateValidate,
  endDateValidation,
};
