const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const getAllOrders = catchAsync(async (req, res) => {
  const allOrders = await superAdminServices.orderService.getAllOrdersService(req.query);
  res.status(httpStatus.OK).send({ status: true, message: 'All orders fetched!', entity: allOrders });
});

const getAllOrdersForSingleArtist = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const ordersForArtist = await superAdminServices.orderService.getAllOrdersForSingleArtistService(artistId, req.query);
  res.status(httpStatus.OK).send({ status: true, message: 'Orders for artist fetched!', entity: ordersForArtist });
});

const getAllOrdersForSingleCustomer = catchAsync(async (req, res) => {
  const { customerId } = req.params;
  const ordersForArtist = await superAdminServices.orderService.getAllOrdersForSingleCustomerService(customerId, req.query);
  res.status(httpStatus.OK).send({ status: true, message: 'Orders for artist fetched!', entity: ordersForArtist });
});

const getSingleOrderByOrderId = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const singleOrder = await superAdminServices.orderService.getSingleOrderForAdminService(orderId);
  res.status(httpStatus.OK).send({ status: true, message: 'Order fetched!', entity: singleOrder });
});

module.exports = {
  getAllOrders,
  getAllOrdersForSingleArtist,
  getAllOrdersForSingleCustomer,
  getSingleOrderByOrderId,
};
