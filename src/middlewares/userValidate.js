const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { ArtistInfo } = require('../models');
const { getUserById } = require('../services/common-services/user.service');

const adminValidate = (getUserId) => async (req, _res, next) => {
  try {
    const { superAdminId } = getUserId(req);
    const activeUser = req.user;

    if (!activeUser || activeUser.role !== 'superAdmin') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Access denied');
    } else if (activeUser.id !== superAdminId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You don’t have permission to access this resource!');
    }

    next();
  } catch (err) {
    next(err);
  }
};

const artistValidate = (getUserId) => async (req, _res, next) => {
  try {
    const { artistId, route } = getUserId(req);
    const activeUser = req.user;

    if (!activeUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
    } else if (activeUser.role !== 'artist') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Access denied');
    } else if (activeUser.id !== artistId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You don’t have permission to access this resource!');
    }

    const artist = await ArtistInfo.findOne({ where: { artistId } });

    if (route !== 'artistInfo') {
      if (artist.status === 'PENDING') {
        throw new ApiError(httpStatus.FORBIDDEN, 'You have not been approved yet by the admin');
      } else if (artist.status === 'BLOCKED' || artist.status === 'SUSPENDED' || artist.status === 'REJECTED') {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Your account has been ${artist.status}. Please contact admin ASAP`,
          artist.status
        );
      }
    }

    req.artist = artist;
    next();
  } catch (err) {
    next(err);
  }
};

const customerValidate = (getUserId) => async (req, _res, next) => {
  try {
    const userId = getUserId(req);
    const activeUser = req.user;
    if (!activeUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
    } else if (!activeUser?.isActive) {
      throw new ApiError(httpStatus.NOT_FOUND, 'You may have been blocked, please contact support team');
    } else if (activeUser.role !== 'customer') {
      new ApiError(httpStatus.UNAUTHORIZED, 'Access denied');
    } else if (userId !== activeUser.id) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You dont have permission to access this resource!');
    }

    next();
  } catch (err) {
    next(err);
  }
};

const userValidateWhileVerifyOTP = (getUserId) => async (req, _res, next) => {
  try {
    const userId = getUserId(req);
    const phone = req.body.phone;
    const user = await getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    } else if (user.phone !== phone) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You dont have permission to access this resource!');
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { artistValidate, adminValidate, customerValidate, userValidateWhileVerifyOTP };
