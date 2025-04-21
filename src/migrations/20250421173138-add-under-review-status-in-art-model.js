'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename the old enum type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Arts_status" RENAME TO "enum_Arts_status_old";
    `);

    // Create the new enum type without 'RECHECK', and with 'UNDER_REVIEW'
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Arts_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW');
    `);

    // Alter the column to use the new enum type, casting values
    await queryInterface.sequelize.query(`
      ALTER TABLE "Art"
      ALTER COLUMN "status" TYPE "enum_Arts_status"
      USING 
        CASE 
          WHEN "status" = 'RECHECK' THEN 'UNDER_REVIEW'::text::"enum_Arts_status"
          ELSE "status"::text::"enum_Arts_status"
        END;
    `);

    // Drop the old enum type
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Arts_status_old";
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to the old enum (with 'RECHECK') if needed
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Arts_status_old" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RECHECK');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "Art"
      ALTER COLUMN "status" TYPE "enum_Arts_status_old"
      USING 
        CASE 
          WHEN "status" = 'UNDER_REVIEW' THEN 'RECHECK'::text::"enum_Arts_status_old"
          ELSE "status"::text::"enum_Arts_status_old"
        END;
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Arts_status";
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Arts_status_old" RENAME TO "enum_Arts_status";
    `);
  },
};
