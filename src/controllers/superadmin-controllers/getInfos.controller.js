const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices, artistServices } = require('../../services');

const getAllArtist = catchAsync(async (req, res) => {
  const { page, size, searchToken } = req.query;
  const allArtists = await superAdminServices.infoService.getAllArtistService(page, size, searchToken);
  res.status(httpStatus.OK).send({ status: true, message: 'Artists fetched successfully', entity: allArtists });
});

const getArtistInfo = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const artistInfo = await superAdminServices.infoService.getArtistInfoService(artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Artist info fetched successfully', entity: artistInfo });
});

const getAllArts = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const arts = await superAdminServices.infoService.getAllArtsForAdminService(artistId, req.query);
  res.status(httpStatus.OK).send({ status: true, message: 'Arts fetched successfully', entity: arts });
});

const getSingleArt = catchAsync(async (req, res) => {
  const { artistId, artId } = req.params;
  const singleArt = await artistServices.artService.getSingleArtService(artistId, artId);
  res.status(httpStatus.OK).send({ status: true, message: 'Art fetched successfully', entity: singleArt });
});

const getAllReviews = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const { page, size } = req.query;
  const reviews = await artistServices.reviewService.getAllArtistReviewsForAdminService(artistId, page, size);
  res.status(httpStatus.OK).send({ status: true, message: 'Reviews fetched!', entity: reviews });
});

module.exports = {
  getAllArtist,
  getArtistInfo,
  getAllArts,
  getSingleArt,
  getAllReviews,
};
