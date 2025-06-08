'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to Devices table
    await queryInterface.addColumn('Devices', 'platform', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'deviceType'
    });

    await queryInterface.addColumn('Devices', 'version', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'platform'
    });

    await queryInterface.addColumn('Devices', 'lastConnectedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'isActive'
    });

    await queryInterface.addColumn('Devices', 'metadata', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
      after: 'lastConnectedAt'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns in reverse order
    await queryInterface.removeColumn('Devices', 'metadata');
    await queryInterface.removeColumn('Devices', 'lastConnectedAt');
    await queryInterface.removeColumn('Devices', 'version');
    await queryInterface.removeColumn('Devices', 'platform');
  }
};
