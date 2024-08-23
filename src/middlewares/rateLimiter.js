const rateLimit = require('express-rate-limit');

// const authLimiter = rateLimit({
//   windowMs: 20 * 1000, // 20 seconds
//   max: 2, // Limit each IP to 1 request per `window` (20 seconds)
//   headers: true,
//   message: 'You can only make one request every 20 seconds',
//   skipSuccessfulRequests: false, // Do not skip successful requests
//   handler: () => {
//     throw new ApiError(httpStatus.FORBIDDEN, 'Server is not responding to your request, please try after some time');
//   },
// });

const createRateLimiter = (options) => {
  return rateLimit({ headers: true, ...options });
};

module.exports = {
  createRateLimiter,
};
