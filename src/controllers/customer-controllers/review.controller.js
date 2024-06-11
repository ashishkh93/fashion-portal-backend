const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { customerServices } = require('../../services');

const createReviewForOrder = catchAsync(async (req, res) => {
  const { customerId } = req.params;
  const reviewResponse = await customerServices.reviewService.createReviewForOrderService(customerId, req.body);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Review added!', entity: reviewResponse });
});

const getOrderReview = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const review = await customerServices.reviewService.getOrderReview(orderId);
  res.status(httpStatus.OK).send({ status: true, message: 'Review fetched!', entity: review || null });
});

module.exports = {
  createReviewForOrder,
  getOrderReview,
};
