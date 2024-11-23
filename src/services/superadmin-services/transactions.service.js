const httpStatus = require('http-status');
const { User, Transaction, CustomerInfo, Transfer, ArtistInfo, PayoutTransaction } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');

/**
 * Get all transactions for customer
 * @param {string} customerId
 * @param {number} page
 * @param {number} size
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

/**
 * Get all transactions for artist
 * @param {string} artistId
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Transaction>}
 */
const getAllTransactionsForArtistService = async (artistId, page, size) => {
  const artist = await User.findByPk(artistId);

  if (!artist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Artist not exists in the system for whom you are trying to fetch transactions'
    );
  }

  const include = [
    {
      model: Transfer,
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
      ],
    },
  ];

  const allTxnForArtist = await getPaginationDataFromModel(PayoutTransaction, {}, page, size, include);

  return allTxnForArtist;
};

module.exports = {
  getAllTransactionsForCustomerService,
  getAllTransactionsForArtistService,
};
