const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');
var envpath = process.env.NODE_ENV == 'development' ? '../../.env' : '../../.env.production';
dotenv.config({ path: path.join(__dirname, envpath) });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    DB_HOST: Joi.string().required().description('Host is required'),
    DB_PORT: Joi.number().default(8081),
    DB_USER: Joi.string().required().description('USER is required'),
    DB_PASSWORD: Joi.string().allow(''),
    DB_NAME: Joi.string().required().description('Database name is required'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    ENCRYPTION_ALGO: Joi.string().description('Cipher encryption algo'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mysql: {
    host: envVars.DB_HOST,
    db_port: envVars.DB_PORT,
    user: envVars.DB_USER,
    pass: envVars.DB_PASSWORD,
    db_name: envVars.DB_NAME,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: 10,
    createPasswordExpirationHours: 24,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  encryptionAlgo: envVars.ENCRYPTION_ALGO,
};
