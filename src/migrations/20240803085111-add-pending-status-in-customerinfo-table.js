'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Step 1: Create the new enum type
      await queryInterface.sequelize.query(
        "CREATE TYPE \"enum_CustomerInfo_status_new\" AS ENUM('APPROVED', 'PENDING', 'BLOCKED')",
        { transaction }
      );

      // Step 2: Change the column to use the new enum type
      await queryInterface.sequelize.query(
        `ALTER TABLE "CustomerInfo" 
         ALTER COLUMN "status" TYPE "enum_CustomerInfo_status_new" 
         USING "status"::text::"enum_CustomerInfo_status_new"`,
        { transaction }
      );

      // Step 3: Drop the old enum type
      await queryInterface.sequelize.query('DROP TYPE "enum_CustomerInfos_status"', { transaction });

      // Step 4: Rename the new enum type to the old name (if needed)
      await queryInterface.sequelize.query(
        'ALTER TYPE "enum_CustomerInfo_status_new" RENAME TO "enum_CustomerInfo_status"',
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Repeat the process in reverse if needed
      await queryInterface.sequelize.query("CREATE TYPE \"enum_CustomerInfos_status_new\" AS ENUM('APPROVED', 'BLOCKED')", {
        transaction,
      });

      await queryInterface.sequelize.query(
        `ALTER TABLE "CustomerInfo" 
         ALTER COLUMN "status" TYPE "enum_CustomerInfos_status_new" 
         USING "status"::text::"enum_CustomerInfos_status_new"`,
        { transaction }
      );

      await queryInterface.sequelize.query('DROP TYPE "enum_CustomerInfo_status"', { transaction });

      await queryInterface.sequelize.query(
        'ALTER TYPE "enum_CustomerInfos_status_new" RENAME TO "enum_CustomerInfos_status"',
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
