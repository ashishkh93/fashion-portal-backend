const express = require('express');
const multer = require('multer');
const { artistControllers, commonControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');
const { artistValidation } = require('../../../validations');
const validate = require('../../../middlewares/validate');

const router = express.Router({ mergeParams: true });

const storage = multer.memoryStorage();
const uploadImage = multer({ storage: storage });

router
  .route('/private')
  .post(
    auth(),
    validate(artistValidation.uplodPrivateImage),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    uploadImage.single('file'),
    artistControllers.privateUploadController.uploadPrivateFile
  )
  .get(
    auth(),
    validate(artistValidation.getPrivateImage),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    artistControllers.privateUploadController.getPrivateImage
  );

router.post(
  '/public',
  auth(),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
  uploadImage.single('file'),
  commonControllers.uploadController.uploadPublicFile
);

router.post(
  '/recent-work',
  auth(),
  validate(artistValidation.uploadRecentWorkImage),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'uploadRecentWork' })),
  artistControllers.artistInfoController.uploadArtistRecentWorkImages
);

module.exports = router;
