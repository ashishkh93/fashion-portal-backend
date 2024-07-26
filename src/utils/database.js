// src/utils/database.js

const { Sequelize } = require('sequelize');
const pg = require('pg');
const config = require('../config/config');
const logger = require('../config/logger');

const sequelize = new Sequelize(config.mysql.dbString, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: (msg) => {
    if (config.env !== 'production') {
      return logger.info(msg);
    }
    return null;
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    connectTimeout: 60000,
  },
});

const initializeDatabaseConnectionForProd = async () => {
  try {
    const response = await fetch('https://jade-marigold-3eeaba.netlify.app/.netlify/functions/connect-db', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error(`Failed to fetch: ${response.status} ${response.statusText}`);
      logger.error(`Response body: ${text}`);
      throw new Error('Failed to fetch database connection status');
    }

    const result = await response.json();
    logger.info('Database connection result: ' + result.message);

    if (result.message === 'Database connection established') {
      logger.info('Database connection initialized');
    } else {
      throw new Error('Failed to initialize database connection');
    }
  } catch (error) {
    logger.error('Error connecting to database: ', error.message);
    throw error;
  }
};

module.exports = { sequelize, initializeDatabaseConnectionForProd };
