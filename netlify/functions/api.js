const serverless = require('serverless-http');
const app = require('../../src/app');
const { initializeDatabaseConnectionForProd } = require('../../src/utils/database');
const db = require('../../src/models');

// Initialize database connection once at startup
initializeDatabaseConnectionForProd()
  .then(() => {
    console.log('Connected to database');
  })
  .catch((error) => {
    console.log('Initial database connection failed:', error.message);
    process.exit(1);
  });

// Ensure Sequelize models are ready
db.sequelize
  .authenticate()
  .then(() => {
    console.log('Sequelize models are ready');
  })
  .catch((error) => {
    console.log('Sequelize models initialization failed:', error.message);
    process.exit(1);
  });

module.exports.handler = serverless(app);
