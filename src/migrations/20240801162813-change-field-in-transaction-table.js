'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename the column userId to customerId
    await queryInterface.renameColumn('Transaction', 'userId', 'customerId');

    // Change the column type and add a foreign key reference
    await queryInterface.changeColumn('Transaction', 'customerId', {
      type: Sequelize.UUID,
      allowNull: false,
    });

    // Add the foreign key constraint separately
    await queryInterface.addConstraint('Transaction', {
      fields: ['customerId'],
      type: 'foreign key',
      references: {
        table: 'User',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the foreign key constraint
    await queryInterface.removeConstraint('Transaction', 'fk_transaction_user');

    // Change the column back to its original state
    await queryInterface.changeColumn('Transaction', 'customerId', {
      type: Sequelize.UUID,
      allowNull: false,
    });

    // Rename the column customerId back to userId
    await queryInterface.renameColumn('Transaction', 'customerId', 'userId');
  },
};
