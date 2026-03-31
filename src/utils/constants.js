const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/;

/**
 * Cashfree API error codes returned in error.response.data.code
 * Verify exact values by logging error.response.data when they occur in dev.
 */
const CASHFREE_ERROR_CODES = {
  ORDER_ALREADY_EXISTS: 'order_already_exists',
};

module.exports = {
  UPI_REGEX,
  CASHFREE_ERROR_CODES,
};
