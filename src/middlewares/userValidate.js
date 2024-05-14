const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { ArtistInfo } = require('../models');

const adminValidate = (getUserId) => async (req, _res, next) => {
  return new Promise(async (resolve, reject) => {
    const { superAdminId } = getUserId(req);
    const activeUser = req.user;

    if (!activeUser) {
      reject(new ApiError(httpStatus.NOT_FOUND, 'Super admin not exist'));
    } else if (activeUser.role !== 'superAdmin') {
      new ApiError(httpStatus.UNAUTHORIZED, 'Access denied');
    } else if (activeUser.id !== superAdminId) {
      reject(new ApiError(httpStatus.UNAUTHORIZED, 'You dont have permission to access this resource!'));
    } else {
      resolve();
    }
  })
    .then(() => next())
    .catch((err) => next(err));
};

const artistValidate = (getUserId) => async (req, _res, next) => {
  return new Promise(async (resolve, reject) => {
    const { artistId, route } = getUserId(req);
    const activeUser = req.user;

    if (!activeUser) {
      reject(new ApiError(httpStatus.NOT_FOUND, 'Artist not found'));
    } else if (activeUser.role !== 'artist') {
      new ApiError(httpStatus.UNAUTHORIZED, 'Access denied');
    } else if (activeUser.id !== artistId) {
      reject(new ApiError(httpStatus.UNAUTHORIZED, 'You dont have permission to access this resource!'));
    } else {
      const artist = await ArtistInfo.findOne({ where: { artistId } });

      if (route !== 'artistInfo') {
        if (artist.status === 'pending') {
          reject(new ApiError(httpStatus.NOT_FOUND, 'You have not been approved yet by the admin'));
        } else if (artist.status === 'blocked' || artist.status === 'suspended') {
          reject(
            new ApiError(
              httpStatus.NOT_FOUND,
              `Your account has been ${artist.status}. please contact admin ASAP`,
              artist.status
            )
          );
        }
      }
      req.artist = artist;
      resolve();
    }
  })
    .then(() => next())
    .catch((err) => next(err));
};

const customerValidate = (getUserId) => async (req, _res, next) => {
  return new Promise((resolve, reject) => {
    const userId = getUserId(req);
    const activeUser = req.user;
    if (!activeUser) {
      reject(new ApiError(httpStatus.NOT_FOUND, 'Customer not found'));
    } else if (!activeUser?.isActive) {
      reject(new ApiError(httpStatus.NOT_FOUND, 'You may have been blocked, please contact support team'));
    } else if (activeUser.role !== 'customer') {
      new ApiError(httpStatus.UNAUTHORIZED, 'Access denied');
    } else if (userId !== activeUser.id) {
      reject(new ApiError(httpStatus.UNAUTHORIZED, 'You dont have permission to access this resource!'));
    }
    resolve();
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = { artistValidate, adminValidate, customerValidate };
