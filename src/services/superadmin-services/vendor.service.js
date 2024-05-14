const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { CashfreeUtil } = require('../../utils/cashfree.util');
const config = require('../../config/config');

const xAPiVersion = config.cashfree.apiVersion;

/**
 * Add vendor in the cashfree merchant dashboard for split payment
 * @param {object} body
 * @param {string} artistId
 * @returns {Promise}
 */
const addVendorToCFService = async (body, artistId) => {
  try {
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Split order payment to the vendor account from admin account via UPI (or bank acc)
 * @param {object} body
 * @param {string} artistId
 * @returns {Promise}
 */
const splitPaymentToVendorService = async (body, artistId) => {
  try {
    const onDemandPay = await CashfreeUtil.PGESCreateOnDemandTransfer(xAPiVersion, 'testvendor1', '', '', {
      transfer_from: 'MERCHANT',
      transfer_type: 'ADJUSTMENT',
      transfer_amount: 100,
      remark: 'Testing',
    });
    if (onDemandPay.data) {
      return onDemandPay.data;
    }
  } catch (error) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error?.response?.data?.message || error.message || 'Internal Server Error'
    );
  }
};

module.exports = {
  addVendorToCFService,
  splitPaymentToVendorService,
};
