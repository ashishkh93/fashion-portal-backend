// src/utils/database.js

// const fetch = require('node-fetch');
const logger = require('../config/logger');

const initializeDatabaseConnectionForProd = async () => {
  try {
    const response = await fetch('https://jade-marigold-3eeaba.netlify.app/.netlify/functions/connect-db', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Log the response status and text for debugging
      const text = await response.text();
      console.log(`Failed to fetch: ${response.status} ${response.statusText}`);
      logger.error(`Failed to fetch: ${response.status} ${response.statusText}`);
      logger.error(`Response body: ${text}`);
      throw new Error('Failed to fetch database connection status');
    }

    const result = await response.json();

    logger.info('Database connection result: ' + result.message);

    if (result.message === 'Database connection established') {
      logger.info('Database connection initialized');
      console.log('Database connection initialized');
    } else {
      console.log('Failed to initialize database connection');
      throw new Error('Failed to initialize database connection');
    }
  } catch (error) {
    console.log('Error connecting to database: ', error.message);
    logger.error('Error connecting to database: ', error.message);
    throw error;
  }
};

module.exports = { initializeDatabaseConnectionForProd };
