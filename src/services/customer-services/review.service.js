const httpStatus = require('http-status');
const { Review, Order, ArtistInfo, User } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPlainData } = require('../../utils/common.util');

const getApprovedArtistByStatus = async (artistId) => {
  const artist = await User.findOne({
    where: { id: artistId, role: 'artist', isActive: true },
    include: [
      {
        model: ArtistInfo,
        as: 'artistInfos',
        where: { status: 'APPROVED' },
      },
    ],
  });
  if (artist) {
    return artist;
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Artist is not approved yet');
  }
};

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
const createReviewForOrderService = async (customerId, orderId, body) => {
  await getApprovedArtistByStatus(body.artistId);
  const order = await Order.findOne({ where: { id: orderId, artistId: body.artistId } });

  if (!order) throw new ApiError(httpStatus.FORBIDDEN, `Order not found for the artist`);
  if (order.dataValues.status !== 'COMPLETED') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can not give review to this order');
  }
  /**
   * check that, the order has already got review or not
   */
  const curReview = await getReviewByOrderId(orderId);

  if (!curReview) {
    const reviewBody = { ...body, givenBy: customerId };
    const reviewResp = await Review.create(reviewBody);
    return reviewResp;
  } else {
    throw new ApiError(httpStatus.FORBIDDEN, 'Review already created for this order');
  }
};

/**
 * Create review for the order (actually for the artist)
 * @param {string} customerId
 * @param {object} body
 * @returns {Review}
 */
const updateReviewForOrderService = async (orderId, body) => {
  await getApprovedArtistByStatus(body.artistId);

  const curReview = await getReviewByOrderId(orderId);
  if (!curReview) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Review does not exist for an order');
  } else {
    const reviewBody = { description: body.description, reviewCount: body.reviewCount };
    const updateReviewRes = await Review.update(reviewBody, { where: { artistId: body.artistId } });
    return updateReviewRes;
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
  updateReviewForOrderService,
  getOrderReview,
};
