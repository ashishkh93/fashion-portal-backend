const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const userValidation = require('../../../validations/user.validation');
const userController = require('../../../controllers/customer-controllers/user.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:userId')
  .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

router
  .route('/:userId/updateProfile')
  .post(auth('getUsers'), validate(userValidation.updateProfile), userController.updateUserProfile);

router
  .route('/:userId/getImageUploadURL')
  .get(auth('getUsers'), validate(userValidation.updateProfile), userController.getImageUploadURL);

router.route('/:userId/wallet').get(auth('getUsers'), validate(userValidation.getWallet), userController.getWallet);

module.exports = router;
