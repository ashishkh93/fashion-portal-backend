const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const reconstructMessage = (errorMessage) => {
  const regex = /"([^"]+)"(.+)/;
  const matches = errorMessage?.match(regex);

  if (matches && matches.length > 2) {
    // If there is a field name and additional text
    const fieldName = matches[1]; // The field name without quotes
    const additionalText = matches[2]; // The additional text beyond the field name
    return `${fieldName}${additionalText}`;
  } else {
    // If the message does not match the pattern or contains only the quoted field name
    return errorMessage;
  }
};

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' } })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      ?.map((details) => {
        // function to reconstruct the message if applicable
        const finalMessage = reconstructMessage(details.message);
        return finalMessage;
      })
      .join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
