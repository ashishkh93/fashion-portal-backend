const httpStatus = require('http-status');
const moment = require('moment');
const _ = require('lodash');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');
const {
  Transaction,
  PayoutTransaction,
  RefundTransaction,
  Payout,
  Transfer,
  Order,
  OrderFinancialInfo,
} = require('../../models');
const logger = require('../../config/logger');
const { getPlainData } = require('../../utils/common.util');

const pgWebhookTransaction = async (req, res) => {
  try {
    const webhookReqBody = req.body.data;

    console.log(webhookReqBody, 'webhookReqBody===');

    const cfOrderId = webhookReqBody.order.order_id;
    const isAdvancePayment = cfOrderId.startsWith('ADVANCE');
    const isFinalPayment = cfOrderId.startsWith('FINAL');

    let actualOrderId = '';
    if (isAdvancePayment) {
      const advance = 'ADVANCE_';
      actualOrderId = cfOrderId.substring(advance.length);
    } else if (isFinalPayment) {
      const final = 'FINAL_';
      actualOrderId = cfOrderId.substring(final.length);
    }

    const createTransactionBody = {
      cfOrderId: actualOrderId,
      cfPaymentId: webhookReqBody.payment.cf_payment_id?.toString(),
      userId: webhookReqBody.customer_details.customer_id,
      paymentStatus: webhookReqBody.payment.payment_status,
      paymentAmount: webhookReqBody.payment.payment_amount,
      paymentCurrency: webhookReqBody.payment.payment_currency,
      paymentMethod: webhookReqBody.payment.payment_method,
      paymentType: isAdvancePayment ? 'advance' : 'final',
      details: req.body.data,
    };
    const newTrn = await Transaction.create(createTransactionBody);
    if (newTrn) {
      if (!!actualOrderId) {
        let orderUpdateBody = {
          transactionId: newTrn.id,
        };
        if (isFinalPayment) {
          orderUpdateBody.status = 'COMPLETED';
        }

        await Order.update(orderUpdateBody, { where: { id: actualOrderId } });

        let advancedPaid = false;
        if ((isAdvancePayment && webhookReqBody.payment.payment_status === 'SUCCESS') || isFinalPayment) {
          advancedPaid = true;
        }

        let orderFinancialInfoUpdateBody = {
          advanceAmountPaid: advancedPaid,
        };

        if (advancedPaid) {
          orderFinancialInfoUpdateBody.advancePaidAt = moment();
        }

        await OrderFinancialInfo.update(orderFinancialInfoUpdateBody, { where: { orderId: actualOrderId } });
      }

      logger.info('Transaction created for order: ' + actualOrderId);
      res.status(httpStatus.CREATED).send({ status: true, message: 'Transaction created', entity: newTrn });
    } else {
      logger.error('Transaction not created, something went wrong');
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Transaction not created, something went wrong');
    }
  } catch (error) {
    logger.error('Transaction not created, something went wrong with reason: ' + error.message);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Transaction not created, something went wrong'
    );
  }
};

const refundWebhookTransaction = async (req, res) => {
  try {
    const webhookRefundBody = req.body.data?.refund;
    const existingRefundTxn = await RefundTransaction.findOne({
      where: {
        cfPaymentId: webhookRefundBody.cf_payment_id?.toString(),
        refundStatus: 'SUCCESS',
      },
    });

    if (existingRefundTxn) {
      logger.info('Refund transaction already created for paymentId:' + webhookRefundBody.cf_payment_id?.toString());

      throw new ApiError(
        httpStatus.FORBIDDEN,
        `Refund transaction already created for paymentId: ${webhookRefundBody.cf_payment_id?.toString()}`
      );
    }

    const cfOrderId = webhookRefundBody.order_id;
    const advance = 'ADVANCE_';
    let actualOrderId = cfOrderId.substring(advance.length);

    const createRefundTransactionBody = {
      cfOrderId: actualOrderId,
      cfPaymentId: webhookRefundBody.cf_payment_id?.toString(),
      refundStatus: webhookRefundBody.refund_status,
      refundAmount: webhookRefundBody.refund_amount,
      refundCurrency: webhookRefundBody.refund_currency,
      details: req.body.data?.refund,
    };

    const newRefundTrn = await RefundTransaction.create(createRefundTransactionBody);
    if (newRefundTrn) {
      if (!!actualOrderId) {
        if (webhookRefundBody.refund_status === 'SUCCESS') {
          await OrderFinancialInfo.update({ isRefunded: true }, { where: { orderId: actualOrderId } });
        }
      }

      logger.info('Refund Transaction created for order: ' + actualOrderId);

      res.status(httpStatus.CREATED).send({ status: true, message: 'Refund Transaction created', entity: newRefundTrn });
    } else {
      logger.error('Something went wrong while creating refund Transaction');
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong while creating refund Transaction');
    }
  } catch (error) {
    logger.error('Refund transaction not created due to: ' + error.message);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Transaction not created, something went wrong'
    );
  }
};

