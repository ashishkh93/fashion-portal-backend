'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the column already exists
    const columns = await queryInterface.describeTable('ArtistBankingInfo');

    // Remove existing column if it exists
    if (columns.upiHash) {
      await queryInterface.removeColumn('ArtistBankingInfo', 'upiHash');
    }

    // Add the column
    await queryInterface.addColumn('ArtistBankingInfo', 'upiHash', {
      type: Sequelize.STRING(64),
      allowNull: false,
    });

    // Add a unique constraint
    await queryInterface.addConstraint('ArtistBankingInfo', {
      fields: ['upiHash'],
      type: 'unique',
      name: 'unique_upiHash_constraint',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the unique constraint
    await queryInterface.removeConstraint('ArtistBankingInfo', 'unique_upiHash_constraint');

    // Remove the column
    await queryInterface.removeColumn('ArtistBankingInfo', 'upiHash');
  },
};
