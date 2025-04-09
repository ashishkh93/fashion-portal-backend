'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addConstraint('ArtistInfoService', {
      fields: ['artistId'],
      type: 'foreign key',
      name: 'fk_artistInfoService_artistId', // Custom constraint name
      references: {
        table: 'ArtistInfo', // Make sure this matches your actual table name
        field: 'artistId',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Adjust based on your requirements
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint('ArtistInfoService', 'fk_artistInfoService_artistId');
  },
};
