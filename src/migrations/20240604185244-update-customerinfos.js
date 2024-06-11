'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adding a unique constraint to artistId in ArtistInfos table
    await queryInterface.addConstraint('CustomerInfos', {
      fields: ['customerId'],
      type: 'unique',
      name: 'unique_customerId_constraint',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('CustomerInfos', 'unique_artistId_constraint');
  },
};
