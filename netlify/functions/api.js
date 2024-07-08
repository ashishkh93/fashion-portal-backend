const serverless = require('serverless-http');
const app = require('../../src/app');
const fetch = require('node-fetch');
const logger = require('../../src/config/logger');
const ApiError = require('../../src/utils/ApiError');

const connectionString = 'https://jade-marigold-3eeaba.netlify.app/.netlify/functions/connect-db';

const initializeDatabaseConnectionForProd = async () => {
  try {
    logger.info('Initializing database connection with: ' + connectionString);
    const response = await fetch(connectionString);
    const result = await response.json();

    logger.info('Database connection result: ' + result.message);

    if (result.message === 'Database connection established') {
      logger.info('Database connection initialized');
    } else {
      throw new Error('Failed to initialize database connection');
    }
  } catch (error) {
    logger.error('Error connecting to database: ', error);
    throw error;
  }
};

app.use(async (req, res, next) => {
  try {
    await initializeDatabaseConnectionForProd();
    next();
  } catch (error) {
    console.log('Database connection error: ', error);
    next(error);
  }
});

// Your existing routes and logic
app.get('/api/v1/hello', (req, res) => res.send('Hello World!'));

module.exports.handler = serverless(app);
