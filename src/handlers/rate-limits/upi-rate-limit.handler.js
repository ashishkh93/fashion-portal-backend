const httpStatus = require('http-status');
const { createRateLimiter } = require('../../middlewares/rateLimiter');
const ApiError = require('../../utils/ApiError');
const config = require('../../config/config');

const verifyUPIRateLimiter = (app) => {
  const upiVerifyRoutes = [
    '/api/v1/super-admin/:adminId/verify/:artistId/upi',
    '/api/v1/artist/:artistId/verification/upi',
    // '/api/v1/artist/:artistId/banking',
  ];

  const upiRateLimitOptions = {
    windowMs: 5 * 60 * 1000,
    max: config.upiVerificationLimit,
    skipSuccessfulRequests: false,
    handler: () => {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Too many UPI verification attempts. Please wait for a few minutes before trying again. This is to ensure the security of your UPI verification process.'
      );
    },
  };

  upiVerifyRoutes.forEach((route) => {
    app.use(route, createRateLimiter(upiRateLimitOptions));
  });
};

module.exports = { verifyUPIRateLimiter };
