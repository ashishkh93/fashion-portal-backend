const express = require('express');
const validate = require('../../../middlewares/validate');
const serviceValidation = require('../../../validations/services.validation');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { adminValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router.post(
  '/add-category',
  auth('manageServices'),
  adminValidate,
  validate(serviceValidation.addCategory),
  superAdminControllers.categoryController.createCategory
);

router.get(
  '/get-all-categories',
  auth(),
  adminValidate,
  validate(serviceValidation.getCategories),
  superAdminControllers.categoryController.getAllCategories
);
router
  .route('/:catId')
  .get(
    auth(),
    adminValidate,
    validate(serviceValidation.getEditDeleteCategory),
    superAdminControllers.categoryController.getOneCategory
  )
  .put(
    auth('manageServices'),
    adminValidate,
    validate(serviceValidation.getEditDeleteCategory),
    superAdminControllers.categoryController.editCategory
  )
  .delete(
    auth('manageServices'),
    adminValidate,
    validate(serviceValidation.getEditDeleteCategory),
    superAdminControllers.categoryController.deleteCategory
  );

module.exports = router;
