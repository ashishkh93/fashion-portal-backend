const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices, artistServices } = require('../../services');

const getAllArtist = catchAsync(async (req, res) => {
  const allArtists = await superAdminServices.infoService.getAllArtistService(req.query);
  res.status(httpStatus.OK).send({ status: true, message: 'Artists fetched successfully', entity: allArtists });
});

const getArtistInfo = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const artistInfo = await superAdminServices.infoService.getArtistInfoService(artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Artist info fetched successfully', entity: artistInfo });
});

const getAllArtsForSingleArtist = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const arts = await superAdminServices.infoService.getAllArtsForSingleArtistInAdminService(artistId, req.query);
  res.status(httpStatus.OK).send({ status: true, message: 'Arts for artist fetched successfully', entity: arts });
});

const getSingleArt = catchAsync(async (req, res) => {
  const { artistId, artId } = req.params;
  const singleArt = await artistServices.artService.getSingleArtService(artistId, artId);
  res.status(httpStatus.OK).send({ status: true, message: 'Art fetched successfully', entity: singleArt });
});

const getAllCustomers = catchAsync(async (req, res) => {
  const allArtists = await superAdminServices.infoService.getAllCustomersService(req.query);
  res.status(httpStatus.OK).send({ status: true, message: 'Customers fetched successfully', entity: allArtists });
});

const getCustomerInfo = catchAsync(async (req, res) => {
  const { customerId } = req.params;
  const artistInfo = await superAdminServices.infoService.getCustomerInfoService(customerId);
  res.status(httpStatus.OK).send({ status: true, message: 'Customer info fetched successfully', entity: artistInfo });
});

const getAllArts = catchAsync(async (req, res) => {
  const allArtists = await superAdminServices.infoService.getAllArtsService(req.query);
  res.status(httpStatus.OK).send({ status: true, message: 'Arts fetched successfully', entity: allArtists });
});

module.exports = {
  getAllArtist,
  getArtistInfo,
  getAllArtsForSingleArtist,
  getSingleArt,
  getAllCustomers,
  getCustomerInfo,
  getAllArts,
};
