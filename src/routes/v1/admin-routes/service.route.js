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

router
  .route('/:adminId')
  .get(
    auth(),
    adminValidate((req) => ({ superAdminId: req.params.adminId })),
    validate(serviceValidation.getAllService),
    superAdminControllers.serviceController.getAllServices
  )
  .post(
    auth('manageServices'),
    adminValidate((req) => ({ superAdminId: req.params.adminId })),
    validate(serviceValidation.addService),
    superAdminControllers.serviceController.createService
  );

router
  .route('/:adminId/:serviceId')
  .get(
    auth(),
    adminValidate((req) => ({ superAdminId: req.params.adminId })),
    validate(serviceValidation.getEditAndDeleteService),
    superAdminControllers.serviceController.getOneService
  )
  .put(
    auth('manageServices'),
    adminValidate((req) => ({ superAdminId: req.params.adminId })),
    validate(serviceValidation.getEditAndDeleteService),
    superAdminControllers.serviceController.editService
  )
  .delete(
    auth('manageServices'),
    adminValidate((req) => ({ superAdminId: req.params.adminId })),
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
