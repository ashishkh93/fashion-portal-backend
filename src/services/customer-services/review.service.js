const httpStatus = require('http-status');
const { Review, Order } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPlainData } = require('../../utils/common.util');
const { getApprovedArtist } = require('../artist-services/artist.service');

const getReviewByOrderId = async (orderId) => {
  const review = await Review.findOne({ where: { orderId } });
  if (review) {
    return getPlainData(review);
  }
  return null;
};

/**
 * Create review for the order (actually for the artist)
 * @param {string} customerId
 * @param {object} body
 * @returns {Review}
 */
const createReviewForOrderService = async (customerId, body) => {
  await getApprovedArtist(body.artistId);
  const order = await Order.findOne({ where: { id: body.orderId, artistId: body.artistId } });

  if (!order) throw new ApiError(httpStatus.FORBIDDEN, `Order not found for the artist`);
  if (order.dataValues.status !== 'COMPLETED') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can not give review to this order');
  }
  /**
   * check that, the order has already got review or not
   */
  const curReview = await getReviewByOrderId(body.orderId);

  if (!curReview) {
    const reviewBody = { ...body, givenBy: customerId };
    const reviewResp = await Review.create(reviewBody);
    return reviewResp;
  } else {
    throw new ApiError(httpStatus.FORBIDDEN, 'Review already created for this order');
  }
};

/**
 * Get order review by order id
 * @param {string} customerId
 * @param {string} orderId
 * @returns {object}
 */
const getOrderReview = async (orderId) => {
  const review = await getReviewByOrderId(orderId);
  if (review) {
    return review;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, "Review doesn't exist for the order");
  }
};

module.exports = {
  createReviewForOrderService,
  getOrderReview,
};
