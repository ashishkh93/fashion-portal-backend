const express = require('express');
const validate = require('../../../middlewares/validate');
const serviceValidation = require('../../../validations/services.validation');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { adminValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router
  .route('/:adminId')
  .post(
    auth('manageServices'),
    adminValidate((req) => ({ superAdminId: req.params.adminId })),
    validate(serviceValidation.addCategory),
    superAdminControllers.categoryController.createCategory
  )
  .get(
    auth(),
    adminValidate((req) => ({ superAdminId: req.params.adminId })),
    validate(serviceValidation.getCategories),
    superAdminControllers.categoryController.getAllCategories
  );
router
  .route('/:adminId/:catId')
  .get(
    auth(),
    adminValidate((req) => ({ superAdminId: req.params.adminId })),
    validate(serviceValidation.getEditDeleteCategory),
    superAdminControllers.categoryController.getOneCategory
  )
  .patch(
    auth('manageServices'),
    adminValidate((req) => ({ superAdminId: req.params.adminId })),
    validate(serviceValidation.getEditDeleteCategory),
    superAdminControllers.categoryController.editCategory
  )
  .delete(
    auth('manageServices'),
    adminValidate((req) => ({ superAdminId: req.params.adminId })),
    validate(serviceValidation.getEditDeleteCategory),
    superAdminControllers.categoryController.deleteCategory
  );

module.exports = router;
