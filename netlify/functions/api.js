const serverless = require('serverless-http');
const app = require('../../src/app');
const { initializeDatabaseConnectionForProd } = require('../../src/utils/database');

console.log(app, 'app000');

// Initialize database connection once at startup
initializeDatabaseConnectionForProd().catch((error) => {
  console.error('Initial database connection failed:', error.message);
  process.exit(1);
});

// No need to define routes here since they are already defined in app.js
module.exports.handler = serverless(app);
