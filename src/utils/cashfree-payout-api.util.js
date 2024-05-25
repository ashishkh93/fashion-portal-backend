const fetch = require('node-fetch');
const config = require('../config/config');
const ApiError = require('./ApiError');
const logger = require('../config/logger');

const payoutBaseUrl = config.cashfree.payoutBaseUrl;
const payoutClientId = config.cashfree.payoutClientId;
const payoutClientSecret = config.cashfree.payoutClientSecret;
const payoutApiVersion = config.cashfree.payoutApiVersion;

const payoutAPICallback = async (method, body, endPoint) => {
  try {
    let url = `${payoutBaseUrl}${endPoint}`;

    const options = {
      method,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-version': payoutApiVersion,
        'x-client-id': payoutClientId,
        'x-client-secret': payoutClientSecret,
      },
    };

    if (method === 'POST') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    return response;
  } catch (error) {
    logger.error('payout api failed due to: ' + error.message);
    throw new ApiError(error.statusCode, error.message);
  }
};

module.exports = {
  payoutAPICallback,
};
