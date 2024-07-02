'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    await Promise.all([
      queryInterface.addColumn('ArtistBankingInfos', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }),
      queryInterface.addColumn('ArtistBankingInfos', 'updatedAt', { type: Sequelize.DATE }),
      queryInterface.addColumn('ArtistBankingInfos', 'deletedAt', { type: Sequelize.DATE }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
