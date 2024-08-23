'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /** CALLED SECOND TIME FOR QA */
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ArtistBankingInfo', 'upiHash', {
      type: Sequelize.STRING(64),
      allowNull: true,
      unique: {
        msg: 'The UPI ID you provided already exists in the system',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ArtistBankingInfo', 'upiHash');
  },
};
