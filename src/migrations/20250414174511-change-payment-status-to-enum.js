'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Transaction', 'paymentStatus', {
      type: Sequelize.ENUM('SUCCESS', 'FAILURE', 'VOID', 'INCOMPLETE', 'PENDING', 'FLAGGED', 'CANCELLED', 'USER_DROPPED'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Transaction', 'paymentStatus', { type: Sequelize.STRING, allowNull: false });
  },
};
