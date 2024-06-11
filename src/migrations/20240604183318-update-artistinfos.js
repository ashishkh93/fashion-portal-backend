'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adding a unique constraint to artistId in ArtistInfos table
    await queryInterface.addConstraint('ArtistInfos', {
      fields: ['artistId'],
      type: 'unique',
      name: 'unique_artistId_constraint',
    });

    // Adding foreign key constraints to the Reviews table
    // await queryInterface.addConstraint('Reviews', {
    //   fields: ['givenBy'],
    //   type: 'foreign key',
    //   name: 'reviews_givenBy_fk',
    //   references: {
    //     table: 'CustomerInfos',
    //     field: 'customerId',
    //   },
    //   onDelete: 'CASCADE',
    //   onUpdate: 'CASCADE',
    // });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('ArtistInfos', 'unique_artistId_constraint');
  },
};
