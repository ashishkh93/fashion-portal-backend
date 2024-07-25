const { Order, User, ArtistInfo, CustomerInfo } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPlainData } = require('../../utils/common.util');
const { convertDateBasedOnTZ } = require('../../utils/moment.util');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { includeModelForOrderFetch } = require('../artist-services/order.service');

const includeModel = [
  {
    model: ArtistInfo,
    as: 'orderArtist',
    attributes: ['status', 'fullName', 'businessName', 'location', 'profilePic'],
  },
  {
    model: CustomerInfo,
    as: 'orderCustomer',
    attributes: ['status', 'fullName', 'profilePic', 'email'],
  },
];

/**
 * Get all orders for single artist
 * @param {String} artistId
 * @param {Number} page
 * @param {Number} size
 * @returns {Promise<Review>}
 */
const getAllOrdersForSingleArtistService = async (artistId, page, size) => {
  const orderCondition = { artistId };
  const allOrderForArtsit = await getPaginationDataFromModel(Order, orderCondition, page, size, [includeModel[0]]);

  return allOrderForArtsit;
};

/**
 * Get all orders for single artist
 * @param {String} customerId
 * @param {Number} page
 * @param {Number} size
 * @returns {Promise<Review>}
 */
const getAllOrdersForSingleCustomerService = async (customerId, page, size) => {
  const orderCondition = { customerId };
  const allOrderForArtsit = await getPaginationDataFromModel(Order, orderCondition, page, size, [includeModel[1]]);

  return allOrderForArtsit;
};

/**
 * Get all orders
 * @param {Number} page
 * @param {Number} size
 * @returns {Promise<Review>}
 */
const getAllOrdersService = async (page, size) => {
  const allOrdes = await getPaginationDataFromModel(Order, {}, page, size, includeModel);
  return allOrdes;
};

const getSingleOrderForAdminService = async (orderId) => {
  const orderCondition = { id: orderId };
  const include = [...includeModelForOrderFetch, includeModel[0]];

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
