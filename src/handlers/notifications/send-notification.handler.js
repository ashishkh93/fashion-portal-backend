const { FirebaseAdminUtil } = require('../../utils/firebase-admin.util');
const notificationJson = require('../../locales/notifications/en.json');
const logger = require('../../config/logger');

const replaceDynamicPlaceholders = (str = '', data) => {
  return str.replace(/<(\w+)>/g, (_, key) => {
    return data[key] !== undefined ? data[key] : `<${key}>`;
  });
};

const sendNotificationToUser = async (type, deviceToken, notificationPayload, additionalData = {}) => {
  const firebase = new FirebaseAdminUtil();
  const admin = firebase.fb_admin;

  const fcmPayload = notificationJson[type]['messages']['fcm']; // getting fcm payload data
  const title = fcmPayload.title;
  const body = replaceDynamicPlaceholders(fcmPayload.body, notificationPayload);
  const screen = fcmPayload.screen;

  additionalData = { ...additionalData, screen };

  const message = {
    notification: {
      title,
      body,
    },
    data: additionalData,
    token: deviceToken,
  };

  try {
    await admin.messaging().send(message);
    logger.info(`Notification sent for type: ` + type);
  } catch (error) {
    logger.error(
      `Notification failed to sent due to : ` + error.message + ' FOR NOTIFICATION MESSAGE ' + JSON.stringify(message)
    );
  }
};

module.exports = { sendNotificationToUser };
