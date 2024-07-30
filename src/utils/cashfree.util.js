const { Cashfree } = require('cashfree-pg');
const config = require('../config/config');
const { generateXCFSignature } = require('./common.util');

Cashfree.XClientId = config.cashfree.clientId;
Cashfree.XClientSecret = config.cashfree.clientSecret;
Cashfree.XEnvironment = Cashfree.Environment[config.cashfree.env];

const getSignature = (clientId) => {
  return generateXCFSignature(clientId);
};

module.exports = { CashfreeUtil: Cashfree, getSignature };
