'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    await queryInterface.addConstraint('Orders', {
      fields: ['orderIdentity'],
      type: 'unique',
      name: 'unique_orderIdentity_constraint',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Orders', 'unique_orderIdentity_constraint');
  },
};
