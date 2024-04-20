const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { commonServices, artistServices } = require('../../services');
const ApiError = require('../../utils/ApiError');

const addArtistInfo = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const artistInfo = await artistServices.artistInfoService.addArtistInfoService(artistId, req.body);
  res
    .status(httpStatus.CREATED)
    .send({ status: true, message: 'Profile information added successfully', entity: artistInfo });
});

const getArtistInfo = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const artistInfo = await artistServices.artistInfoService.getArtistInfoService(artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Profile information fetched successfully', entity: artistInfo });
});

const editArtistInfo = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  await artistServices.artistInfoService.editArtistInfoService(artistId, req.body, req.artist);
  res.status(httpStatus.OK).send({ status: true, message: 'Profile information edited successfully', entity: req.body });
});

module.exports = {
  addArtistInfo,
  getArtistInfo,
  editArtistInfo,
};
