// const { sendSMS } = require('../services/sms.service');
const moment = require('moment');
const crypto = require('crypto');
const _ = require('lodash');
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

const getDiffInMinutes = (dateTime, order) => {
  const orderCreationTime = moment(dateTime, 'YYYY-MM-DD hh:mm A');
  const combinedOrderDateAndTime = moment(`${order.date} ${order.time}`, 'YYYY-MM-DD hh:mm A');

  // calculate the difference in hours between orde creation or order approved and order date
  const diffInMinutes = combinedOrderDateAndTime.diff(orderCreationTime, 'minutes');
  return diffInMinutes;
};

const getCancellationHoursForPendingOrder = (order, dateTime) => {
  // calculate the difference in hours between orde creation or order approved and order date
  const differenceInMins = getDiffInMinutes(dateTime, order);
  const orderCreationTime = moment(dateTime, 'YYYY-MM-DD hh:mm A');
  const combinedOrderDateAndTime = moment(`${order.date} ${order.time}`, 'YYYY-MM-DD hh:mm A');

  if (differenceInMins > 72 * 60) {
    return config.cancellationTimeFor3DaysThreshold;
  } else if (differenceInMins > 24 * 60 && differenceInMins <= 72 * 60) {
    return config.cancellationTimeForWithin3DaysThreshold;
  } else if (differenceInMins <= 24 * 60) {
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
  const differenceInMins = getDiffInMinutes(order.advancePaidAt, order);
  if (differenceInMins > 72 * 60) {
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
  const publicKeyBase64 = config.cashfree.publicKeyPem;
  const publicKey = Buffer.from(publicKeyBase64, 'base64').toString();

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

// const generateXCFSignature = (clientId) => {
//   const publicKeyFilename = config.cashfree.publicKeyPemPath;
//   const publicKey = readPublicKey(publicKeyFilename);

//   const curTimeStamp = Math.floor(Date.now() / 1000); // Convert to seconds and round down
//   const message = clientId + '.' + curTimeStamp.toString();
//   const buffer = Buffer.from(message, 'utf8'); // Convert string to buffer with 'utf8' encoding
//   const encrypted = crypto.publicEncrypt(
//     {
//       key: publicKey,
//       padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
//     },
//     buffer
//   );
//   return encrypted.toString('base64');
// };

/**
 * Avoid getting data in dataValues instance from database.
 * data must be an instance of sequelize to get plain data
 * @param {*} data
 */
const getPlainData = (data) => {
  if (!data) return null;
  return data?.get({ plain: true });
};

const randomSuffix = () => Math.random().toString(36).substring(2, 4).toUpperCase();

/**
 * Create an order identity patent
 * @param {string} servicePrefix
 * @param {number} currentOrderLength
 */
const getOrderIdentity = (servicePrefix, currentOrderLength) => {
  /**
   * @input = servicePrefix & ordersLength
   * @format = BID + DDMMYY (Current Date In Format) + SERVICE_PREFIX + (ORDER_LENGTH + 1)
   * @output = BID040425M1
   */
  const prefix = 'BID';
  const curDate = moment().format('DDMMYY');
  const nextChar = servicePrefix;
  const index = currentOrderLength + 1;

  return `${prefix}${curDate}${nextChar}${index}${randomSuffix()}`;
};

/**
 * Generate a human-readable public identity string for Users or Artists
 *
 * @input = userType (e.g., 'C' for Customer, 'A' for Artist) & current user count for the day
 * @format = UID + DDMMYY (Current Date in Format) + USER_TYPE_CODE + (INDEX + 1)
 * @output = UID080424C12  // Example: 12th customer created on 08-Apr-2024
 *
 * @param {string} userType - One-letter code for user type ('C' for Customer, 'A' for Artist)
 * @param {number} currentIndex - Total number of users of this type created today
 * @returns {string} - A unique, human-readable user identity string
 */
const generateUserPublicId = (type, index) => {
  const prefix = 'UID';
  const curDate = moment().format('DDMMYY');
  const typeCode = type?.toUpperCase() || 'X';
  const nextIndex = index + 1;

  return `${prefix}${curDate}${typeCode}${nextIndex}${randomSuffix()}`; // e.g., UID080424C12Z3
};

/**
 * Generate a human-readable, unique hash for Art
 *
 * @format = ART + DDMMYY + ARTIST_INITIAL + INDEX
 * @example = ART080424S5  → 5th artwork on 08-Apr-2024 by artist starting with S
 *
 * @param {string} artistName - Name of the artist (to get first character)
 * @param {number} index - Count of arts created on the same day
 * @returns {string}
 */
const generateArtPublicHash = (artistName, index) => {
  const prefix = 'ART';
  const date = moment().format('DDMMYY');
  const initial = artistName?.trim()?.[0]?.toUpperCase() || 'X';
  const artIndex = index + 1;

  return `${prefix}${date}${initial}${artIndex}${randomSuffix()}`;
};

/**
 * Get average rating of artist
 */
const getAverageRatingOfArtistRawQuery = (artistAlias = 'ArtistInfo') => {
  return `COALESCE(
            (
              SELECT AVG("artistReview"."reviewCount")
              FROM "Review" AS "artistReview"
              WHERE "artistReview"."artistId" = "${artistAlias}"."artistId"
            ), 0)`;
};

/**
 * Checking that, if the order date is in between the artist's vacaion date, then the order must not be initiated
 * @param {string} orderDate
 * @param {Array} vacations
 * @returns
 */
const artistIsOnVacation = (orderDate, vacations) => {
  return _.some(vacations, (v) => moment(orderDate).isBetween(v.startDate, v.endDate, null, '[]'));
};

/**
 * Get unique temporory Id from artist Id
 * @param {string} artistId
 * @returns
 */
const getUniqueTempId = (artistId) => {
  if (!artistId) return null;
  const parseArtistId = artistId.split('-')[0];
  const curDate = Date.now();
  const tempId = parseArtistId + '_' + curDate;
  return tempId;
};

/**
 *
 * @param {string} str
 */
const getFirstCharOfString = (str) => {
  if (!str) return '';
  return str?.charAt(0);
  // return str?.charAt(0)?.toUpperCase();
};

const isMockUpi = (upi) => {
  const splitUpi = upi.split('@');
  if (splitUpi[1] === 'apupi') {
    return true;
  }
  return false;
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
  generateUserPublicId,
  generateArtPublicHash,
  getAverageRatingOfArtistRawQuery,
  artistIsOnVacation,
  getUniqueTempId,
  getFirstCharOfString,
  isMockUpi,
};
