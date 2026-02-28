const httpStatus = require('http-status');
const { Op } = require('sequelize');
const moment = require('moment');
const _ = require('lodash');
const ApiError = require('../../utils/ApiError');
const {
  Payout,
  ArtistTransfer,
  Order,
  OrderFinancialInfo,
  User,
  ArtistInfo,
  ArtistBankingInfo,
  ArtistTransferOrder,
} = require('../../models');
const { payoutAPICallback } = require('../../utils/cashfree-payout-api.util');
const logger = require('../../config/logger');
const config = require('../../config/config');
const { decrypt } = require('../../utils/crypto');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { getPlainData } = require('../../utils/common.util');
const fundSourceId = config.cashfree.fundSourceId;
const comission = Number(config.comission);

/**
 * -------- VERY SENSITIVE API CONTROLLER ---------
 * Batch payout to artists through cashfree payout api
 * @param {object} body
 * @returns {object}
 */
const payoutToArtistsService = async (body) => {
  try {
    const payouts = await Payout.findAll({ order: [['createdAt', 'DESC']] });
    const plainPayouts = payouts.map((payout) => getPlainData(payout));

    // why did i do this? think on it
    let fromDate, toDate, lastPayoutToDate;
    if (plainPayouts.length > 0) {
      lastPayoutToDate = plainPayouts?.[0]?.toDate;
      // fromDate = moment(lastPayoutToDate).add(1, 'day');
      // toDate = moment(lastPayoutToDate).subtract(15, 'days').format('YYYY-MM-DD');
    }

    if (plainPayouts.length === 0 || moment(body.fromDate).isAfter(lastPayoutToDate)) {
      const allOrdersWithinFromToDate = await Order.findAll({
        where: {
          date: {
            [Op.between]: [body.fromDate, body.toDate],
          },
          status: {
            [Op.in]: ['COMPLETED', 'CANCELLED_BY_CUSTOMER'], // status must be COMPLETED or CANCELLED_BY_CUSTOMER in order to be considered the order as payout to artist
          },
        },
        attributes: ['id', 'customerId', 'artistId', 'date', 'time', 'status', 'createdAt'],
        include: [
          {
            model: OrderFinancialInfo,
            as: 'orderFinancialInfo',
            attributes: ['totalAmount', 'advanceAmountForOrder', 'advanceAmountPaid', 'discount', 'addOnAmount'],
            where: {
              isRefunded: false, // we are not paying for refunded orders
            },
            required: true,
          },
          {
            model: ArtistInfo,
            as: 'orderArtist',
            attributes: ['fullName', 'email', 'location', 'city', 'state', 'pincode'],
            include: [
              {
                model: User,
                as: 'artist',
                attributes: ['id', 'phone', 'role'],
              },
              {
                model: ArtistBankingInfo,
                as: 'artistBankingInfo',
                attributes: ['beneficiaryId', 'upi'],
              },
            ],
          },
        ],
      });

      if (!allOrdersWithinFromToDate || !allOrdersWithinFromToDate.length) {
        throw new ApiError(httpStatus.BAD_REQUEST, `The artist doesn't have beneficiary Id or UPI`);
      }

      /**
       * avoid getting data in sequelize dataValues instance. With below method we will get the plain data
       */
      const plainOrders = allOrdersWithinFromToDate.map((order) => getPlainData(order));

      const orderIds = plainOrders?.map((order) => order.id);

      // to store this json as artist with their all orders as payout detail json
      const artistWithOrderIds = {};
      const curDateTime = moment().format('DD_MM_YYYY_HH_mm_ss');

      let totalBatchPayoutAmount = 0;

      /**
       * Reduce the order object into payout api's required body object
       */
      const reducedOrderArray = _.chain(plainOrders)
        .groupBy('artistId')
        .map((groupedOrder, artistId) => {
          const {
            fullName,
            email,
            location,
            city,
            state,
            pincode,
            artistBankingInfo: { beneficiaryId, upi },
            artist: { phone },
          } = groupedOrder[0].orderArtist;

          const parsedArtistId = artistId.split('-')[0];
          let beneficiaryPayoutInfo = {
            transfer_id: `transfer_${parsedArtistId}_${curDateTime}`,
            transfer_currency: 'INR',
            transfer_mode: 'upi',
            beneficiary_details: {
              beneficiary_id: beneficiaryId,
              beneficiary_name: fullName,
              beneficiary_instrument_details: {
                vpa: upi, // success@upi
              },
              beneficiary_contact_details: {
                beneficiary_email: email,
                beneficiary_phone: phone,
                beneficiary_country_code: '+91',
                beneficiary_address: location,
                beneficiary_city: city,
                beneficiary_state: state,
                beneficiary_postal_code: pincode,
              },
            },
            transfer_remarks: 'Payout created',
            fundsource_id: fundSourceId,
            artistId,
          };

          const totalTransferAmount = groupedOrder.reduce((acc, order) => {
            const {
              id,
              artistId,
              orderFinancialInfo: { totalAmount, discount, addOnAmount },
            } = order;

            if (!artistWithOrderIds[artistId]) {
              artistWithOrderIds[artistId] = [];
            }
            artistWithOrderIds[artistId].push(id);

            const finalPayableAmount = totalAmount + addOnAmount - discount;
            acc += Number(finalPayableAmount);

            return acc;
          }, 0);

          // this is the comission amount for artist per current total payout
          const commisionAmount = totalTransferAmount * (comission / 100);

          // this is the amount to be paid to artist after cut out the comission
          const totalAmountToBePaidToArtistForCurrentPayout = totalTransferAmount - commisionAmount;

          beneficiaryPayoutInfo.transfer_amount = totalAmountToBePaidToArtistForCurrentPayout;

          totalBatchPayoutAmount += totalAmountToBePaidToArtistForCurrentPayout;

          return beneficiaryPayoutInfo;
        })
        .value();

      const allArtistsHaveUpiAndBeneId = reducedOrderArray.every(
        (artist) =>
          artist.beneficiary_details.beneficiary_id && artist.beneficiary_details.beneficiary_instrument_details.vpa
      );

      if (!allArtistsHaveUpiAndBeneId) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Some artist doesn't have beneficiary Id or UPI, please add them first`);
      }

      const batch_transfer_id = 'batch_payout_at_' + curDateTime;
      const payoutFinalBody = {
        batch_transfer_id,
        transfers: reducedOrderArray, // contains artist's information with transfer amount
      };

      // return { ...payoutFinalBody, totalBatchPayoutAmount };

      logger.info(`Payout to artists initiated from ${body.fromDate} to ${body.toDate}`);
      logger.info(`Orders to be paid out: ${JSON.stringify(orderIds)}`);

      const payoutResponse = await payoutAPICallback('POST', payoutFinalBody, '/transfers/batch');
      const data = await payoutResponse.json();

      if (payoutResponse.status === 200) {
        /**
         * Make entry into the payout model
         */
        logger.info(`Payout successfully initiated for ${body.fromDate} to ${body.toDate}`);
        const payoutModelBody = {
          batchTransferId: batch_transfer_id,
          fromDate: body.fromDate,
          toDate: body.toDate,
          status: data.status || 'INITIATED',
          totalBatchPayoutAmount,
        };

        const payoutRes = await Payout.create(payoutModelBody);

        if (payoutRes) {
          const reducedTransfers = reducedOrderArray?.reduce((acc, trn) => {
            let transfer = {};
            transfer.payoutId = payoutRes.id;
            transfer.artistId = trn.artistId;
            transfer.payoutTransferId = trn.transfer_id;
            transfer.status = 'INITIATED';
            transfer.transferAmount = trn.transfer_amount;
            transfer.orderIds = artistWithOrderIds[trn.artistId];

            acc.push(transfer);
            return acc;
          }, []);

          const bulkTransfers = await ArtistTransfer.bulkCreate(reducedTransfers);
          if (bulkTransfers) {
            const orderTransferEntries = bulkTransfers.reduce((acc, transfer) => {
              const { orderIds, id } = transfer;
              const tOrders = orderIds.map((orderId) => {
                return { orderId, transferId: id };
              });

              acc.push(...tOrders);
              return acc;
            }, []);
            await ArtistTransferOrder.bulkCreate(orderTransferEntries);
          }

          // if (bulkTransfers) {
          //   await Promise.all(
          //     bulkTransfers.map(async (transfer) => {
          //       const { orderIds } = transfer;
          //       await Promise.all(
          //         orderIds.map((orderId) => {
          //           const orderTransferEntry = {
          //             orderId,
          //             transferId: transfer.id,
          //           };
          //           return ArtistTransferOrder.create(orderTransferEntry);
          //         })
          //       );
          //     })
          //   );
          // }
        }

        return data;
      } else {
        logger.error('Payout failed due to reason: ' + data.message);
        throw new ApiError(
          payoutResponse.status || httpStatus.INTERNAL_SERVER_ERROR,
          data.message || 'Something went wrong, please try again later'
        );
      }
    } else {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Invalid date range OR The Payout is already done for the date range you have selected'
      );
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Batch payout verify from batch transfer id
 * @param {string} batchTransferId
 * @returns {Promise}
 */
const batchPayoutVerifyService = async (batchTransferId) => {
  try {
    const payoutResponse = await payoutAPICallback('GET', {}, `/transfers/batch?batch_transfer_id=${batchTransferId}`);
    const data = await payoutResponse.json();

    if (payoutResponse.status === 200) {
      return data;
    } else {
      throw new ApiError(payoutResponse.status || httpStatus.INTERNAL_SERVER_ERROR, data.message || 'Something went wrong');
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong');
  }
};

/**
 * Get all payouts
 * @param {number} page
 * @param {number} size
 * @returns {Promise}
 */
const getAllPayoutsService = async (page, size) => {
  const includeModel = [
    {
      model: ArtistTransfer,
      as: 'payoutTransfers',
      attributes: ['transferAmount', 'payoutTransferId', 'status'],
    },
  ];

  const mainModelAttributes = [
    'id',
    'batchTransferId',
    'totalBatchPayoutAmount',
    'fromDate',
    'toDate',
    'status',
    'transactionId',
    'createdAt',
    'updatedAt',
  ];

  const allPayouts = await getPaginationDataFromModel(Payout, {}, page, size, includeModel, mainModelAttributes);

  return allPayouts;
};

/**
 * Get payout by Id
 * @param {string} payoutId
 * @returns {Promise<Payout>}
 */
const getPayoutById = async (payoutId) => {
  const includeModel = [
    {
      model: ArtistTransfer,
      as: 'payoutTransfers',
      attributes: ['transferAmount', 'payoutTransferId', 'status'],
      include: [
        {
          model: ArtistInfo,
          as: 'payoutArtistInfo',
          attributes: ['status', 'fullName', 'businessName', 'email', 'gender', 'profilePic', 'location'],
        },
        {
          model: Order,
          as: 'orders',
          attributes: ['status', 'createdAt', 'orderIdentity', 'date', 'time'],
          through: {
            attributes: [],
          },
          include: [
            {
              model: OrderFinancialInfo,
              as: 'orderFinancialInfo',
              attributes: [
                'totalAmount',
                'advanceAmountForOrder',
                'advanceAmountPaid',
                'discount',
                'addOnAmount',
                'paidToArtist',
                'isRefunded',
              ],
            },
          ],
        },
      ],
    },
  ];

  const mainModelAttributes = [
    'id',
    'batchTransferId',
    'totalBatchPayoutAmount',
    'fromDate',
    'toDate',
    'status',
    'transactionId',
    'createdAt',
    'updatedAt',
  ];

  const singlePayout = await Payout.findOne({
    where: { id: payoutId },
    attributes: mainModelAttributes,
    include: includeModel,
  });

  return singlePayout;
};

module.exports = {
  payoutToArtistsService,
  batchPayoutVerifyService,
  getAllPayoutsService,
  getPayoutById,
};
