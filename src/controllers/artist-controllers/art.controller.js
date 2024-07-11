const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { artistServices } = require('../../services');

const addArt = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const art = await artistServices.artService.addArtService(artistId, req.body);
  res.status(httpStatus.CREATED).send({
    status: true,
    message: 'Art added successfully! Users will be able to see this art, once it is verified by the team!',
    entity: art,
  });
});

const getAllArts = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const { page, size } = req.query;

  const allArts = await artistServices.artService.getAllArtsService(artistId, page, size);
  if (allArts?.items?.length > 0) {
    res.status(httpStatus.OK).send({ status: true, message: 'Arts fetched successfully', entity: allArts });
  } else {
    res.status(httpStatus.OK).send({ status: true, message: 'No arts found' });
  }
});

const getSingleArt = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const artId = req.params.artId;
  const singleArt = await artistServices.artService.getSingleArtService(artistId, artId);
  res.status(httpStatus.OK).send({ status: true, message: 'Art fetched successfully', entity: singleArt });
});

const editArt = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const artId = req.params.artId;
  await artistServices.artService.editArtService(artistId, artId, req.body);
  res.status(httpStatus.OK).send({ status: true, message: 'Art updated successfully!', entity: req.body });
});

module.exports = {
  addArt,
  getAllArts,
  getSingleArt,
  editArt,
};
