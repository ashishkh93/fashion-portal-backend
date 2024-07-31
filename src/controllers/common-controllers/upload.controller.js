const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { uploadPublicFileToBucket } = require('../../services/s3/s3-services');

const uploadPublicFile = catchAsync(async (req, res) => {
  const fileUrl = await uploadPublicFileToBucket(req);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Image uploaded!', entity: fileUrl });
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
  uploadFiles,
  uploadPublicFile,
};
