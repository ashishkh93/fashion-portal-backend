const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const changeArtistStatus = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  await superAdminServices.infoService.updateArtistStatusService(req.body, artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Artist Status updated', entity: null });
});

const approveArt = catchAsync(async (req, res) => {
  const { artistId, artId } = req.params;
  await superAdminServices.infoService.approveArtStatusService(req.body, artistId, artId);
  res.status(httpStatus.OK).send({ status: true, message: 'Art status updated', entity: null });
});

const updateLatLong = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  await superAdminServices.infoService.updateLatLongService(req.body, artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Lat Long updated', entity: null });
});

const verifyUPI = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const upiValidateResponse = await superAdminServices.infoService.verifyUPIService(artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Upi verification done!', entity: upiValidateResponse || null });
});

module.exports = {
  approveArt,
  changeArtistStatus,
  updateLatLong,
  verifyUPI,
};
