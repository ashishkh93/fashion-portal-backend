const { User, CustomerInfo } = require('../../models');
const { getPlainData } = require('../../utils/common.util');
const { NOTIFICATION_TYPE_CONSTANTS } = require('../../utils/notification.util');
const { sendNotificationToUser } = require('./send-notification.handler');

const sendNewOrderRequestNotification = async (customerId, artistId, orderId, orderDate) => {
  const fetchPromises = [];

  fetchPromises.push(
    User.findOne({
      where: { id: artistId },
      attributes: ['fcmToken'],
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

  const deviceToken = artist?.fcmToken || '';
  let additionalData = {
    orderId,
  };

  let notificationPayload = {
    customer: customer.fullName,
    orderDate,
  };

  sendNotificationToUser(NOTIFICATION_TYPE_CONSTANTS.NEW_ORDER_REQUEST, deviceToken, notificationPayload, additionalData);
};

module.exports = { sendNewOrderRequestNotification };
