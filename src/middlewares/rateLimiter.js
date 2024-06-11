// const rateLimit = require('express-rate-limit');

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 20,
//   skipSuccessfulRequests: true,
// });

// module.exports = {
//   authLimiter,
// };

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 20 * 1000, // 20 seconds
  max: 10, // Limit each IP to 1 request per `window` (20 seconds)
  message: 'You can only make one request every 20 seconds',
  skipSuccessfulRequests: false, // Do not skip successful requests
});

module.exports = {
  authLimiter,
};
