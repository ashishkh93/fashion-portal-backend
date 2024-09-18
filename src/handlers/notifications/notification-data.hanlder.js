const { User, CustomerInfo } = require('../../models');
const moment = require('moment');
const { getPlainData } = require('../../utils/common.util');
const { NOTIFICATION_TYPE_CONSTANTS } = require('../../utils/notification.util');
const { sendNotificationToUser } = require('./send-notification.handler');

/**
 *
 * @param {string} customerId
 * @param {string} artistId
 * @param {string} orderId
 * @param {string} orderDate
 */
const sendNewOrderRequestNotification = async (customerId, artistId, orderId, orderDate) => {
  /**
   * Get required notification payload data from tables to send, fcmToken and other fields
   */
  const fetchPromises = [];

  fetchPromises.push(
    User.findOne({
      where: { id: artistId },
      attributes: ['fcmTokens'],
    })
  );
  fetchPromises.push(
    CustomerInfo.findOne({
      where: { customerId },
      attributes: ['fullName'],
    })
  );

  let [artist, customer] = await Promise.all(fetchPromises);

  artist = getPlainData(artist);
  customer = getPlainData(customer);

  const deviceTokens = artist?.fcmTokens || [];

  let additionalData = {
    orderId,
    userId: artistId,
  };

  let notificationPayload = {
    customer: customer.fullName,
    orderDate: moment(orderDate).format('Do MMM YYYY'),
  };

  sendNotificationToUser(
    NOTIFICATION_TYPE_CONSTANTS.NEW_ORDER_REQUEST,
    deviceTokens,
    notificationPayload,
    additionalData,
    'ARTIST'
  );
};

module.exports = { sendNewOrderRequestNotification };
