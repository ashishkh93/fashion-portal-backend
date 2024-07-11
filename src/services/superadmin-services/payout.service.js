const httpStatus = require('http-status');
const { Op } = require('sequelize');
const moment = require('moment');
const _ = require('lodash');
const ApiError = require('../../utils/ApiError');
const { Payout, Transfer, Order, OrderFinancialInfo, User, ArtistInfo, ArtistBankingInfo } = require('../../models');
const { payoutAPICallback } = require('../../utils/cashfree-payout-api.util');
const logger = require('../../config/logger');
const config = require('../../config/config');
const { decrypt } = require('../../utils/crypto');
const fundSourceId = config.cashfree.fundSourceId;
const comission = Number(config.comission);

/**
 * -------- VERY SENSITIVE API CONTROLLER ---------
 * Batch payout to the artists through cashfree payout api
 * @param {object} body
 * @returns {object}
 */
const payoutToArtistsService = async (body) => {
  try {
    const payouts = await Payout.findAll();
    const plainPayouts = payouts.map((payout) => payout.get({ plain: true }));

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
          status: 'COMPLETED',
        },
        attributes: ['id', 'customerId', 'artistId', 'date', 'time', 'status', 'createdAt'],
        include: [
          {
            model: OrderFinancialInfo,
            as: 'orderFinancialInfo',
            attributes: ['totalAmount', 'advanceAmountForOrder', 'advanceAmountPaid', 'discount', 'addOnAmount'],
          },
          {
            model: User,
            as: 'artist',
            attributes: ['id', 'phone', 'role'],
            include: [
              {
                model: ArtistInfo,
                as: 'artistInfos',
                attributes: ['fullName', 'email', 'location', 'city', 'state', 'pincode'],
                include: [
                  {
                    model: ArtistBankingInfo,
                    as: 'artistBankingInfo',
                    attributes: ['beneficiaryId', 'upi'],
                  },
                ],
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
      const plainOrders = allOrdersWithinFromToDate.map((order) => order.get({ plain: true }));

      const orderIds = plainOrders?.map((order) => order.id);

      const artistIds = [];

      // to store this json as artist with their all orders as payout detail json
      const artistWithOrderIds = {};
      const curDateTime = moment().format('DD_MM_YYYY_HH_mm_ss');

      /**
       * Reduce the order object into payout api's required body object
       */
      const reducedOrderArray = _.chain(plainOrders)
        .groupBy('artistId')
        .map((groupedOrder, artistId) => {
          artistIds.push(artistId);
          const {
            phone,
            artistInfos: {
              fullName,
              email,
              location,
              city,
              state,
              pincode,
              artistBankingInfo: { beneficiaryId, upi },
            },
          } = groupedOrder[0].artist;

          // const decipheredUpi = decrypt(upi);

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

          return beneficiaryPayoutInfo;
        })
        .value();

      const batch_transfer_id = 'payout_at_' + curDateTime;
      const payoutFinalBody = {
        batch_transfer_id,
        transfers: reducedOrderArray, // contains artist's information with transfer amount
      };

      // return payoutFinalBody;

      logger.info(`Payout to artists initiated from ${body.fromDate} to ${body.toDate}`);
      logger.info(`Orders to be paid out: ${JSON.stringify(orderIds)}`);

      const payoutResponse = await payoutAPICallback('POST', payoutFinalBody, '/transfers/batch');
      const data = await payoutResponse.json();

      if (payoutResponse.status === 200) {
        /**
         * Make entry into the payout model
         */
        logger.info(`Payout successful for ${body.fromDate} to ${body.toDate}`);
        const payoutModelBody = {
          batchTransferId: batch_transfer_id,
          fromDate: body.fromDate,
          toDate: body.toDate,
          artistIds,
          status: data.status || 'initiated',
          orderDetail: artistWithOrderIds,
        };

        const payoutRes = await Payout.create(payoutModelBody);

        if (payoutRes) {
          const reducedTransfers = reducedOrderArray?.reduce((acc, trn) => {
            let transfer = {};
            transfer.payoutId = payoutRes.id;
            transfer.artistId = trn.artistId;
            transfer.payoutTransferId = trn.transfer_id;
            transfer.status = 'INITIATED';

            acc.push(transfer);
            return acc;
          }, []);

          await Transfer.bulkCreate(reducedTransfers);
        }

        return data;
      } else {
        logger.error('Payout failed due to reason: ' + data.message);
        throw new ApiError(
          payoutResponse.status || httpStatus.INTERNAL_SERVER_ERROR,
          data.message || 'Something went wrong'
        );
      }
    } else {
      throw new ApiError(httpStatus.FORBIDDEN, 'The Payout is already done for the date range you have selected');
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

module.exports = {
  payoutToArtistsService,
  batchPayoutVerifyService,
};
