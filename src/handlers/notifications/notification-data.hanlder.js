const { CustomerInfo, ArtistInfo } = require('../../models');
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
/**
 * Internal helper: send notification to a customer (FCM tokens fetched for customerId)
 */
const _sendToCustomer = async (type, customerId, artistId, orderId, extraPayload = {}) => {
  const [tokens, customer, artist] = await Promise.all([
    notificationService.getFcmTokens(customerId),
    CustomerInfo.findOne({ where: { customerId }, attributes: ['fullName'] }),
    artistId ? ArtistInfo.findOne({ where: { artistId }, attributes: ['fullName'] }) : Promise.resolve(null),
  ]);

  const deviceTokens = tokens?.map((t) => t?.fcmToken) || [];
  const notificationPayload = {
    customer: getPlainData(customer)?.fullName,
    ...(artist ? { artist: getPlainData(artist)?.fullName } : {}),
    ...extraPayload,
  };

  sendNotificationToUser(type, deviceTokens, notificationPayload, { orderId, userId: customerId }, 'CUSTOMER');
};

/**
 * Internal helper: send notification to an artist (FCM tokens fetched for artistId)
 */
const _sendToArtist = async (type, artistId, orderId, extraPayload = {}) => {
  const [tokens, artist] = await Promise.all([
    notificationService.getFcmTokens(artistId),
    ArtistInfo.findOne({ where: { artistId }, attributes: ['fullName'] }),
  ]);

  const deviceTokens = tokens?.map((t) => t?.fcmToken) || [];
  const notificationPayload = {
    artist: getPlainData(artist)?.fullName,
    ...extraPayload,
  };

  sendNotificationToUser(type, deviceTokens, notificationPayload, { orderId, userId: artistId }, 'ARTIST');
};

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

/** Sent to CUSTOMER when artist approves the order */
exports.sendOrderAcceptedNotification = (customerId, artistId, orderId) => {
  _sendToCustomer(NOTIFICATION_TYPE_CONSTANTS.ORDER_ACCEPTED, customerId, artistId, orderId);
};

/** Sent to CUSTOMER when artist rejects the order */
exports.sendOrderRejectedNotification = (customerId, artistId, orderId) => {
  _sendToCustomer(NOTIFICATION_TYPE_CONSTANTS.ORDER_REJECTED, customerId, artistId, orderId);
};

/** Sent to CUSTOMER when artist cancels the order */
exports.sendOrderCancelledByArtistNotification = (customerId, artistId, orderId) => {
  _sendToCustomer(NOTIFICATION_TYPE_CONSTANTS.ORDER_CANCELLED_BY_ARTIST, customerId, artistId, orderId);
};

/**
 * Sent to ARTIST when customer cancels the order
 * @param {boolean} artistGetsAdvance - true if artist retains advance amount (non-refundable cancel)
 */
exports.sendOrderCancelledByCustomerNotification = (artistId, orderId, orderDate, artistGetsAdvance) => {
  const type = artistGetsAdvance
    ? NOTIFICATION_TYPE_CONSTANTS.ORDER_CANCELLED_BY_CUSTOMER_WITH_ADVANCE
    : NOTIFICATION_TYPE_CONSTANTS.ORDER_CANCELLED_BY_CUSTOMER_NO_ADVANCE;
  _sendToArtist(type, artistId, orderId, { date: moment(orderDate).format('Do MMM YYYY') });
};

/** Sent to CUSTOMER when order is auto-cancelled because artist didn't respond in 24h */
exports.sendAutoOrderCancelledNotRespondedNotification = (customerId, orderId) => {
  _sendToCustomer(NOTIFICATION_TYPE_CONSTANTS.AUTO_CANCELLED_NOT_RESPONDED, customerId, null, orderId);
};

/** Sent to ARTIST when order is auto-cancelled because customer didn't pay advance in time */
exports.sendAutoOrderCancelledUnpaidAdvanceNotification = (artistId, orderId) => {
  _sendToArtist(NOTIFICATION_TYPE_CONSTANTS.AUTO_CANCELLED_UNPAID_ADVANCE, artistId, orderId);
};

/** Sent to CUSTOMER when advance payment succeeds */
exports.sendAdvancePaymentReceivedNotification = (customerId, orderId) => {
  _sendToCustomer(NOTIFICATION_TYPE_CONSTANTS.ADVANCE_PAYMENT_RECEIVED, customerId, null, orderId);
};

/** Sent to CUSTOMER when advance payment fails */
exports.sendAdvancePaymentFailedNotification = (customerId, orderId) => {
  _sendToCustomer(NOTIFICATION_TYPE_CONSTANTS.ADVANCE_PAYMENT_FAILED, customerId, null, orderId);
};

/** Sent to CUSTOMER when final payment succeeds */
exports.sendFinalPaymentReceivedNotification = (customerId, orderId) => {
  _sendToCustomer(NOTIFICATION_TYPE_CONSTANTS.FINAL_PAYMENT_RECEIVED, customerId, null, orderId);
};

/** Sent to CUSTOMER when final payment fails */
exports.sendFinalPaymentFailedNotification = (customerId, orderId) => {
  _sendToCustomer(NOTIFICATION_TYPE_CONSTANTS.FINAL_PAYMENT_FAILED, customerId, null, orderId);
};

/** Sent to ARTIST when order is marked completed (after successful final payment) */
exports.sendOrderCompletedNotification = (artistId, orderId) => {
  _sendToArtist(NOTIFICATION_TYPE_CONSTANTS.ORDER_COMPLETED, artistId, orderId);
};

/** Sent to ARTIST when admin updates the artist's account status */
exports.sendArtistStatusUpdatedNotification = async (artistId, status) => {
  const [tokens, artist] = await Promise.all([
    notificationService.getFcmTokens(artistId),
    ArtistInfo.findOne({ where: { artistId }, attributes: ['fullName'] }),
  ]);

  const deviceTokens = tokens?.map((t) => t?.fcmToken) || [];
  const notificationPayload = {
    artist: getPlainData(artist)?.fullName,
    status,
  };

  sendNotificationToUser(
    NOTIFICATION_TYPE_CONSTANTS.ARTIST_STATUS_UPDATED,
    deviceTokens,
    notificationPayload,
    { userId: artistId },
    'ARTIST'
  );
};
