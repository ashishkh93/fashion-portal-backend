const express = require('express');
const validate = require('../../../middlewares/validate');
const serviceValidation = require('../../../validations/services.validation');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.post(
  '/add-category',
  auth('manageServices'),
  validate(serviceValidation.addCategory),
  superAdminControllers.categoryController.createCategory
);

router.get(
  '/get-all-categories',
  auth(),
  validate(serviceValidation.getCategories),
  superAdminControllers.categoryController.getAllCategories
);
router
  .route('/:catId')
  .get(auth(), validate(serviceValidation.getEditDeleteCategory), superAdminControllers.categoryController.getOneCategory)
  .put(auth('manageServices'), validate(serviceValidation.getEditDeleteCategory), superAdminControllers.categoryController.editCategory)
  .delete(
    auth('manageServices'),
    validate(serviceValidation.getEditDeleteCategory),
    superAdminControllers.categoryController.deleteCategory
  );

module.exports = router;
