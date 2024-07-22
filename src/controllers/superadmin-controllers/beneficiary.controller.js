const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const addBeneToCF = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const beneData = await superAdminServices.beneficiaryService.addBeneToCFService(artistId);
  res
    .status(httpStatus.OK)
    .send({ status: true, message: 'Artist added as benificary to cashfree payout dashboard', entity: beneData || null });
});

module.exports = {
  addBeneToCF,
};
