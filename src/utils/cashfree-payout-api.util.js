const fetch = require('node-fetch');
const config = require('../config/config');
const ApiError = require('./ApiError');
const logger = require('../config/logger');
const httpStatus = require('http-status');
const { getSignature } = require('./cashfree.util');

const payoutBaseUrl = config.cashfree.payoutBaseUrl;
const panVerificationUrl = config.cashfree.panVerificationUrl;

const payoutClientId = config.cashfree.payoutClientId;
const payoutClientSecret = config.cashfree.payoutClientSecret;
const payoutApiVersion = config.cashfree.payoutApiVersion;

const payoutGammaUrl = config.cashfree.payoutGammaUrl;

const getCFAuthToken = async () => {
  const cfSignature = getSignature(payoutClientId);

  const authenticationTokenRes = await getAuthenticationTokenAPICallback(cfSignature);
  const { token } = authenticationTokenRes.data;
  return token;
};

const payoutAPICallback = async (method, body, endPoint) => {
  try {
    let url = `${payoutBaseUrl}${endPoint}`;

    let options = {
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
    logger.error(endPoint + ' api failed due to: ' + error.message);
    throw new ApiError(error.statusCode, error.message);
  }
};

const getAuthenticationTokenAPICallback = async (signature) => {
  try {
    let url = `${payoutGammaUrl}/authorize`;

    let options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-client-id': payoutClientId,
        'x-client-secret': payoutClientSecret,
        'x-cf-signature': signature,
      },
    };

    const authorizeResponse = await fetch(url, options);
    const result = await authorizeResponse.json();

    if (result.status === 'SUCCESS') {
      return result;
    } else {
      logger.error('authorization api failed due to: ', result?.message);
      throw new ApiError(result?.status || authorizeResponse.status, result?.message || 'Internal server error');
    }
  } catch (error) {
    logger.error('authorization api failed due to: ' + error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const verifyUPICallback = async (token, upi) => {
  try {
    let url = `${payoutGammaUrl}/validation/upiDetails?vpa=${upi}`;

    let options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const upiVerifyResponse = await fetch(url, options);
    const result = await upiVerifyResponse.json();

    if (result.status === 'SUCCESS') {
      return result;
    } else {
      logger.error('upi validation failed due to: ', result?.message);
      throw new ApiError(result?.status || upiVerifyResponse.status, result?.message || 'Internal server error');
    }
  } catch (error) {
    logger.error('upi validation failed due to: ' + error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const verifyPANCallback = async (pan) => {
  try {
    const signature = getSignature(payoutClientId);
    const panBody = { pan };

    let options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-client-id': payoutClientId,
        'x-client-secret': payoutClientSecret,
        'x-cf-signature': signature,
      },
      body: JSON.stringify(panBody),
    };

    const panVerifyResponse = await fetch(panVerificationUrl, options);
    const panVerifyresult = await panVerifyResponse.json();

    if (panVerifyresult) {
      return panVerifyresult;
    } else {
      logger.error('PAN verification failed due to: ', panVerifyresult?.message);
      throw new ApiError(
        panVerifyresult?.status || panVerifyResponse.status,
        panVerifyresult?.message || 'Internal server error'
      );
    }
  } catch (error) {
    logger.error('PAN verification failed due to: ' + error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  getCFAuthToken,
  payoutAPICallback,
  getAuthenticationTokenAPICallback,
  verifyUPICallback,
  verifyPANCallback,
};
