const { Sequelize, DataTypes } = require('sequelize');
const pg = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../config/logger');

const basename = path.basename(__filename);
const isDev = config.env !== 'production';

const sequelize = new Sequelize(config.mysql.dbString, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: (msg) => {
    if (isDev) {
      return logger.info(msg);
    }
    return null;
  },
  dialectOptions: {
    ssl: {
      require: isDev ? false : true,
      rejectUnauthorized: false, // For self-signed certificates, set to true if using CA signed certs
    },
    connectTimeout: 60000, // Increase overall connection timeout
  },
  timezone: '+05:30', // for writing to database
});

sequelize
  .authenticate()
  .then(() => {
    logger.info('Connection has been established successfully.');
  })
  .catch((err) => {
    logger.error('Unable to connect to the database due to ' + err);
  });

const db = {};

// Load each model file
fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Apply associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
