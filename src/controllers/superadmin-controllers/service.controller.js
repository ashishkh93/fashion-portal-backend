const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { mainArtService } = require('../../services/superadmin-services');

const createService = catchAsync(async (req, res) => {
  const addedService = await mainArtService.addService(req.body);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Service created successfully', entity: addedService });
});

const getAllServices = catchAsync(async (_req, res) => {
  const services = await mainArtService.getServices();
  res.status(httpStatus.CREATED).send({ status: true, message: 'Services fetched successfully', entity: services });
});

const getOneService = catchAsync(async (req, res) => {
  const serviceId = req.params.serviceId;
  const service = await mainArtService.getSingleService(serviceId);
  res.status(httpStatus.OK).send({ status: true, message: 'Service fetched successfully', entity: service });
});

const editService = catchAsync(async (req, res) => {
  const serviceId = req.params.serviceId;
  await mainArtService.editService(req.body, serviceId);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Service updated successfully', entity: req.body });
});

const deleteService = catchAsync(async (req, res) => {
  const serviceId = req.params.serviceId;
  await mainArtService.deleteService(serviceId);
  res.status(httpStatus.OK).send({ status: true, message: 'Service deleted successfully', entity: null });
});

const uploadFile = catchAsync(async (req, res) => {
  const file = req.file;
  const fileRes = { fileName: file.originalname, url: file.path };
  res.status(httpStatus.CREATED).send({ status: true, message: 'Image uploaded successfully', entity: fileRes });
});

const uploadFiles = catchAsync(async (req, res) => {
  const files = req.files;
  const filesRes = files?.map((file) => {
    return {
      fileName: file.originalname,
      url: file.path,
    };
  });

  res.status(httpStatus.CREATED).send({ status: true, message: 'Images uploaded successfully', entity: filesRes });
});

module.exports = {
  createService,
  getAllServices,
  getOneService,
  editService,
  deleteService,
  uploadFile,
  uploadFiles,
};
