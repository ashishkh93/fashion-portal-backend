const httpStatus = require('http-status');
const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const tokenService = require('./token.service');
const { FirebaseAdminUtil } = require('../../utils/firebase-admin.util');
const { getPlainData, generateUserPublicId, getFirstCharOfString } = require('../../utils/common.util');
const { createOtpRequest } = require('./otp.service');
const { getTransaction } = require('../../middlewares/asyncHooks');

// to remove path from cahche, when all imports are okay, and still you are getting an errpr
// delete require.cache[require.resolve('./token.service')];

const { User, FirebaseUser, OtpRequest, SuperAdminInfo } = db;

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

  if (user) {
    await createOtpRequest(user.id, 'LOGIN');
    return user.id;
  } else {
    const type = role === 'artist' ? 'A' : 'C';

    const currentUsersCount = await User.count();
    const hash = generateUserPublicId(type, currentUsersCount);

    const newUser = await User.create({ ...userBody, publicHash: hash }, { transaction });
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
 * @param {object} body
 * @param {string} userId
 */
const addFcmTokenService = async (body, user) => {
  const currentFcmToken = await FirebaseUser.findOne({ where: { userId: user.id, fcmToken: body.fcmToken } });

  if (currentFcmToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Token already exists');
  }

  return await FirebaseUser.create({
    userId: user?.id,
    fcmToken: body.fcmToken,
    deviceInfo: body.deviceInfo,
  });
};

/**
 * Verify User Otp and create user in firebase if not exist
 * @param {Object} body
 * @returns {Promise<customers>}
 */
const verifyUserOtp = async (body, role, userId) => {
  const { phone, otp } = body;
  const transaction = getTransaction();

  const { user, existingOtpRequest } = await getUserByPhoneAndRole(phone, role, userId);
  const validOtpForDev = otp === '123456';
  let isNewFbUserCreated = false;
  let firebase_uid = user.firebase_uid;

  try {
    if (otp === existingOtpRequest.otp || validOtpForDev) {
      if (Date.now() < existingOtpRequest.otpExpiration || validOtpForDev) {
        const updateBody = { isVerified: true };
        const isSuperAdmin = role === 'superAdmin';

        let adminInfo = {};

        if (!isSuperAdmin) {
          /**
           * Check if user is exist in firebase, if not then create it with phoneNumber
           */
          if (!firebase_uid) {
            const roleFirstCharacter = getFirstCharOfString(role);
            const fb_admin = new FirebaseAdminUtil();
            const firebase_user = await fb_admin.createUser(phone, roleFirstCharacter);
            isNewFbUserCreated = true;
            firebase_uid = firebase_user?.uid;
          }
        } else {
          adminInfo = await SuperAdminInfo.findOne(
            { where: { superAdminId: user?.id }, raw: true },
            { attributes: ['fullName', 'email'] }
          );
        }

        const [tokens] = await Promise.all([
          tokenService.generateAuthTokens(user, transaction),
          user.firebase_uid !== firebase_uid
            ? User.update({ firebase_uid }, { where: { id: userId }, transaction })
            : Promise.resolve(),
          !validOtpForDev ? existingOtpRequest.update(updateBody, { transaction }) : Promise.resolve(),
        ]);

        let { fullName, email } = adminInfo || {};

        const resToSend = {
          id: user.id,
          phone: user.phone,
          role: user.role,
          ...(!isSuperAdmin ? { firebase_uid } : adminInfo && { fullName, email }),
        };
        return { ...resToSend, ...tokens };
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired');
      }
    } else throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  } catch (error) {
    if (isNewFbUserCreated && firebase_uid) {
      const fb_admin = new FirebaseAdminUtil();
      fb_admin.deleteUser(firebase_uid);
    }

    throw new ApiError(error?.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong');
  }
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
  addFcmTokenService,
};
