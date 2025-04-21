'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'UNDER_REVIEW' to the enum type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ArtistInfos_status"
      ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Can't remove enum values in PostgreSQL easily
    // You can either recreate the enum (complex) or leave it
    // Optional: log a warning or note
    console.warn('Downgrade not supported for enum value removal.');
  },
};
