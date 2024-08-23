const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { RefundRequest, Order, OrderFinancialInfo, User, CustomerInfo } = require('../../models');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { getPlainData } = require('../../utils/common.util');
const { CashfreeUtil } = require('../../utils/cashfree.util');
const config = require('../../config/config');
const logger = require('../../config/logger');
const moment = require('moment');

const xAPiVersion = config.cashfree.apiVersion;

/**
 * Get single refund request by primary key
 * * @param {string} refundRequestId
 */
const getSingleRefundRequestByPk = async (refundRequestId) => {
  const refundReq = await RefundRequest.findByPk(refundRequestId);
  if (refundReq) {
    return getPlainData(refundReq);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request not found');
  }
};

/**
 * Get all refund requests service
 * @param {number} page
 * @param {number} size
 * @returns {RefundRequest}
 */
const getRefunRequestsService = async (page, size) => {
  const includeModel = [
    {
      model: Order,
      as: 'order',
      attributes: { exclude: ['transactionId', 'artIds', 'approvedAt', 'updatedAt'] },
      include: [
        {
          model: OrderFinancialInfo,
          as: 'orderFinancialInfo',
          attributes: [
            'totalAmount',
            'advanceAmountForOrder',
            'discount',
            'addOnAmount',
            'advanceAmountPaid',
            'paidToArtist',
            'isRefunded',
          ],
        },
      ],
    },
    {
      model: User,
      as: 'customerData',
      attributes: { exclude: ['reasonToDecline', 'createdAt', 'updatedAt'] },
      include: [
        {
          model: CustomerInfo,
          as: 'customerInfo',
          attributes: ['status', 'fullName'],
        },
      ],
    },
  ];
  try {
    const refundRequests = await getPaginationDataFromModel(RefundRequest, {}, page, size, includeModel);

    if (refundRequests) {
      const plainRefundRequests = refundRequests?.items?.map((refundReq) => {
        return getPlainData(refundReq);
      });

      return { ...refundRequests, items: plainRefundRequests };
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong');
  }
};

/**
 * Create refund request
 * @returns {RefundRequest}
 */
const createRefunRequestForOrderService = async (curOrder, refundReason, transaction) => {
  try {
    if (!curOrder) throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide valid order');

    /**
     * for the security reaspon, we should consider to checking if there is any current pending refund request for this order.
     */
    const existingRefundRequest = await RefundRequest.findOne({ where: { orderId: curOrder?.id, status: 'PENDING' } });

    if (existingRefundRequest) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Refund request already initiated for this order');
    }
    const refundRequestBody = {
      orderId: curOrder.id,
      customerId: curOrder.customerId,
      artistId: curOrder.artistId,
      amount: curOrder.orderFinancialInfo.advanceAmountForOrder,
      status: 'PENDING',
      refundReason,
    };

    await RefundRequest.create(refundRequestBody, { transaction });
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong');
  }
};

/**
 * Initiate refund for user
 * @param {string} artistId
 * @returns {RefundRequest}
 */
const initiateRefundService = async (orderId, customerId) => {
  try {
    let curRefundRequest = await RefundRequest.findOne({ where: { orderId, customerId, status: 'PENDING' } });
    if (curRefundRequest) {
      curRefundRequest = getPlainData(curRefundRequest);

      const parsedArtistId = curRefundRequest.orderId.split('-')[0];
      const curDateTime = moment().format('DD_MM_YYYY_HH_mm_ss');

      // return curRefundRequest;
      const cfOrderId = `ADVANCE_${orderId}`;
      const OrderCreateRefundRequest = {
        refund_amount: curRefundRequest.amount,
        refund_id: `refund_${parsedArtistId}_${curDateTime}`,
        refund_note: `Refund created for ${orderId}, due to ${curRefundRequest.refundReason}`,
      };

      const createRefundRequest = await CashfreeUtil.PGOrderCreateRefund(xAPiVersion, cfOrderId, OrderCreateRefundRequest);

      logger.info('Refund initiated for orderId: ' + orderId);

      if (createRefundRequest.data.refund_status) {
        await RefundRequest.update({ status: 'APPROVED' }, { where: { orderId } });
      }

      return createRefundRequest.data;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Refund request doesn't exists, OR the order is already refunded");
    }
  } catch (error) {
    logger.error('Refund for orderId: ' + orderId + ' failed due to: ' + error?.response?.data?.message || error.message);

    throw new ApiError(
      error?.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error?.response?.data?.message || error.message || 'Internal server error'
    );
  }
};

module.exports = {
  getRefunRequestsService,
  getSingleRefundRequestByPk,
  createRefunRequestForOrderService,
  initiateRefundService,
};
