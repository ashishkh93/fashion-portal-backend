const express = require('express');
const multer = require('multer');
const validate = require('../../../middlewares/validate');
const { artistControllers, superAdminControllers } = require('../../../controllers');
const { artistValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');
const transactionMiddleware = require('../../../middlewares/transaction');
const fileUpload = require('../../../middlewares/multerUpload');

const router = express.Router();

const uploadImage = multer({ storage: fileUpload() });

router
  .route('/:artistId')
  .post(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    validate(artistValidation.addArtistInfo),
    transactionMiddleware,
    artistControllers.artistInfoController.addArtistInfo
  )
  .get(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    validate(artistValidation.getArtistInfo),
    artistControllers.artistInfoController.getArtistInfo
  )
  .patch(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    validate(artistValidation.editArtistInfo),
    transactionMiddleware,
    artistControllers.artistInfoController.editArtistInfo
  );

router.patch(
  '/:artistId/update-upi',
  auth(),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
  validate(artistValidation.editUpi),
  artistControllers.artistInfoController.editUpi
);

router.post(
  '/:artistId/upload-private-image',
  auth(),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
  uploadImage.single('file'),
  superAdminControllers.serviceController.uploadFile
);

router.get(
  '/:artistId/get-private-image',
  auth(),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
  superAdminControllers.serviceController.getPrivateImageUrl
);

module.exports = router;
