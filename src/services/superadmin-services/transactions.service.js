const httpStatus = require('http-status');
const { User, Transaction, Order, CustomerInfo, ArtistTransfer, ArtistInfo, PayoutTransaction } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const {
  GET_ALL_TRANSACIONS_FOR_ARTIST_SEARCH_QUERY,
} = require('../../search-queries/get-all-transactions-for-artist-search-query');

/**
 * Common fn for get transactions for customers
 * @param {object} query
 * @returns {Promise<Transaction>}
 */
const getTransactions = async (txnCondition, query) => {
  let { page, size, searchToken, status, paymentType, startDate, endDate } = query;

  if (searchToken || status || paymentType || (startDate && endDate)) {
    searchToken = searchToken && searchToken.trim();
    txnCondition = {
      ...txnCondition,
      ...GET_ALL_TRANSACIONS_FOR_ARTIST_SEARCH_QUERY(searchToken, status, paymentType, startDate, endDate),
    };
  }

  const transactionAttrs = [
    'id',
    'customerId',
    'cfOrderId',
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
    {
      model: Order,
      as: 'order',
      attributes: ['orderIdentity', 'transactionId', 'status', 'createdAt'],
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

/**
 * Get all transactions for all customers
 * @param {object} query
 * @returns {Promise<Transaction>}
 */
exports.getAllTransactionsForAllCustomersService = async (query) => {
  const allTxns = await getTransactions({}, query);
  return allTxns;
};

/**
 * Get all transactions for customer
 * @param {string} customerId
 * @param {object} query
 * @returns {Promise<PayoutTransaction>}
 */
exports.getAllTransactionsForCustomerService = async (customerId, query) => {
  const customer = await User.findByPk(customerId);
  if (!customer) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not exists');
  }

  let txnCondition = { customerId };

  const allTxnForCustomer = await getTransactions(txnCondition, query);

  return allTxnForCustomer;
};

/**
 * Get all transactions for artist
 * @param {string} artistId
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Transaction>}
 */
exports.getAllTransactionsForArtistService = async (artistId, page, size) => {
  const artist = await User.findByPk(artistId);

  if (!artist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Artist not exists in the system for whom you are trying to fetch transactions'
    );
  }

  const include = [
    {
      model: ArtistTransfer,
      as: 'payoutTransfer',
      where: { artistId },
      required: true,
      attributes: ['payoutId', 'artistId', 'transactionId', 'transferAmount', 'createdAt'],
      include: [
        {
          model: ArtistInfo,
          as: 'payoutArtistInfo',
          attributes: ['status', 'fullName', 'businessName', 'email', 'profilePic'],
        },
        {
          model: Order,
          as: 'orders',
          attributes: ['orderIdentity', 'status'],
          through: {
            attributes: [],
          },
          include: [
            {
              model: Transaction,
              as: 'orderTxn',
              attributes: ['id', 'cfPaymentId', 'paymentStatus', 'paymentAmount', 'paymentType'],
            },
          ],
        },
      ],
    },
  ];

  const allTxnForArtist = await getPaginationDataFromModel(PayoutTransaction, {}, page, size, include);

  return allTxnForArtist;
};
