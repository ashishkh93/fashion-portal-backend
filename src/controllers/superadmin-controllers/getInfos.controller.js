const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices, artistServices } = require('../../services');

const getAllArtist = catchAsync(async (req, res) => {
  const { page, size } = req.query;
  const allArtists = await superAdminServices.infoService.getAllArtistService(page, size);
  res.status(httpStatus.OK).send({ status: true, message: 'Artists fetched successfully', entity: allArtists });
});

const getArtistInfo = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const artistInfo = await superAdminServices.infoService.getArtistInfoService(artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Artist info fetched successfully', entity: artistInfo });
});

const getAllArts = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const { page, size } = req.query;
  const artistInfo = await superAdminServices.infoService.getAllArtsForAdminService(artistId, page, size);
  res.status(httpStatus.OK).send({ status: true, message: 'Arts fetched successfully', entity: artistInfo });
});

const getSingleArt = catchAsync(async (req, res) => {
  const { artistId, artId } = req.params;
  const singleArt = await artistServices.artService.getSingleArtService(artistId, artId);
  res.status(httpStatus.OK).send({ status: true, message: 'Art fetched successfully', entity: singleArt });
});

module.exports = {
  getAllArtist,
  getArtistInfo,
  getAllArts,
  getSingleArt,
};
