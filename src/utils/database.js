// src/utils/database.js
const fetch = require('node-fetch');
const logger = require('../config/logger');

const initializeDatabaseConnectionForProd = async () => {
  try {
    const response = await fetch('https://jade-marigold-3eeaba.netlify.app/netlify/functions/connect-db');
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

module.exports = { initializeDatabaseConnectionForProd };
