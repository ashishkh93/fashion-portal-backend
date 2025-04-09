'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('CustomerAddress', 'orderId');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('CustomerAddress', 'orderId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'Order', key: 'id' },
      onDelete: 'NO ACTION',
      onUpdate: 'CASCADE',
    });
  },
};
