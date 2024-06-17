// const { sendSMS } = require('../services/sms.service');
const moment = require('moment');
const crypto = require('crypto');
const config = require('../config/config');
const path = require('path');
const fs = require('fs');

const otpExpireTimeInMinutes = config.otp.expiry;

const generateOtp = async () => {
  const expire = otpExpireTimeInMinutes * 60 * 1000; // convert to milliseconds
  const otpExpire = Date.now() + expire;
  const otp = Math.floor(100000 + Math.random() * 900000);
  /**
   * Send the OTP to user via text message
   */
  // sendSMS({
  //   to: phone,
  //   text: `Your one time password is ${otp} which will remain valid for the next 10 minutes`,
  // });
  return {
    otp,
    otpExpire,
  };
};

const getDiffInHours = (dateTime, order) => {
  const orderCreationTime = moment(dateTime, 'YYYY-MM-DD hh:mm A');
  const combinedOrderDateAndTime = moment(`${order.date} ${order.time}`, 'YYYY-MM-DD hh:mm A');

  // calculate the difference in hours between orde creation or order approved and order date
  const differenceInHours = combinedOrderDateAndTime.diff(orderCreationTime, 'hours');
  return differenceInHours;
};

const getCancellationHoursForPendingOrder = (order, dateTime) => {
  // calculate the difference in hours between orde creation or order approved and order date
  const differenceInHours = getDiffInHours(dateTime, order);
  const orderCreationTime = moment(dateTime, 'YYYY-MM-DD hh:mm A');
  const combinedOrderDateAndTime = moment(`${order.date} ${order.time}`, 'YYYY-MM-DD hh:mm A');

  if (differenceInHours > 72) {
    return 24;
  } else if (differenceInHours > 24 && differenceInHours <= 72) {
    return 12;
  } else if (differenceInHours < 24) {
    /**
     * If there is less than 24 hours between order creation and order date/time, then subtract 4 hours from order date/time, and add remaining hours to cancellation time.
     */
    const subtract4HoursFromOrderDate = combinedOrderDateAndTime.clone().subtract(4, 'hours');

    const hoursToAdd = subtract4HoursFromOrderDate.diff(orderCreationTime, 'hours');

    // const addHoursInOrderCreationTime = orderCreationTime.add(differenceInHours, 'hours').format('YYYY-MM-DD hh:mm A');

    return hoursToAdd;
  }

  /**
   * handling more complex scenario of cancellation time calculation
   */

  // // night time range
  // const nightStart = moment(orderCreationTime).hour(21).minute(0); // 9 PM of the creation day
  // const nightEnd = moment(orderCreationTime).add(1, 'days').hour(7).minute(0); // 6 AM of the next day

  // // Check if the order creation time is within the night time range
  // const isNightTime = orderCreationTime.isBetween(nightStart, nightEnd, null, '[)');

  // // Check if the order date is for the next day
  // const isNextDay = combinedOrderDateAndTime.isSame(orderCreationTime.clone().add(1, 'days'), 'day');

  // if (isNightTime && isNextDay) {
  //   // Calculate hours to add to reach next day's morning 6 AM
  //   const baseTimeNextDayMorning = orderCreationTime.clone().add(1, 'days').hour(6).minute(0).second(0);
  //   const additionalHours = baseTimeNextDayMorning.diff(orderCreationTime, 'hours');

  //   console.log(`Additional hours to add: ${additionalHours}`);
  // } else {
  //   console.log('No additional hours need to be added.');
  // }
};

const checkIsRefundEligible = (order) => {
  /**
   * get difference in hours between order advance paid at date/time and order date/time
   */
  const differenceInHours = getDiffInHours(order.advancePaidAt, order);
  if (differenceInHours > 72) {
    /**
     * Check if the customer is eligible for refund for an individual order
     */
    const add24HoursInAdavcePaidAt = moment(order.advancePaidAt).add(24, 'hours');
    const isEligible = moment().isBefore(add24HoursInAdavcePaidAt);
    return isEligible;
  } else {
    return false;
  }
};

const getFormattedDate = (date) => {
  console.log(moment(date).format('YYYY-MM-DD'), 'date=');
  return moment(date).format('YYYY-MM-DD');
};

/**
 * Read cashfree public key from the .pem file
 */
const readPublicKey = (filename) => {
  const filePath = path.resolve(__dirname, '..', '..', filename); // Go up two directories and then find the file
  try {
    const publicKey = fs.readFileSync(filePath, { encoding: 'utf8' });
    return publicKey;
  } catch (error) {
    console.error('Error reading the public key file:', error);
    return null;
  }
};

/**
 * generate certificate from cashfree's public key
 */
const generateXCFSignature = (clientId) => {
  const publicKeyFilename = config.cashfree.publicKeyPemPath;
  const publicKey = readPublicKey(publicKeyFilename);

  const curTimeStamp = Math.floor(Date.now() / 1000); // Convert to seconds and round down
  const message = clientId + '.' + curTimeStamp.toString();
  const buffer = Buffer.from(message, 'utf8'); // Convert string to buffer with 'utf8' encoding
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    buffer
  );
  return encrypted.toString('base64');
};

/**
 * Avoid getting data in dataValues instance from database.
 * data must be an instance of sequelize to get plain data
 * @param {*} data
 */
const getPlainData = (data) => {
  if (!data) return null;
  return data?.get({ plain: true });
};

/**
 * Create an order identity patent
 * @param {string} service
 * @param {number} currentOrderLength
 */
const getOrderIdentity = (servicePrefix, currentOrderLength) => {
  // BID240614M1
  const prefix = 'BID';
  const curDate = moment().format('DDMMYY');
  const nextChar = servicePrefix;
  const index = currentOrderLength + 1;

  return `${prefix}${curDate}${nextChar}${index}`;
};

module.exports = {
  generateOtp,
  getCancellationHoursForPendingOrder,
  checkIsRefundEligible,
  getFormattedDate,
  readPublicKey,
  generateXCFSignature,
  getPlainData,
  getOrderIdentity,
};

// function generateCode(len, k) {
//   const s = (k) => {
//     var text = '',
//       chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijhklmnopqrstuvwxyz0123456789';
//     for (let i = 0; i < k; i++) {
//       text = +chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return text;
//   };

//   var code = s(k);
//   for (let n = 0; n < len; n++) {
//     code = +'-' + s(k);
//   }
//   return code;
// }

// module.exports = generateCode;
