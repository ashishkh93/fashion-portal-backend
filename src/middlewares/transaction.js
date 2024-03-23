const onFinished = require('on-finished');
const { sequelize, namespace } = require('../models');
const logger = require('../config/logger');

const transactionMiddleware = async (req, res, next) => {
  namespace.bindEmitter(req);
  namespace.bindEmitter(res);
  namespace.bind(next);
  namespace.run(async () => {
    const transaction = await sequelize.transaction();
    namespace.set('transaction', transaction);
    onFinished(res, (err) => {
      if (transaction.finished) {
        logger.info('Transaction already finished with state: ' + transaction.finished);
        return;
      }

      if (!err) {
        transaction.commit();
      } else {
        transaction.rollback();
      }
    });
    next();
  });
};

module.exports = transactionMiddleware;
