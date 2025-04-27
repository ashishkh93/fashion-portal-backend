const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');
const fs = require('fs');
var envpath = process.env.NODE_ENV == 'development' ? '../../.env' : '../../.env.production';

dotenv.config({ path: path.join(__dirname, envpath) });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    // DB_CONNECT_APP_URL: Joi.string(),
    DB: Joi.string().required().description('DB is required'),
    DB_HOST: Joi.string().required().description('Host is required'),
    DB_PORT: Joi.number().default(8081),
    DB_USER: Joi.string().required().description('USER is required'),
    DB_PASSWORD: Joi.string().allow(''),
    DB_NAME: Joi.string().required().description('Database name is required'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire required'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire required'),
    SMTP_HOST: Joi.string().description('server that will send the emails required'),
    SMTP_PORT: Joi.number().description('port to connect to the email server required'),
    SMTP_USERNAME: Joi.string().description('username for email server required'),
    SMTP_PASSWORD: Joi.string().description('password for email server required'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app required'),
    ENCRYPTION_ALGO: Joi.string().required().description('Cipher encryption algo required'),
    ENCRYPTION_KEY: Joi.string().required().description('Cipher encryption key required'),
    ADVANCE_AMOUNT_PT: Joi.number().required().description('Advance amount percentage for art'),
    CASHFREE_CLIENT_ID: Joi.string().required().description('Cashfree client id'),
    CASHFREE_CLIENT_SECRET: Joi.string().required().description('Cashfree client secret key'),
    CASHFREE_ENV: Joi.string().required().description('Cashfree environment'),
    CASHFREE_X_API_VERSION: Joi.string().required().description('Cashfree x api version'),
    CASHFREE_PAYOUT_API_BASE_URL: Joi.string().required().description('Cashfree Payout api base url'),
    CASHFREE_PAYOUT_GAMMA_API_BASE_URL: Joi.string().required().description('Cashfree Payout gamma api base url'),
    CASHFREE_VERIFY_PAN_API_URL: Joi.string().required().description('Cashfree Pan card verification url'),
    CASHFREE_PAYOUT_CLIENT_ID: Joi.string().required().description('Cashfree Payout client id'),
    CASHFREE_PAYOUT_CLIENT_SECRET: Joi.string().required().description('Cashfree Payout client secret'),
    CASHFREE_PAYOUT_X_API_VERSION: Joi.string().required().description('Cashfree Payout x api version'),
    CASHFREE_PAYOUT_FUND_SOURCE_ID: Joi.string().required().description('Cashfree Payout fund source id'),
    CASHFREE_PUBLIC_KEY_PEM: Joi.string().required().description('Cashfree public key pem'),
    COMISSION: Joi.number().required().description('Commission percentage per order'),
    OTP_EXPIRATION_MINUTES: Joi.number().required().default(10).description('OTP expiration time in minutes'),
    MIN_TIME_TO_ORDER: Joi.number().required().default(6).description('Minumum time to order in hours'),
    // FIREBASE_ADMIN_SERVICE_ACCOUNT_CREDENTIALS_BASE64: Joi.string()
    //   .required()
    //   .default(6)
    //   .description('Firebase admin service account credentials base64'),

    // AWS_ACCOUNT_ID: Joi.string().required().description('Aws IAM account id'),
    // AWS_ACCESS_KEY_ID: Joi.string().required().description('Aws access key'),
    // AWS_SECRET_ACCESS_KEY: Joi.string().required().description('Aws secret key'),
    // AWS_REGION: Joi.string().required().description('Aws region'),
    // AWS_BUCKET_NAME: Joi.string().required().description('Aws bucket'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  otp: {
    expiry: envVars.OTP_EXPIRATION_MINUTES,
  },
  mysql: {
    dbString: envVars.DB,
    // dbString:
    //   'postgresql://app:17G518Kh2r0BG08GFz0SDeJX@officially-neutral-anemone.a1.pgedge.io/fashion_portal?sslmode=require',
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
  encryptionKey: envVars.ENCRYPTION_KEY,

  /**
   * Advance amount percentage
   */
  pt: {
    advanceAmountPT: envVars.ADVANCE_AMOUNT_PT,
  },

  /**
   * cashfree secrets
   */
  cashfree: {
    clientId: envVars.CASHFREE_CLIENT_ID,
    clientSecret: envVars.CASHFREE_CLIENT_SECRET,
    env: envVars.CASHFREE_ENV, // cashfree environment
    apiVersion: envVars.CASHFREE_X_API_VERSION, // cashfree x-api-version
    payoutBaseUrl: envVars.CASHFREE_PAYOUT_API_BASE_URL, // cashfree x-api-version
    payoutGammaUrl: envVars.CASHFREE_PAYOUT_GAMMA_API_BASE_URL, // cashfree old api(gamma) base url
    panVerificationUrl: envVars.CASHFREE_VERIFY_PAN_API_URL,
    upiVerificationUrl: 'https://sandbox.cashfree.com/verification/upi',
    payoutClientId: envVars.CASHFREE_PAYOUT_CLIENT_ID, // cashfree x-api-version
    payoutClientSecret: envVars.CASHFREE_PAYOUT_CLIENT_SECRET, // cashfree x-api-version
    payoutApiVersion: envVars.CASHFREE_PAYOUT_X_API_VERSION, // cashfree x-api-version
    fundSourceId: envVars.CASHFREE_PAYOUT_FUND_SOURCE_ID, // cashfree x-api-version

    // public key pem path
    publicKeyPemPath: envVars.CASHFREE_PUBLIC_KEY_PEM_PATH, // cashfree x-api-version
    publicKeyPem: envVars.CASHFREE_PUBLIC_KEY_PEM, // cashfree x-api-version
  },
  /**
   * This is our commision in percentage
   */
  comission: envVars.COMISSION,
  order: {
    minTimeToOrder: envVars.MIN_TIME_TO_ORDER,
  },
  firebase: {
    serviceAccountKey: envVars.FIREBASE_ADMIN_SERVICE_ACCOUNT_CREDENTIALS_BASE64,
  },

  host: envVars.DB_HOST,
  db_port: envVars.DB_PORT,
  user: envVars.DB_USER,
  pass: envVars.DB_PASSWORD,
  db_name: envVars.DB_NAME,

  /** AWS configs */
  aws: {
    accountId: envVars.AWS_ACCOUNT_ID,
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    region: envVars.AWS_REGION,
    bucket: envVars.AWS_BUCKET_NAME,
  },
  /** Sequelize migrations configuration for dev and prod */
  development: {
    username: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
    host: envVars.DB_HOST,
    dialect: 'postgres',
    seederStorage: 'sequelize',
    // pool: {
    //   max: 5,
    //   min: 0,
    //   acquire: 30000, // Increase acquire timeout
    //   idle: 10000,
    // },
  },
  production: {
    username: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    dialect: 'postgres',
    seederStorage: 'sequelize',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000, // Increase acquire timeout
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Enable this since you'll provide the CA certificate
        // ca: fs.readFileSync(path.join(__dirname, '../../pem-config/ca.pem')).toString(),
      },
      connectTimeout: 60000,
    },
  },

  /** Upi verification api rate limit number */
  upiVerificationLimit: 10,
  maxBankingOTPAttempts: 3,
  upiVerificationTimeLimit: 10, // in minutes

  /** Artist Recent work images limitation */
  defaultRecentWorkImagesLimit: 15, // will increase in future as per requirements
  perOrderRecentWorkImagesLimit: 3, // will increase in future as per requirements

  /** Cancellation time after order create OR approve (IN MINUTES) */
  cancellationTimeFor3DaysThreshold: 72 * 60,
  cancellationTimeForWithin3DaysThreshold: 12 * 60,
};
