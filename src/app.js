const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const bodyParser = require('body-parser');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const db = require('./models');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// re-sync database ---- SHOULD ONLY USE IN DEV ENVIRONMENT
// db.sequelize.sync({ alter: true }).then(() => {
//   console.log('Drop and re-sync db.');
// });

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
// const corsOptions = {
//     origin: 'http://localhost:3000',
// };
app.use(cors({ origin: '*' }));
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.get('/', (req, res) => res.send('Welcome to the fashion portal APIs!'));

// Apply transaction middleware to all routes
// app.use(transactionMiddleware);

// limit repeated failed requests to auth endpoints
// if (config.env === 'production') {
//   app.use('/api/v1/super-admin/auth', authLimiter);
//   app.use('/api/v1/artist/auth', authLimiter);
//   app.use('/api/v1/customer/auth', authLimiter);
// }

// v1 api routes
app.use('/api/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Resource not found'));
});
// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;
