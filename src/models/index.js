const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const cls = require('cls-hooked');
const config = require('../config/config');

const basename = path.basename(__filename);

const namespace = cls.createNamespace('fashion-portal');
Sequelize.useCLS(namespace);

const sequelize = new Sequelize(config.mysql.db_name, config.mysql.user, config.mysql.pass, {
  host: config.mysql.host,
  port: config.mysql.db_port,
  dialect: 'postgres',
  operatorsAliases: false,
  timezone: '+05:30', //for writing to database
  // dialectOptions: {
  //   connectTimeout: 6000, // Increase timeout to 20000ms (20 seconds)
  // },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

const db = {};

// Load each model file
fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
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
db.namespace = namespace;

module.exports = db;
