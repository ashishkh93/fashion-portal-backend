'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'RECHECK' to the enum type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Arts_status"
      ADD VALUE IF NOT EXISTS 'RECHECK';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Can't remove enum values in PostgreSQL easily
    // You can either recreate the enum (complex) or leave it
    // Optional: log a warning or note
    console.warn('Downgrade not supported for enum value removal.');
  },
};
