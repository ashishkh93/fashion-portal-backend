'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Remove duplicate fields from the artistInfo model, which we are migrating to another table
     */
    await Promise.all([
      queryInterface.removeColumn('ArtistInfos', 'beneficiaryId'),
      queryInterface.removeColumn('ArtistInfos', 'bankName'),
      queryInterface.removeColumn('ArtistInfos', 'upi'),
    ]);
  },
};
