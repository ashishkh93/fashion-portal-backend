const httpStatus = require('http-status');
const { Op } = require('sequelize');
const moment = require('moment');
const {
  ArtistTransfer,
  Order,
  OrderFinancialInfo,
  CustomerInfo,
  User,
  Payout,
  ArtistTransferOrder,
} = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPagination } = require('../../utils/paginate');
const config = require('../../config/config');

const commission = Number(config.comission);

const SUCCESS_STATUSES = ['TRANSFER_SUCCESS', 'CREDIT_CONFIRMATION', 'TRANSFER_ACKNOWLEDGED'];

/**
 * Derives gross order total from net transfer amount using commission formula
 */
const grossFromNet = (net) => (commission > 0 ? net / (1 - commission / 100) : net);

/**
 * Builds monthly overview for chart across the last 6 months
 */
const buildMonthlyOverview = (transfers, pendingOrders) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const m = moment().subtract(i, 'months');
    months.push({
      month: m.format('MMM'),
      year: m.year(),
      start: m.clone().startOf('month').valueOf(),
      end: m.clone().endOf('month').valueOf(),
      income: 0,
      pendingAmount: 0,
    });
  }

  transfers.forEach((t) => {
    const ts = new Date(t.createdAt).valueOf();
    const entry = months.find((m) => ts >= m.start && ts <= m.end);
    if (entry) entry.income += t.transferAmount || 0;
  });

  pendingOrders.forEach((order) => {
    const ts = new Date(order.date).valueOf();
    const entry = months.find((m) => ts >= m.start && ts <= m.end);
    if (entry && order.orderFinancialInfo) {
      const { totalAmount, addOnAmount, discount } = order.orderFinancialInfo;
      entry.pendingAmount += (totalAmount || 0) + (addOnAmount || 0) - (discount || 0);
    }
  });

  return months.map(({ month, year, income, pendingAmount }) => ({ month, year, income, pendingAmount }));
};

/**
 * Get payment dashboard summary for an artist
 * @param {string} artistId
 */
