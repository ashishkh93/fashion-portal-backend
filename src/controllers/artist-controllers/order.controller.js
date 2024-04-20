const httpStatus = require('http-status');
const moment = require('moment');
const catchAsync = require('../../utils/catchAsync');
const { artistServices } = require('../../services');
moment.tz.setDefault('Asia/Calcutta');

const getAllOrders = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const { page, size } = req.query;
  const orders = await artistServices.orderService.getAllOrderForArtistService(artistId, page, size);

  if (orders.totalItems > 0) {
    res.status(httpStatus.OK).send({ status: true, message: 'Orders fetched!', entity: orders || [] });
  } else {
    res.status(httpStatus.OK).send({ status: true, message: 'No orders found', entity: null });
  }
});

const getSingleOrder = catchAsync(async (req, res) => {
  const { artistId, orderId } = req.params;
  const orders = await artistServices.orderService.getSingleOrderService(artistId, orderId);

  res.status(httpStatus.OK).send({ status: true, message: 'Order fetched!', entity: orders || [] });
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const { artistId, orderId } = req.params;
  await artistServices.orderService.updateOrderStatusService(artistId, orderId, req.body);

  res.status(httpStatus.OK).send({ status: true, message: 'Order status updated!', entity: req.body || null });
});

module.exports = {
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
};
