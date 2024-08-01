const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { customerServices } = require('../../services');

const createReviewForOrder = catchAsync(async (req, res) => {
  const { customerId, orderId } = req.params;
  const reviewResponse = await customerServices.reviewService.createReviewForOrderService(customerId, orderId, req.body);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Review added!', entity: reviewResponse });
});

const updateReviewForOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  await customerServices.reviewService.updateReviewForOrderService(orderId, req.body);
  res.status(httpStatus.OK).send({ status: true, message: 'Review updated!' });
});

const getOrderReview = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const review = await customerServices.reviewService.getOrderReview(orderId);
  res.status(httpStatus.OK).send({ status: true, message: 'Review fetched!', entity: review || null });
});

module.exports = {
  createReviewForOrder,
  updateReviewForOrder,
  getOrderReview,
};
