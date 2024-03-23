const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { commonServices, artistServices } = require('../../services');
const ApiError = require('../../utils/ApiError');

const addArtistInfo = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const artistInfo = await artistServices.artistInfoService.addArtistInfoService(artistId, req.body);
  res
    .status(httpStatus.CREATED)
    .send({ status: true, message: 'Profile informations added successfully', entity: artistInfo });
});

module.exports = {
  addArtistInfo,
};
