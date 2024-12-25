const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { customerServices } = require('../../services');

const getFilteredArtists = catchAsync(async (req, res) => {
  const { page, size } = req.query;
  const customerId = req.params.customerId;
  const artists = await customerServices.getArtistsService.getFilteredArtistsService(page, size, req.body, customerId);
  res.status(httpStatus.OK).send({ status: true, message: 'Artists fetched!', entity: artists || [] });
});

const getSingleArtist = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const artist = await customerServices.getArtistsService.getSingleArtistService(artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Artist fetched!', entity: artist || {} });
});

module.exports = {
  getFilteredArtists,
  getSingleArtist,
};
