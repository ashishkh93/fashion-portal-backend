const moment = require('moment');
const { Op, QueryTypes } = require('sequelize');
const { Sequelize, sequelize, Order, ArtistTransfer, ArtistProfileVisitLog } = require('../../models');
const ApiError = require('../../utils/ApiError');

const { fn, col } = Sequelize;

/**
 * Get Analytics data for single artist
 * @param {string} artistId
 * @returns {object}
 */
exports.getTotalEarningsForArtistService = async (artistId) => {
  const now = moment();
  const startOfThisMonth = now.clone().startOf('month').toDate();
  const endOfThisMonth = now.clone().endOf('month').toDate();

  const startOfLastMonth = now.clone().subtract(1, 'month').startOf('month').toDate();
  const endOfLastMonth = now.clone().subtract(1, 'month').endOf('month').toDate();

  const commonCond = {
    artistId,
    status: 'TRANSFER_SUCCESS',
  };

  const attr = [[fn('COALESCE', fn('SUM', col('transferAmount')), 0), 'totalEarnings']];

  // Execute all DB calls in parallel
  const [totalResult, thisMonthResult, lastMonthResult, resultedCustomers, orders] = await Promise.all([
    ArtistTransfer.findOne({ where: commonCond, attributes: attr, raw: true }),
    ArtistTransfer.findOne({
      where: {
        ...commonCond,
        createdAt: { [Op.between]: [startOfThisMonth, endOfThisMonth] },
      },
      attributes: attr,
      raw: true,
    }),
    ArtistTransfer.findOne({
      where: {
        ...commonCond,
        createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] },
      },
      attributes: attr,
      raw: true,
    }),
    sequelize.query(
      `
        SELECT COUNT(DISTINCT "Order"."customerId") AS "uniqueCustomers"
        FROM "Order"
        INNER JOIN "ArtistTransferOrder" ON "Order"."id" = "ArtistTransferOrder"."orderId"
        INNER JOIN "ArtistTransfer" ON "ArtistTransferOrder"."transferId" = "ArtistTransfer"."id"
        WHERE "ArtistTransfer"."artistId" = :artistId
      `,
      {
        replacements: { artistId },
        type: QueryTypes.SELECT,
      }
    ),
    Order.findAll({
      where: {
        artistId,
      },
      attributes: ['status', [fn('COUNT', col('status')), 'count']],
      group: ['status'],
      raw: true,
    }),
  ]);

  const totalEarnings = parseFloat(totalResult?.totalEarnings || 0);
  const thisMonthEarnings = parseFloat(thisMonthResult?.totalEarnings || 0);
  const lastMonthEarnings = parseFloat(lastMonthResult?.totalEarnings || 0);

  const totalCustomers = parseInt(resultedCustomers?.[0]?.uniqueCustomers, 10) ?? 0;

  let percentChange = 0;
  let changeType = 'no_change';

  if (lastMonthEarnings === 0 && thisMonthEarnings > 0) {
    changeType = 'increase';
    percentChange = 100;
  } else if (lastMonthEarnings > 0) {
    const diff = thisMonthEarnings - lastMonthEarnings;
    percentChange = (diff / lastMonthEarnings) * 100;

    if (diff > 0) changeType = 'increase';
    else if (diff < 0) changeType = 'decrease';
  }

  return {
    totalEarnings,
    thisMonthEarnings,
    currentvsLastMonthCompare: {
      percentChange: Number(percentChange.toFixed(2)),
      percentChangeType: changeType,
    },
    totalCustomers,
    orders,
  };
};

/**
 * Create a profile visit log for an artist
 * @param {string} artistId
 * @param {object} body
 * @returns {object}
 */
exports.createProfileVisitLogService = async (artistId, body) => {
  const existingProfileVisitLog = await ArtistProfileVisitLog.findOne({
    where: { artistId, customerId: body.customerId },
  });

  if (existingProfileVisitLog) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Profile visit log already exists');
  }

  const logEntry = {
    artistId,
    ...body,
  };

  const profileVisitLog = await ArtistProfileVisitLog.create(logEntry);
  return profileVisitLog;
};
