const httpStatus = require('http-status');
const { User, Transaction, CustomerInfo, ArtistInfo } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPlainData } = require('../../utils/common.util');
const { convertDateBasedOnTZ } = require('../../utils/moment.util');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { includeModelForOrderFetch } = require('../artist-services/order.service');

/**
 * Get all transactions for customer
 * @param {String} customerId
 * @param {Number} page
 * @param {Number} size
 * @returns {Promise<Transaction>}
 */
const getAllTransactionsForCustomerService = async (customerId, page, size) => {
  const customer = await User.findByPk(customerId);

  if (!customer) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Customer not exists in the system for whom you are trying to fetch transctions'
    );
  }

  const txnCondition = { customerId };
  const transactionAttrs = [
    'id',
    'paymentStatus',
    'paymentAmount',
    'paymentCurrency',
    'paymentMethod',
    'paymentType',
    'details',
    'createdAt',
  ];

  const include = [
    {
      model: CustomerInfo,
      as: 'customer',
      attributes: ['status', 'fullName', 'email', 'gender', 'profilePic', 'createdAt'],
      include: [
        {
          model: User,
          as: 'customerInfo',
          attributes: ['phone'],
        },
      ],
    },
  ];
  const allTxnForCustomer = await getPaginationDataFromModel(
    Transaction,
    txnCondition,
    page,
    size,
    include,
    transactionAttrs
  );

  return allTxnForCustomer;
};

module.exports = {
  getAllTransactionsForCustomerService,
};
