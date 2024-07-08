const serverless = require('serverless-http');
const app = require('../../src/app');
const fetch = require('node-fetch');
const logger = require('../../src/config/logger');

const initializeDatabaseConnectionForProd = async () => {
  try {
    const response = await fetch('https://jade-marigold-3eeaba.netlify.app/.netlify/functions/connect-db');
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

// Initialize database connection once at startup
initializeDatabaseConnectionForProd().catch((error) => {
  logger.error('Initial database connection failed:', error);
  process.exit(1);
});

// Your existing routes and logic
app.get('/api/v1/hello', (req, res) => res.send('Hello World!'));

module.exports.handler = serverless(app);
