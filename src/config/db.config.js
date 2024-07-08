const { Sequelize, DataTypes } = require('sequelize');
const pg = require('pg');
const cls = require('cls-hooked');
const config = require('./config');
const logger = require('./logger');

const namespace = cls.createNamespace('fashion-portal');
Sequelize.useCLS(namespace);

const sequelize = new Sequelize(config.mysql.dbString, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: (msg) => logger.info(msg),
});

const initializeDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = { sequelize, DataTypes, initializeDatabaseConnection };
