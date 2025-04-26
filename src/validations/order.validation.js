const Joi = require('joi');
const moment = require('moment');
const logger = require('../config/logger');
const config = require('../config/config');
const { validateUUID } = require('./common.validation');
const minTimeToOrderInHours = config.order.minTimeToOrder;

const artSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'number.base': 'Art id must be a string.',
    'any.required': 'Art id is required.',
  }),
  qty: Joi.number().integer().positive().required().messages({
    'number.base': 'Quantity must be a number.',
    'number.integer': 'Quantity must be an integer.',
    'number.positive': 'Quantity must be a positive number.',
    'any.required': 'Quantity is required.',
  }),
});

const orderInitiate = {
  params: Joi.object().keys({
    customerId: validateUUID(),
    artistId: validateUUID(),
  }),
  body: Joi.object().keys({
    addressId: validateUUID(),
    arts: Joi.array().items(artSchema).min(1).required().messages({
      'array.base': 'Arts must be an array.',
      'array.min': 'Arts array must contain at least one item.',
      'any.required': 'Arts is required.',
    }),
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
      .required()
      .custom((value, helpers) => {
        const dateInput = moment(value);
        const time = helpers.state.ancestors[0].time;
        const minTimeToOrder = moment().add(minTimeToOrderInHours, 'hours');

        // Combine the date and time into one moment object
        const orderDateTimeCombined = moment(`${dateInput.format('YYYY-MM-DD')} ${time}`, 'YYYY-MM-DD hh:mm A');

        // New order must be after 6 hours from current time
        if (orderDateTimeCombined.isAfter(minTimeToOrder)) {
          logger.info('Customer can order');
        } else {
          logger.error(`Customer is trying to create an order within next ${minTimeToOrderInHours} hours, which is invalid`);
          return helpers.message('You cannot create an order for a date and time you selected');
        }

        return value;
      })
      .messages({
        'string.empty': `"Date" is required`,
        'string.pattern.name': `"Date" must be in YYYY-MM-DD format`,
        'any.required': `"Date" is required`,
      }),
    time: Joi.string()
      .custom((value, helpers) => {
        // Check if the time format is valid using moment
        if (!moment(value, 'hh:mm A', true).isValid()) {
          return helpers.error('string.pattern.name', { name: 'HH:MM AM/PM' });
        }
        return value;
      })
      .required()
      .messages({
        'string.empty': `"Time" is required`,
        'string.pattern.name': `"Time" must be in 'HH:MM AM' or 'HH:MM PM' format`,
        'any.required': `"Time" is required`,
      }),
    servicePrefix: Joi.string().required().max(2).messages({
      'string.max': 'The service prefix must be at most 2 characters long.',
      'string.empty': 'The service prefix cannot be empty.',
      'any.required': 'The service prefix is required.',
    }),
    customerOrderNote: Joi.string(),
  }),
};

const getOrdersForArtist = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
  }),
  params: Joi.object().keys({
    artistId: Joi.string().required(),
  }),
};

const getOrderForUser = {
  params: Joi.object().keys({
    customerId: Joi.string().required().uuid(),
    orderId: Joi.string().required().uuid(),
  }),
};

const cancelOrderByUser = {
  params: Joi.object().keys({
    customerId: Joi.string().required().uuid(),
    orderId: Joi.string().required().uuid(),
  }),
  body: Joi.object().keys({
    status: Joi.string().required().valid('CANCELLED_BY_CUSTOMER').messages({ 'any.only': 'Invalid status' }),
    cancelReason: Joi.string().required(),
  }),
};

const getOrdersForUser = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
  }),
  params: Joi.object().keys({
    customerId: Joi.string().required(),
  }),
};

const getSingleOrderForArtist = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
    orderId: Joi.string().required(),
  }),
};

const updateOrderStatusForArtist = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
    orderId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .required()
      .valid('APPROVED', 'REJECTED', 'CANCELLED_BY_ARTIST')
      .messages({ 'any.only': `Invalid status` }),
    artistOrderNote: Joi.string().when('status', {
      is: Joi.valid('CANCELLED_BY_ARTIST', 'REJECTED'),
      then: Joi.required(),
      // otherwise: Joi.forbidden(),
    }),
  }),
};

const discountAndAddAddOnAmountInOrder = {
  params: Joi.object().keys({
    artistId: Joi.string().required(),
    orderId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    discount: Joi.number(),
    addOnAmount: Joi.number(),
    artistAddOnNote: Joi.string(),
  }),
};

const getSingleOrderInAdmin = {
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    orderId: Joi.string().required().uuid(),
  }),
};

module.exports = {
  orderInitiate,
  getOrdersForArtist,
  getSingleOrderForArtist,
  updateOrderStatusForArtist,
  getOrderForUser,
  getOrdersForUser,
  discountAndAddAddOnAmountInOrder,
  cancelOrderByUser,
  getSingleOrderInAdmin,
};
