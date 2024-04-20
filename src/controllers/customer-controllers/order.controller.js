const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { customerServices } = require('../../services');

const orderInitate = catchAsync(async (req, res) => {
  const { customerId, artistId } = req.params;
  const { dataValues } = req.user;
  const order = await customerServices.orderService.orderInitiateService(customerId, artistId, req.body, dataValues);

  res.status(httpStatus.CREATED).send({ status: true, message: 'Order request initiated!', entity: order || null });
});

module.exports = {
  orderInitate,
};
