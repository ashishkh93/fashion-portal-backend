const { CustomerInfo } = require('../../models');
const moment = require('moment');
const { getPlainData } = require('../../utils/common.util');
const { NOTIFICATION_TYPE_CONSTANTS } = require('../../utils/notification.util');
const { sendNotificationToUser } = require('./send-notification.handler');
const { notificationService } = require('../../services/common-services');

/**
 *
 * @param {string} customerId
 * @param {string} artistId
 * @param {string} orderId
 * @param {string} orderDate
 */
exports.sendNewOrderRequestNotification = async (customerId, artistId, orderId, orderDate) => {
  /**
   * Get required notification payload data from tables to send, fcmToken and other fields
   */

  let [tokens, customer] = await Promise.all([
    notificationService.getFcmTokens(artistId),
    CustomerInfo.findOne({
      where: { customerId },
      attributes: ['fullName'],
    }),
  ]);

  customer = getPlainData(customer);

  const deviceTokens = tokens?.map((t) => t?.fcmToken) || [];

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
