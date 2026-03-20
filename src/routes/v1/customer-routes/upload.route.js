const express = require('express');
const multer = require('multer');
const { commonControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

const storage = multer.memoryStorage();
const uploadImage = multer({ storage: storage });

router.post(
  '/public',
  auth(),
  customerValidate((req) => req.params.customerId),
  uploadImage.single('file'),
  commonControllers.uploadController.uploadPublicFile
);

module.exports = router;
