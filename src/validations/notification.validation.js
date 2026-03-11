const Joi = require('joi');
const { validateUUID } = require('./common.validation');

const notificationQuery = Joi.object().keys({
  page: Joi.number(),
  size: Joi.number(),
});

const getNotificationsForArtist = {
  params: Joi.object().keys({
    artistId: validateUUID(),
  }),
  query: notificationQuery,
};

const getNotificationsForCustomer = {
  params: Joi.object().keys({
    customerId: validateUUID(),
  }),
  query: notificationQuery,
};

const updateNotificationForArtist = {
  params: Joi.object().keys({
    artistId: validateUUID(),
    notificationId: validateUUID(),
  }),
  body: Joi.object().keys({
    isRead: Joi.bool().required(),
  }),
};

const updateNotificationForCustomer = {
  params: Joi.object().keys({
    customerId: validateUUID(),
    notificationId: validateUUID(),
  }),
  body: Joi.object().keys({
    isRead: Joi.bool().required(),
  }),
};

const readAllNotificationsForArtist = {
  params: Joi.object().keys({
    artistId: validateUUID(),
  }),
};

const readAllNotificationsForCustomer = {
  params: Joi.object().keys({
    customerId: validateUUID(),
  }),
};

module.exports = {
  getNotificationsForArtist,
  getNotificationsForCustomer,
  updateNotificationForArtist,
  updateNotificationForCustomer,
  readAllNotificationsForArtist,
  readAllNotificationsForCustomer,
};
