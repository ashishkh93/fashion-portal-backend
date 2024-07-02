'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('ArtistBankingInfos', 'pan', {
      type: Sequelize.STRING(10), // Assuming PAN card is always 10 characters
      allowNull: false,
      unique: true, // Optional: if PAN should be unique per user
      validate: {
        is: /^[A-Z]{5}[0-9]{4}[A-Z]$/i, // Validate format using a regular expression
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ArtistBankingInfos', 'pan');
  },
};
