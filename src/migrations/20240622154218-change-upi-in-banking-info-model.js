'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('ArtistBankingInfos', 'upi', {
      type: Sequelize.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[\w.-]+@[\w.-]+$/, // Validate UPI format using a regular expression
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ArtistBankingInfos', 'upi');
  },
};