const getPaymentDashboardService = async (artistId) => {
  try {
    const allTransfers = await ArtistTransfer.findAll({
      where: { artistId },
      attributes: ['id', 'transferAmount', 'status', 'createdAt', 'payoutTransferId'],
      include: [{ model: Payout, as: 'payout', attributes: ['fromDate', 'toDate', 'status', 'createdAt'] }],
      order: [['createdAt', 'DESC']],
    });

    const totalPreviousIncome = allTransfers
      .filter((t) => SUCCESS_STATUSES.includes(t.status))
      .reduce((sum, t) => sum + (t.transferAmount || 0), 0);

    const latestTransfer = allTransfers[0] || null;
    const lastPayment = latestTransfer
      ? {
          amount: latestTransfer.transferAmount,
          date: latestTransfer.createdAt,
          status: latestTransfer.status,
          payoutTransferId: latestTransfer.payoutTransferId,
          fromDate: latestTransfer.payout?.fromDate || null,
          toDate: latestTransfer.payout?.toDate || null,
        }
      : null;

    // Identify orders already paid out
    const transferIds = allTransfers.map((t) => t.id);
    let paidOrderIds = [];
    if (transferIds.length > 0) {
      const entries = await ArtistTransferOrder.findAll({
        where: { transferId: { [Op.in]: transferIds } },
        attributes: ['orderId'],
      });
      paidOrderIds = entries.map((e) => e.orderId);
    }

    // Pending orders: completed/cancelled, not yet paid, not refunded
    const pendingWhere = {
      artistId,
      status: { [Op.in]: ['COMPLETED', 'CANCELLED_BY_CUSTOMER'] },
    };
    if (paidOrderIds.length > 0) {
      pendingWhere.id = { [Op.notIn]: paidOrderIds };
    }

    const pendingOrders = await Order.findAll({
      where: pendingWhere,
      attributes: ['id', 'date'],
      include: [
        {
          model: OrderFinancialInfo,
          as: 'orderFinancialInfo',
          attributes: ['totalAmount', 'addOnAmount', 'discount'],
          where: { isRefunded: false },
          required: true,
        },
      ],
    });

    const totalPendingRaw = pendingOrders.reduce((sum, o) => {
      const { totalAmount, addOnAmount, discount } = o.orderFinancialInfo;
      return sum + (totalAmount || 0) + (addOnAmount || 0) - (discount || 0);
    }, 0);

    const nextPaymentAmount = totalPendingRaw * (1 - commission / 100);

    return {
      totalPreviousIncome,
      lastPayment,
      totalPendingAmount: totalPendingRaw,
      nextPayment: { amount: nextPaymentAmount },
      monthlyOverview: buildMonthlyOverview(allTransfers, pendingOrders),
    };
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Get paginated payout history for an artist
 * @param {string} artistId
 * @param {number} page
 * @param {number} size
 */
const getPaymentHistoryService = async (artistId, page, size) => {
  try {
    const { limit, offset } = getPagination(page, size);

    const { count, rows: transfers } = await ArtistTransfer.findAndCountAll({
      where: { artistId },
      attributes: ['id', 'transferAmount', 'status', 'createdAt', 'payoutTransferId'],
      include: [
        {
          model: Payout,
          as: 'payout',
          attributes: ['fromDate', 'toDate', 'batchTransferId', 'createdAt'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const items = transfers.map((t) => {
      const grossAmount = grossFromNet(t.transferAmount || 0);
      const otherServiceCharge = Math.max(0, grossAmount - (t.transferAmount || 0));
      return {
        transferId: t.id,
        paymentId: t.payoutTransferId,
        paymentDate: t.createdAt,
        amount: grossAmount,
        otherServiceCharge,
        netAmount: t.transferAmount,
        status: t.status,
        fromDate: t.payout?.fromDate || null,
        toDate: t.payout?.toDate || null,
        batchTransferId: t.payout?.batchTransferId || null,
      };
    });

    // Aggregate summary across all of artist's history (lightweight)
    const allTransfers = await ArtistTransfer.findAll({
      where: { artistId },
      attributes: ['transferAmount'],
    });
    const totalNetReceived = allTransfers.reduce((sum, t) => sum + (t.transferAmount || 0), 0);
    const totalGross = grossFromNet(totalNetReceived);
    const totalServiceCharge = Math.max(0, totalGross - totalNetReceived);

    return {
      summary: {
        amount: totalGross,
        otherServiceCharge: totalServiceCharge,
        netAmount: totalNetReceived,
      },
      totalItems: count,
      items,
      totalPages: Math.ceil(count / limit),
      currentPage: page ? +page : 0,
    };
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Get paginated order breakdown for a specific ArtistTransfer
 * @param {string} artistId
 * @param {string} transferId
 * @param {number} page
 * @param {number} size
 */
const getTransferOrdersService = async (artistId, transferId, page, size) => {
  try {
    const transfer = await ArtistTransfer.findOne({
      where: { id: transferId, artistId },
      attributes: ['id', 'transferAmount', 'status', 'createdAt', 'payoutTransferId'],
      include: [{ model: Payout, as: 'payout', attributes: ['fromDate', 'toDate', 'batchTransferId'] }],
    });

    if (!transfer) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Payment transfer not found');
    }

    const { limit, offset } = getPagination(page, size);

    // Total count of orders for this transfer
    const totalCount = await ArtistTransferOrder.count({ where: { transferId } });

    // Paginated order IDs
    const transferOrderEntries = await ArtistTransferOrder.findAll({
      where: { transferId },
      attributes: ['orderId'],
      limit,
      offset,
    });

    const orderIds = transferOrderEntries.map((e) => e.orderId);

    let orders = [];
    let totalOrderAmountForSummary = 0;

    if (orderIds.length > 0) {
      orders = await Order.findAll({
        where: { id: { [Op.in]: orderIds } },
        attributes: ['id', 'orderIdentity', 'date', 'status'],
        include: [
          {
            model: OrderFinancialInfo,
            as: 'orderFinancialInfo',
            attributes: ['totalAmount', 'addOnAmount', 'discount'],
          },
          {
            model: CustomerInfo,
            as: 'orderCustomer',
            attributes: ['fullName'],
            include: [{ model: User, as: 'customerInfo', attributes: ['phone'] }],
          },
        ],
      });
    }

    // Compute true gross total for summary from all orders in this transfer
    const allTransferOrderEntries = await ArtistTransferOrder.findAll({
      where: { transferId },
      attributes: ['orderId'],
    });
    const allOrderIds = allTransferOrderEntries.map((e) => e.orderId);
    if (allOrderIds.length > 0) {
      const allOrders = await Order.findAll({
        where: { id: { [Op.in]: allOrderIds } },
        attributes: [],
        include: [
          {
            model: OrderFinancialInfo,
            as: 'orderFinancialInfo',
            attributes: ['totalAmount', 'addOnAmount', 'discount'],
          },
        ],
      });
      totalOrderAmountForSummary = allOrders.reduce((sum, o) => {
        if (!o.orderFinancialInfo) return sum;
        const { totalAmount, addOnAmount, discount } = o.orderFinancialInfo;
        return sum + (totalAmount || 0) + (addOnAmount || 0) - (discount || 0);
      }, 0);
    }

    const otherServiceCharge = Math.max(0, totalOrderAmountForSummary - (transfer.transferAmount || 0));

    const items = orders.map((order) => {
      const { totalAmount = 0, addOnAmount = 0, discount = 0 } = order.orderFinancialInfo || {};
      return {
        orderId: order.id,
        orderIdentity: order.orderIdentity,
        orderDate: order.date,
        customerName: order.orderCustomer?.fullName || null,
        customerPhone: order.orderCustomer?.customerInfo?.phone || null,
        netAmount: (totalAmount || 0) + (addOnAmount || 0) - (discount || 0),
      };
    });

    return {
      summary: {
        paymentDate: transfer.createdAt,
        paymentId: transfer.payoutTransferId,
        amount: totalOrderAmountForSummary,
        otherServiceCharge,
        netAmount: transfer.transferAmount,
        status: transfer.status,
        fromDate: transfer.payout?.fromDate || null,
        toDate: transfer.payout?.toDate || null,
      },
      totalItems: totalCount,
      items,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page ? +page : 0,
    };
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

module.exports = {
  getPaymentDashboardService,
  getPaymentHistoryService,
  getTransferOrdersService,
};
