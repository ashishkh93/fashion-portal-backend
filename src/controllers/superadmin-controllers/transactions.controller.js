const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

exports.getAllTransactionForAllCustomers = catchAsync(async (req, res) => {
  const allTxnForCustomer = await superAdminServices.transactionsService.getAllTransactionsForAllCustomersService(req.query);

  res
    .status(httpStatus.OK)
    .send({ status: true, message: 'All Transactions fetched for customer!', entity: allTxnForCustomer });
});

exports.getAllTransactionForCustomer = catchAsync(async (req, res) => {
  const { customerId } = req.params;
  const allTxnForCustomer = await superAdminServices.transactionsService.getAllTransactionsForCustomerService(
    customerId,
    req.query
  );

  res
    .status(httpStatus.OK)
    .send({ status: true, message: 'All Transactions fetched for customer!', entity: allTxnForCustomer });
});

exports.getAllTransactionForArtist = catchAsync(async (req, res) => {
  const { page, size } = req.query;
  const { artistId } = req.params;
  const allTxnForArtist = await superAdminServices.transactionsService.getAllTransactionsForArtistService(
    artistId,
    page,
    size
  );
  res.status(httpStatus.OK).send({ status: true, message: 'All Transactions fetched for artist!', entity: allTxnForArtist });
});
