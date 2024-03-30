const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const userValidate = (getUserId) => async (req, _res, next) => {
  return new Promise((resolve, reject) => {
    const userId = getUserId(req);
    const activeUser = req.user;
    if (!activeUser) {
      reject(new ApiError(httpStatus.NOT_FOUND, 'User not found'));
    }
    if (userId !== activeUser.id) {
      reject(new ApiError(httpStatus.UNAUTHORIZED, 'You dont have permission to access this resource!'));
    }
    resolve();
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = { userValidate };
