const { Order, OrderFinancialInfo, ArtistInfo, CustomerInfo } = require('../../models');
const { GET_ALL_ORDER_FOR_ARTIST_SEARCH_QUERY } = require('../../search-queries/get-all-orders-for-artist-search-query');
const ApiError = require('../../utils/ApiError');
const { getPlainData } = require('../../utils/common.util');
const { convertDateBasedOnTZ } = require('../../utils/moment.util');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { includeModelForOrderFetch } = require('../artist-services/order.service');

const includeModel = [
  {
    model: ArtistInfo,
    as: 'orderArtist',
    attributes: ['status', 'fullName', 'businessName', 'email', 'location', 'profilePic'],
  },
  {
    model: CustomerInfo,
    as: 'orderCustomer',
    attributes: ['status', 'fullName', 'profilePic', 'email'],
  },
  {
    model: OrderFinancialInfo,
    as: 'orderFinancialInfo',
    attributes: ['totalAmount', 'advanceAmountForOrder'],
  },
];

/**
 * Get all orders for single artist
 * @param {string} artistId
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Order>}
 */
const getAllOrdersForSingleArtistService = async (artistId, query) => {
  let { page, size, searchToken, status, startDate, endDate } = query;

  let orderCondition = { artistId };

  if (searchToken || status || (startDate && endDate)) {
    searchToken = searchToken && searchToken.trim();
    orderCondition = {
      ...orderCondition,
      ...GET_ALL_ORDER_FOR_ARTIST_SEARCH_QUERY(searchToken, status, startDate, endDate, 'customerSearch'),
    };
  }

  const allOrderForArtsit = await getPaginationDataFromModel(Order, orderCondition, page, size, includeModel);

  return allOrderForArtsit;
};

/**
 * Get all orders for single artist
 * @param {string} customerId
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Order>}
 */
const getAllOrdersForSingleCustomerService = async (customerId, query) => {
  let { page, size, searchToken, status, startDate, endDate } = query;

  let orderCondition = { customerId };

  if (searchToken || status || (startDate && endDate)) {
    searchToken = searchToken && searchToken.trim();
    orderCondition = {
      ...orderCondition,
      ...GET_ALL_ORDER_FOR_ARTIST_SEARCH_QUERY(searchToken, status, startDate, endDate, 'artistSearch'),
    };
  }

  const allOrderForArtsit = await getPaginationDataFromModel(Order, orderCondition, page, size, includeModel);

  return allOrderForArtsit;
};

/**
 * Get all orders
 * @param {object} query
 * @returns {Promise<Order>}
 */
const getAllOrdersService = async (query) => {
  let { page, size, searchToken, status, startDate, endDate } = query;

  let orderCondition = {};

  if (searchToken || status || (startDate && endDate)) {
    searchToken = searchToken && searchToken.trim();
    orderCondition = {
      ...orderCondition,
      ...GET_ALL_ORDER_FOR_ARTIST_SEARCH_QUERY(searchToken, status, startDate, endDate),
    };
  }

  const allOrdes = await getPaginationDataFromModel(Order, orderCondition, page, size, includeModel);
  return allOrdes;
};

/**
 * Get Single order by Id
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Order>}
 */
const getSingleOrderForAdminService = async (orderId) => {
  const orderCondition = { id: orderId };
  const include = [...includeModelForOrderFetch.slice(0, 2), ...includeModel.slice(0, 2)];

  const singleOrder = await Order.findOne({
    where: [orderCondition],
    attributes: { exclude: ['artIds'] },
    include: include,
  });
  if (singleOrder) {
    const plainOrder = getPlainData(singleOrder);
    const order = {
      ...plainOrder,
      createdAt: convertDateBasedOnTZ(plainOrder.createdAt),
      updatedAt: convertDateBasedOnTZ(plainOrder.updatedAt),
    };
    return order;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order not found, please provide valid orderId');
  }
};

module.exports = {
  getAllOrdersForSingleArtistService,
  getAllOrdersForSingleCustomerService,
  getAllOrdersService,
  getSingleOrderForAdminService,
};
