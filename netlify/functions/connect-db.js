// YOUR_BASE_DIRECTORY/netlify/functions/connect-db.js

const { Sequelize } = require('sequelize');
const pg = require('pg');
const config = require('../../src/config/config');
const logger = require('../../src/config/logger');

let sequelize;

const connectToDatabase = async () => {
  if (!sequelize) {
    sequelize = new Sequelize(config.mysql.dbString, {
      dialect: 'postgres',
      dialectModule: pg,
      operatorsAliases: false,
      dialectOptions: {
        connectTimeout: 15000, // 30 seconds
      },
      logging: (msg) => logger.info(msg),
    });

    try {
      await sequelize.authenticate();
      logger.info('Connection has been established successfully.');
    } catch (err) {
      logger.error('Unable to connect to the database:', err.message || err);
      throw err;
    }
  }
  return sequelize;
};

exports.handler = async () => {
  try {
    await connectToDatabase();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Database connection established' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to connect to the database', error: err.message }),
    };
  }
};
