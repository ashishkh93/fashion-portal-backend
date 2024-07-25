const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { uploadPrivateImage, getPrivateImageUrl, uploadPublicFileToBucket } = require('../../services/s3/s3-services');

const uploadPrivateFile = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const file = req.file;
  // const fileRes = { fileName: file.originalname, url: file.path };

  const fileRes = await uploadPrivateImage(file, artistId, false);

  res.status(httpStatus.CREATED).send({ status: true, message: 'Image uploaded successfully', entity: fileRes });
});

const getPrivateImage = catchAsync(async (req, res) => {
  const { artistId } = req.params;

  const fileUrl = await getPrivateImageUrl(
    artistId,
    'private/113beb5b-f74d-4106-bfa9-c9f5cf3f3a87/e56a6a1b-4277-4596-bfb2-7556a622b279_images.jpeg',
    false
  );

  res.status(httpStatus.OK).send({ status: true, message: 'Image url fetched!', entity: fileUrl });
});

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
  uploadPrivateFile,
  uploadFiles,
  getPrivateImage,
  uploadPublicFile,
};
