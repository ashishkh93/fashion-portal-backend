const { FirebaseAdminUtil } = require('../../utils/firebase-admin.util');
const notificationJson = require('../../locales/notifications/en.json');
const logger = require('../../config/logger');
// const { Notification } = require('../../models');

/**
 * Replace message body with dynamic data
 * @param {string} str
 * @param {string} dataObj
 * @returns
 */
const replaceDynamicPlaceholders = (str = '', dataObj) => {
  return str.replace(/<(\w+)>/g, (_, key) => {
    return dataObj[key] !== undefined ? dataObj[key] : `<${key}>`;
  });
};

/**
 * Send notification to user via Firebase cloud messaging
 * @param {string} type
 * @param {string[]} deviceTokens
 * @param {string} notificationPayload
 * @param {object} additionalData
 * @param {string} userType
 */
const sendNotificationToUser = async (type, deviceTokens, notificationPayload, additionalData = {}, userType) => {
  if (!deviceTokens.length) return;

  const firebase = new FirebaseAdminUtil();
  const admin = firebase.fb_admin;

  const fcmPayload = notificationJson[type]['messages']['fcm']; // fcm payload data
  const title = fcmPayload.title;
  const body = replaceDynamicPlaceholders(fcmPayload.body, notificationPayload);
  const screen = fcmPayload.screen;

  additionalData = { ...additionalData, screen };

  const notificationModelEntry = {
    userId: additionalData.userId,
    userType,
    type,
    title,
    message: body,
    additionalDetails: additionalData,
  };

  try {
    const notificationPromises = [];

    // notificationPromises.push(Notification.create(notificationModelEntry));
    deviceTokens.forEach((deviceToken) => {
      const message = {
        notification: {
          title,
          body,
        },
        data: additionalData,
        token: deviceToken,
      };

      notificationPromises.push(admin.messaging().send(message));
    });

    await Promise.all(notificationPromises);
    logger.info(`Notification sent for type: ` + type + ' with data ' + JSON.stringify(notificationModelEntry));
  } catch (error) {
    logger.error(
      `Notification failed to sent due to : ` + error.message + ' with data ' + JSON.stringify({ ...notificationModelEntry })
    );
  }
};

module.exports = { sendNotificationToUser };
