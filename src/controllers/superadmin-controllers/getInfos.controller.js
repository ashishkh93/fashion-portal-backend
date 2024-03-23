const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { mainArtService } = require('../../services/superadmin-services');
const { superAdminServices } = require('../../services');

const getAllArtist = catchAsync(async (req, res) => {
  const { page, size } = req;
  const allArtists = await superAdminServices.infoService.getAllArtistService(page, size);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Artists fetche successfully', entity: allArtists });
});

module.exports = {
  getAllArtist,
};