const webhookTransaction = catchAsync(async (req, res) => {
  // return res.status(httpStatus.OK).send({ status: true, message: 'Payout Transaction created', entity: null });
  if (req.body?.data && _.has(req.body?.data, 'refund')) {
    refundWebhookTransaction(req, res);
  } else {
    pgWebhookTransaction(req, res);
  }
});

const payoutWebhookTransaction = catchAsync(async (req, res) => {
  // return res.status(httpStatus.CREATED).send({ status: true, message: 'Payout Transaction created', entity: null });

  try {
    const existingTxn = await PayoutTransaction.findOne({
      where: {
        payoutTransferId: req.body.transferId,
        transferStatus: 'TRANSFER_SUCCESS',
      },
    });

    if (existingTxn) {
      logger.error('Payout transaction already exist for transferId: ' + req.body.transferId);

      throw new ApiError(httpStatus.BAD_REQUEST, 'Payout transaction already exist for transferId: ' + req.body.transferId);
    } else {
      const payoutWebhookData = req.body;
      const payoutTransactionBody = {
        payoutTransferId: payoutWebhookData.transferId,
        transferStatus: payoutWebhookData.event,
        acknowledged: payoutWebhookData.acknowledged,
        eventTime: payoutWebhookData.eventTime,
        details: payoutWebhookData,
      };

      const payoutTransaction = await PayoutTransaction.create(payoutTransactionBody);
      if (payoutTransaction) {
        await Transfer.update(
          { status: payoutWebhookData.event, transactionId: payoutTransaction.id },
          { where: { payoutTransferId: payoutWebhookData.transferId } }
        );

        if (payoutWebhookData.event === 'TRANSFER_SUCCESS') {
          const transfer = await Transfer.findOne({
            where: { payoutTransferId: payoutWebhookData.transferId },
            attributes: ['payoutId', 'artistId', 'payoutTransferId'],
            include: [{ model: Payout, as: 'payout', attributes: ['id', 'orderDetail'] }],
          });

          const transferData = getPlainData(transfer);
          const artistId = transferData?.artistId;
          const orderDetails = transferData.payout.orderDetail;

          const ordersIdsToUpdate = orderDetails?.[artistId] || [];

          if (ordersIdsToUpdate?.length > 0) {
            await Promise.all(
              ordersIdsToUpdate.map((orderId) => {
                return OrderFinancialInfo.update({ paidToArtist: true }, { where: { orderId } });
              })
            );
          }

          logger.info('update the paidToArtist status in orderFinancialInfos for orderIds: ' + ordersIdsToUpdate);
        }
      }

      logger.info('Payout Transaction created for transferId: ' + payoutWebhookData.transferId);

      res.status(httpStatus.CREATED).send({ status: true, message: 'Payout Transaction created', entity: null });
    }
  } catch (error) {
    logger.error(`Payout Transaction failed for transferId ${req.body.transferId} due to: ` + error.message);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Transaction not created, something went wrong'
    );
  }
});

module.exports = {
  webhookTransaction,
  payoutWebhookTransaction,
};
