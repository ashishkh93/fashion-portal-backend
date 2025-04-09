'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove default first
    await queryInterface.sequelize.query(`
      ALTER TABLE "CustomerAddress"
      ALTER COLUMN "country" DROP DEFAULT;
    `);

    // 2. Change column type to ENUM
    await queryInterface.changeColumn('CustomerAddress', 'country', {
      type: Sequelize.ENUM('india'),
      allowNull: false,
    });

    // 3. Set the default again
    await queryInterface.sequelize.query(`
      ALTER TABLE "CustomerAddress"
      ALTER COLUMN "country" SET DEFAULT 'india';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Similar process in reverse (if needed)
    await queryInterface.sequelize.query(`
      ALTER TABLE "CustomerAddress"
      ALTER COLUMN "country" DROP DEFAULT;
    `);

    await queryInterface.changeColumn('CustomerAddress', 'country', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE "CustomerAddress"
      ALTER COLUMN "country" SET DEFAULT 'india';
    `);

    // Optionally, drop ENUM type if rolling back
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_CustomerAddress_country";
    `);
  },
};
