const { Cashfree } = require('cashfree-pg');
const config = require('../config/config');

Cashfree.XClientId = config.cashfree.clientId;
Cashfree.XClientSecret = config.cashfree.clientSecret;
Cashfree.XEnvironment = Cashfree.Environment[config.cashfree.env];

module.exports = { CashfreeUtil: Cashfree };
