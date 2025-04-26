const { FirebaseAdminUtil } = require('../../utils/firebase-admin.util');
const notificationJson = require('../../locales/notifications/en.json');
const logger = require('../../config/logger');
const { Notification } = require('../../models');

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
exports.sendNotificationToUser = async (type, deviceTokens, notificationPayload, additionalData = {}, userType) => {
  const firebase = new FirebaseAdminUtil();
  const admin = firebase.fb_admin;

  const fcmPayload = notificationJson[type]['messages']['fcm'];
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

  let notificationRecord;

  try {
    // 1. Create Notification entry first
    notificationRecord = await Notification.create(notificationModelEntry);

    if (!!deviceTokens.length) {
      const sendResults = await Promise.allSettled(
        deviceTokens.map((deviceToken) => {
          const message = {
            notification: { title, body },
            data: additionalData,
            token: deviceToken,
          };

          return admin.messaging().send(message);
        })
      );

      const allSucceeded = sendResults.every((r) => r.status === 'fulfilled');

      if (allSucceeded) {
        await notificationRecord.update({ sentStatus: 'SUCCESS' });
        logger.info('Notification sent successfully for type: ' + type);
      } else {
        await notificationRecord.update({ sentStatus: 'FAILED' });

        // Get failure reasons and log them
        const failureReasons = sendResults.filter((r) => r.status === 'rejected').map((r) => r.reason.message || r.reason);

        logger.error(`Some notifications failed to send for type: ${type}. Reasons: ${JSON.stringify(failureReasons)}`);
      }
    } else {
      await notificationRecord.update({ sentStatus: 'FAILED' });
      logger.error('No device tokens available to send notification.');
    }
  } catch (error) {
    if (notificationRecord) {
      await notificationRecord.update({ sentStatus: 'FAILED' });
    }
    logger.error(
      'Notification failed to sent due to : ' + error.message + ' with data ' + JSON.stringify({ ...notificationModelEntry })
    );
  }
};
