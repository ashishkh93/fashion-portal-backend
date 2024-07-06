'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Change the table names
     */
    await queryInterface.renameTable('ArtOrders', 'ArtOrder');
    await queryInterface.renameTable('Arts', 'Art');
    await queryInterface.renameTable('ArtistBankingInfos', 'ArtistBankingInfo');
    await queryInterface.renameTable('ArtistInfoServices', 'ArtistInfoService');
    await queryInterface.renameTable('ArtistInfos', 'ArtistInfo');
    await queryInterface.renameTable('CustomerInfos', 'CustomerInfo');
    await queryInterface.renameTable('OrderFinancialInfos', 'OrderFinancialInfo');
    await queryInterface.renameTable('Orders', 'Order');
    await queryInterface.renameTable('PayoutTransactions', 'PayoutTransaction');
    await queryInterface.renameTable('Payouts', 'Payout');
    await queryInterface.renameTable('RefundRequests', 'RefundRequest');
    await queryInterface.renameTable('RefundTransactions', 'RefundTransaction');
    await queryInterface.renameTable('Reviews', 'Review');
    await queryInterface.renameTable('Services', 'Service');
    await queryInterface.renameTable('SuperAdminInfos', 'SuperAdminInfo');
    await queryInterface.renameTable('Tokens', 'Token');
    await queryInterface.renameTable('Transactions', 'Transaction');
    await queryInterface.renameTable('Transfers', 'Transfer');
    await queryInterface.renameTable('Users', 'User');
  },

  async down(queryInterface, Sequelize) {
    /**
     * The revert the table names in case of rollback
     */
    await queryInterface.renameTable('ArtOrder', 'ArtOrders');
    await queryInterface.renameTable('Art', 'Arts');
    await queryInterface.renameTable('ArtistBankingInfo', 'ArtistBankingInfos');
    await queryInterface.renameTable('ArtistInfoService', 'ArtistInfoServices');
    await queryInterface.renameTable('ArtistInfo', 'ArtistInfos');
    await queryInterface.renameTable('CustomerInfo', 'CustomerInfos');
    await queryInterface.renameTable('OrderFinancialInfo', 'OrderFinancialInfos');
    await queryInterface.renameTable('Order', 'Orders');
    await queryInterface.renameTable('PayoutTransaction', 'PayoutTransactions');
    await queryInterface.renameTable('Payout', 'Payouts');
    await queryInterface.renameTable('RefundRequests', 'RefundRequests');
    await queryInterface.renameTable('RefundTransaction', 'RefundTransactions');
    await queryInterface.renameTable('Review', 'Reviews');
    await queryInterface.renameTable('Service', 'Services');
    await queryInterface.renameTable('SuperAdminInfo', 'SuperAdminInfos');
    await queryInterface.renameTable('Token', 'Tokens');
    await queryInterface.renameTable('Transaction', 'Transactions');
    await queryInterface.renameTable('Transfer', 'Transfers');
    await queryInterface.renameTable('User', 'Users');
  },
};
