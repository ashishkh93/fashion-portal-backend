const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { artistServices } = require('../../services');

const addArtistInfo = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const artistInfo = await artistServices.artistInfoService.addArtistInfoService(artistId, req.body);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Profile information added!', entity: artistInfo });
});

const getArtistInfo = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const artistInfo = await artistServices.artistInfoService.getArtistInfoService(artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Profile information fetched!', entity: artistInfo });
});

const editArtistInfo = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  await artistServices.artistInfoService.editArtistInfoService(artistId, req.body, req.artist);
  res.status(httpStatus.OK).send({ status: true, message: 'Profile information edited!', entity: req.body });
});

const editUpi = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  await artistServices.artistInfoService.editArtistUPIService(artistId, req.body, req.artist);
  res.status(httpStatus.OK).send({ status: true, message: 'Upi updated!', entity: req.body });
});

const getArtistStatus = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const artistStatus = await artistServices.artistInfoService.getArtistStatusService(artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Artist status fetched!', entity: artistStatus });
});

const uploadArtistRecentWorkImages = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const newRecentWorkImages = await artistServices.artistInfoService.uploadArtistRecentWorkImagesService(
    artistId,
    req.body,
    req.artist
  );
  res.status(httpStatus.OK).send({ status: true, message: 'Recent work images added!', entity: newRecentWorkImages });
});

const removeArtistRecentWorkImages = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const newRecentWorkImages = await artistServices.artistInfoService.removeArtistRecentWorkImagesService(
    req.body,
    req.artist
  );
  res.status(httpStatus.OK).send({ status: true, message: 'Deleted!', entity: newRecentWorkImages });
});

module.exports = {
  addArtistInfo,
  getArtistInfo,
  editArtistInfo,
  editUpi,
  getArtistStatus,
  uploadArtistRecentWorkImages,
  removeArtistRecentWorkImages,
};
