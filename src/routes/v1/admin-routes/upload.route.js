const express = require('express');
const multer = require('multer');
const validate = require('../../../middlewares/validate');
const serviceValidation = require('../../../validations/services.validation');
const { superAdminControllers, commonControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { adminValidate } = require('../../../middlewares/userValidate');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router({ mergeParams: true });

router.post(
  '/file',
  auth('manageServices'),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  upload.single('file'),
  commonControllers.uploadController.uploadPublicFile
);

// router.post(
//   '/upload-files',
//   auth('manageServices'),
//   uploadImage.array('files', 10),
//   superAdminControllers.serviceController.uploadFiles
// );

module.exports = router;
