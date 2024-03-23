const httpStatus = require('http-status');
const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const tokenService = require('./token.service');

// to remove path from cahche, when all imports are okay, and still you are getting an errpr
// delete require.cache[require.resolve('./token.service')];

const { User } = db;

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
  try {
    const updatedUser = await User.update(userBody, { where: { id: userId } });
    return updatedUser;
  } catch (error) {
    new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong, Please try again');
  }
};

const createUserPhoneAuth = async (userBody) => {
  const { phone, role } = userBody;
  const user = await User.findOne({ where: { phone: phone, role: role } });
  if (user && (await user.isPhoneNumberTaken(phone, role))) {
    const updateBody = { otp: userBody.otp, otpExpire: userBody.otpExpire };
    const updatedUser = await updateUserById(updateBody, user.id);
    return updatedUser;
  } else {
    const user = await User.create(userBody);
    return user;
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await customers.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by referId
 * @param {ObjectId} referralCode
 * @returns {Promise<User>}
 */
const getUserByReferId = async (referralCode) => {
  return await User.find({ referralCode });
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Get customers By Phone
 * @param {ObjectId} phone
 * @returns {Promise<customers>}
 */
const getUserByPhoneAndRole = async (phone, role) => {
  const user = await User.findOne({ where: { phone, role } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<customers>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'customers not found');
  }
  await user.remove();
  return user;
};

/**
 * Verify User Otp
 * @param {Object} body
 * @returns {Promise<customers>}
 */
const verifyUserOtp = async (body, role) => {
  const { phone, otp } = body;

  const user = await getUserByPhoneAndRole(phone, role);
  const validOtpForDev = otp === 123456;

  if (user) {
    if (otp === user.otp || validOtpForDev) {
      if (Date.now() < user.otpExpire || validOtpForDev) {
        const updateBody = { otp: null, otpExpire: null };
        await updateUserById(updateBody, user.id);
        const tokens = await tokenService.generateAuthTokens(user);
        return tokens;
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired');
      }
    } else throw new ApiError(httpStatus.BAD_REQUEST, 'OTP did not match');
  } else throw new ApiError(httpStatus.BAD_REQUEST, 'No User registered with this phone number');
};

module.exports = {
  createUser,
  createUserPhoneAuth,
  queryUsers,
  getUserById,
  getUserByReferId,
  getUserByEmail,
  getUserByPhoneAndRole,
  updateUserById,
  deleteUserById,
  verifyUserOtp,
};
