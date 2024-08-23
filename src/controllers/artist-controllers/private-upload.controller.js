const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { uploadPrivateImage, getPrivateImageUrl } = require('../../services/s3/s3-services');

const uploadPrivateFile = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const { privateDocKey } = req.body;
  
  const file = req.file;
  // const fileRes = { fileName: file.originalname, url: file.path };

  const fileRes = await uploadPrivateImage(file, artistId, false, privateDocKey);

  res.status(httpStatus.CREATED).send({ status: true, message: 'Image uploaded successfully', entity: fileRes });
});

const getPrivateImage = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const { key: s3Key } = req.body;

  const fileUrl = await getPrivateImageUrl(artistId, s3Key, false);

  res.status(httpStatus.OK).send({ status: true, message: 'Image url fetched!', entity: fileUrl });
});

module.exports = {
  uploadPrivateFile,
  getPrivateImage,
};
