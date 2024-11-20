const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { customerServices } = require('../../services');

const addOrRemoveFavorite = catchAsync(async (req, res) => {
  const { customerId } = req.params;
  await customerServices.favoriteService.addOrRemoveFavoriteService(customerId, req.body, res);
});

const getAllAFavArtists = catchAsync(async (req, res) => {
  const { customerId } = req.params;
  const favArtists = await customerServices.favoriteService.getAllAFavArtistsService(customerId);
  res.status(httpStatus.OK).send({ status: true, message: 'Favorite Artists fetched successfully', entity: favArtists });
});

module.exports = {
  addOrRemoveFavorite,
  getAllAFavArtists,
};
