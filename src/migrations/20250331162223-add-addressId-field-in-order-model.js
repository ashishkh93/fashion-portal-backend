'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Order', 'addressId', {
      type: Sequelize.UUID,
      allowNull: true, // Adjust based on your requirements
      references: {
        model: 'CustomerAddress', // Ensure this matches your actual table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Order', 'addressId');
  },
};
