const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { customerServices } = require('../../services');

const getFilteredArtists = catchAsync(async (req, res) => {
  const { page, size } = req.query;
  const artists = await customerServices.getArtistsService.getFilteredArtistsService(page, size, req.body);
  res.status(httpStatus.OK).send({ status: true, message: 'Artists fetched!', entity: artists || [] });
});

module.exports = {
  getFilteredArtists,
};
