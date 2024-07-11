const serverless = require('serverless-http');
const app = require('../../src/app');
const { initializeDatabaseConnectionForProd } = require('../../src/utils/database');

// Initialize database connection once at startup
initializeDatabaseConnectionForProd()
  .then(() => {
    console.log('Connected to database');
  })
  .catch((error) => {
    console.log('Initial database connection failed:', error.message);
    process.exit(1);
  });

// No need to define routes here since they are already defined in app.js
module.exports.handler = serverless(app);
