'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ArtistBankingInfo', 'bankName');
    await queryInterface.removeColumn('ArtistBankingInfo', 'pan');
    await queryInterface.removeColumn('ArtistBankingInfo', 'panImage');
    await queryInterface.addColumn('ArtistBankingInfo', 'accountHolderName', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn('ArtistBankingInfo', 'upiVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverting the changes made in the up method
    await queryInterface.removeColumn('ArtistBankingInfo', 'accountHolderName');
    await queryInterface.removeColumn('ArtistBankingInfo', 'upiVerified');
    await queryInterface.addColumn('ArtistBankingInfo', 'bankName', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn('ArtistBankingInfo', 'pan', {
      type: Sequelize.STRING(10),
      allowNull: false,
    });
    await queryInterface.addColumn('ArtistBankingInfo', 'panImage', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
