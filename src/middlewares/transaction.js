// const onFinished = require('on-finished');
// const { sequelize, namespace } = require('../models');
// const logger = require('../config/logger');

// const transactionMiddleware = async (req, res, next) => {
//   namespace.bindEmitter(req);
//   namespace.bindEmitter(res);
//   namespace.bind(next);
//   namespace.run(async () => {
//     const transaction = await sequelize.transaction();
//     namespace.set('transaction', transaction);
//     onFinished(res, (err) => {
//       if (transaction.finished) {
//         logger.info('Transaction already finished with state: ' + transaction.finished);
//         return;
//       }

//       if (!err) {
//         transaction.commit();
//       } else {
//         transaction.rollback();
//       }
//     });
//     next();
//   });
// };

// module.exports = transactionMiddleware;

const { sequelize } = require('../models');
const asyncHooks = require('../middlewares/asyncHooks');
const logger = require('../config/logger');

const transactionMiddleware = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  asyncHooks.setTransaction(transaction);

  res.on('finish', async () => {
    if (transaction.finished) {
      logger.info('Transaction already finished with state: ' + transaction.finished);
      return;
    }

    if (res.statusCode < 400) {
      await transaction.commit();
    } else {
      await transaction.rollback();
    }
  });

  next();
};

module.exports = transactionMiddleware;
