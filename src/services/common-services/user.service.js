const httpStatus = require('http-status');
const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const tokenService = require('./token.service');
const { FirebaseAdminUtil } = require('../../utils/firebase-admin.util');
const { getPlainData } = require('../../utils/common.util');
const { createOtpRequest } = require('./otp.service');
const { getTransaction } = require('../../middlewares/asyncHooks');

// to remove path from cahche, when all imports are okay, and still you are getting an errpr
// delete require.cache[require.resolve('./token.service')];

const { User, OtpRequest } = db;

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<customers>}
 */
const createUser = async (userBody) => {
  const user = await customers.create(userBody);
  return user;
};

/**
 * Update a user
 * @param {Object} userBody
 * @param {string} userId
 * @returns {Promise<User>}
 */
const updateUserById = async (userBody, userId) => {
  const updatedUser = await User.update(userBody, { where: { id: userId } });
  return updatedUser;
};

const createUserPhoneAuth = async (userBody) => {
  const transaction = getTransaction();
  const { phone, role } = userBody;
  const user = await User.findOne({ where: { phone: phone, role: role } });
  // if (user && (await user.isPhoneNumberTaken(phone, role))) {
  if (user) {
    // const updateBody = { otp: userBody.otp, otpExpire: userBody.otpExpire };
    // await updateUserById(updateBody, user.id);
    await createOtpRequest(user.id, 'LOGIN');
    return user.id;
  } else {
    const newUser = await User.create(userBody, { transaction });
    await createOtpRequest(newUser.id, 'LOGIN', transaction);
    return newUser.id;
  }
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findByPk(id);
};

/**
 * Get customers By Phone
 * @param {ObjectId} phone
 * @returns {Promise<customers>}
 */
const getUserByPhoneAndRole = async (phone, role, userId) => {
  const promises = [];
  promises.push(User.findOne({ where: { phone, role } }));
  promises.push(OtpRequest.findOne({ where: { userId, isVerified: false, context: 'LOGIN' } }));
  const [user, existingOtpRequest] = await Promise.all(promises);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No User registered with this phone number');
  }

  if (!existingOtpRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid or expired OTP');
  }

  return { user: getPlainData(user), existingOtpRequest };
};

/**
 * Updated FCM Token in user table
 * @param {string} fcmToken
 * @param {string} userId
 */
const updateFcmTokenService = async (fcmToken, userId) => {
  const user = await getUserById(userId);
  if (user) {
    const {
      dataValues: { fcmTokens },
    } = user;

    if (!fcmTokens?.includes(fcmToken)) {
      const newFcmTokens = [...fcmTokens, fcmToken];
      await user.update({ fcmTokens: newFcmTokens });
    }
  } else throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
};

/**
 * Verify User Otp and create user in firebase if not exist
 * @param {Object} body
 * @returns {Promise<customers>}
 */
const verifyUserOtp = async (body, role, userId) => {
  const { phone, otp } = body;

  const { user, existingOtpRequest } = await getUserByPhoneAndRole(phone, role, userId);
  const validOtpForDev = otp === '123456';

  if (otp === existingOtpRequest.otp || validOtpForDev) {
    if (Date.now() < existingOtpRequest.otpExpiration || validOtpForDev) {
      const updateBody = { isVerified: true };
      if (role !== 'superAdmin') {
        /**
         * Check if user is exist in firebase, if not then create it with phoneNumber
         */
        const fb_admin = new FirebaseAdminUtil();
        await fb_admin.checkUserAndCreate(phone);
      }

      const updatePromises = [];
      updatePromises.push(tokenService.generateAuthTokens(user));
      if (!validOtpForDev) updatePromises.push(existingOtpRequest.update(updateBody));

      const [tokens] = await Promise.all(updatePromises);

      const resToSend = { id: user.id, phone: user.phone, role: user.role, fcmTokens: user.fcmTokens };
      return { ...resToSend, ...tokens };
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired');
    }
  } else throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
};

/**
 * Verify User Otp and create user in firebase if not exist
 * @param {Object} body
 * @returns {Promise<customers>}
 */
// const verifyArtistOtp = async (body, role) => {
//   const { phone, otp } = body;

//   const artist = await User.findOne({
//     where: { phone, role },
//     include: [
//       {
//         model: ArtistInfo,
//         as: 'artistInfos',
//         include: [
//           {
//             model: ArtistBankingInfo,
//             as: 'artistBankingInfo',
//           },
//         ],
//       },
//     ],
//   });

//   const validOtpForDev = otp === 123456;

//   if (artist) {
//     const plainArtist = getPlainData(artist);
//     if (otp === plainArtist.otp || validOtpForDev) {
//       if (Date.now() < plainArtist.otpExpire || validOtpForDev) {
//         const updateBody = { otp: null, otpExpire: null };

//         /**
//          * Check if user is exist in firebase, if not then create it with phoneNumber
//          */
//         const fb_admin = new FirebaseAdminUtil();
//         await fb_admin.checkUserAndCreate(phone);

//         await updateUserById(updateBody, plainArtist.id);
//         const tokens = await tokenService.generateAuthTokens(plainArtist);

//         let isProfileAdded = !!plainArtist.artistInfos;
//         let isBankingAdded = !!plainArtist.artistInfos?.artistBankingInfo;

//         const resToSend = {
//           id: plainArtist.id,
//           phone: plainArtist.phone,
//           role: plainArtist.role,
//           isProfileAdded,
//           isBankingAdded,
//         };
//         return { ...resToSend, ...tokens };
//       } else {
//         throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired');
//       }
//     } else throw new ApiError(httpStatus.BAD_REQUEST, 'OTP did not match');
//   } else throw new ApiError(httpStatus.BAD_REQUEST, 'No User registered with this phone number');
// };

module.exports = {
  createUser,
  createUserPhoneAuth,
  getUserById,
  getUserByPhoneAndRole,
  updateUserById,
  verifyUserOtp,
  updateFcmTokenService,
};
