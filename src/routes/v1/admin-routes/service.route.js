const express = require('express');
const multer = require('multer');
const validate = require('../../../middlewares/validate');
const serviceValidation = require('../../../validations/services.validation');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const fileUpload = require('../../../middlewares/multerUpload');
const { adminValidate } = require('../../../middlewares/userValidate');

const uploadImage = multer({ storage: fileUpload() });

const router = express.Router();

router.get('/get-all-services', auth(), adminValidate, superAdminControllers.serviceController.getAllServices);
router.post(
  '/add-service',
  auth('manageServices'),
  adminValidate,
  validate(serviceValidation.addService),
  superAdminControllers.serviceController.createService
);

router
  .route('/:serviceId')
  .get(
    auth(),
    adminValidate,
    validate(serviceValidation.getEditAndDeleteService),
    superAdminControllers.serviceController.getOneService
  )
  .put(
    auth('manageServices'),
    adminValidate,
    validate(serviceValidation.getEditAndDeleteService),
    superAdminControllers.serviceController.editService
  )
  .delete(
    auth('manageServices'),
    adminValidate,
    validate(serviceValidation.getEditAndDeleteService),
    superAdminControllers.serviceController.deleteService
  );

router.post(
  '/upload-file',
  auth('manageServices'),
  uploadImage.single('file'),
  superAdminControllers.serviceController.uploadFile
);

router.post(
  '/upload-files',
  auth('manageServices'),
  uploadImage.array('files', 10),
  superAdminControllers.serviceController.uploadFiles
);

module.exports = router;
