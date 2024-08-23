const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { vacationValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');
const transactionMiddleware = require('../../../middlewares/transaction');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    auth(),
    validate(vacationValidation.addVacation),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'vacation' })),
    artistControllers.vacationController.addVacation
  )
  .get(
    auth(),
    validate(vacationValidation.getAllVacations),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'vacation' })),
    artistControllers.vacationController.getAllVacations
  );

router
  .route('/:vacationId')
  .patch(
    auth(),
    validate(vacationValidation.editVacation),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'vacation' })),
    transactionMiddleware,
    artistControllers.vacationController.editVacation
  )
  .delete(
    auth(),
    validate(vacationValidation.deleteVacation),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'vacation' })),
    transactionMiddleware,
    artistControllers.vacationController.deleteVacation
  );

module.exports = router;
