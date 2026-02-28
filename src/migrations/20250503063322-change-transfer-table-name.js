'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename the table
    await queryInterface.renameTable('Transfer', 'ArtistTransfer');

    // Rename the primary key constraint
    await queryInterface.sequelize.query(`ALTER INDEX "Transfers_pkey" RENAME TO "ArtistTransfer_pkey";`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('ArtistTransfer', 'Transfer');
    await queryInterface.sequelize.query(`ALTER INDEX "ArtistTransfer_pkey" RENAME TO "Transfers_pkey";`);
  },
};
