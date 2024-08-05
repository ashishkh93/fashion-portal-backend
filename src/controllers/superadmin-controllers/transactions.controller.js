const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const getAllTransactionForCustomer = catchAsync(async (req, res) => {
  const { page, size } = req.query;
  const { customerId } = req.params;
  const allTxnForCustomer = await superAdminServices.transactionsService.getAllTransactionsForCustomerService(
    customerId,
    page,
    size
  );
  res
    .status(httpStatus.OK)
    .send({ status: true, message: 'All Transactions fetched for customer!', entity: allTxnForCustomer });
});

const getAllTransactionForArtist = catchAsync(async (req, res) => {
  const { page, size } = req.query;
  const { artistId } = req.params;
  const allTxnForArtist = await superAdminServices.transactionsService.getAllTransactionsForArtistService(
    artistId,
    page,
    size
  );
  res
    .status(httpStatus.OK)
    .send({ status: true, message: 'All Transactions fetched for artist!', entity: allTxnForArtist });
});

module.exports = {
  getAllTransactionForCustomer,
  getAllTransactionForArtist,
};
