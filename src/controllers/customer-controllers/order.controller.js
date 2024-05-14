const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { customerServices } = require('../../services');

const orderInitiate = catchAsync(async (req, res) => {
  const { customerId, artistId } = req.params;
  const { dataValues } = req.user;
  const order = await customerServices.orderService.orderInitiateService(customerId, artistId, req.body, dataValues);

  res.status(httpStatus.CREATED).send({ status: true, message: 'Order request initiated!', entity: order || null });
});

const fetchOrder = catchAsync(async (req, res) => {
  const { customerId, orderId } = req.params;
  const { dataValues } = req.user;
  const order = await customerServices.orderService.fetchOrderService(customerId, orderId, dataValues);

  res.status(httpStatus.OK).send({ status: true, message: 'Order fetched!', entity: order || null });
});

const fetchOrders = catchAsync(async (req, res) => {
  const { customerId } = req.params;
  const { page, size } = req.query;
  const { dataValues } = req.user;
  const orders = await customerServices.orderService.fetchOrdersService(customerId, page, size, dataValues);

  res.status(httpStatus.OK).send({ status: true, message: 'Orders fetched!', entity: orders || null });
});

const cancelOrderByUser = catchAsync(async (req, res) => {
  const { customerId, orderId } = req.params;
  const orders = await customerServices.orderService.cancelOrderByUserService(customerId, orderId, req.body);

  res.status(httpStatus.OK).send({ status: true, message: 'Order cancelled!', entity: null });
});

module.exports = {
  orderInitiate,
  fetchOrder,
  fetchOrders,
  cancelOrderByUser,
};
