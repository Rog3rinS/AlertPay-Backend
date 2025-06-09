'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_notification_schedules_type" AS ENUM ('email', 'sms', 'push');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_notification_schedules_status" AS ENUM ('Pendente', 'Enviado', 'Erro');
    `);

    await queryInterface.createTable('notification_schedules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      invoice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'invoices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      scheduled_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      type: {
        type: 'enum_notification_schedules_type',
        allowNull: false,
      },
      status: {
        type: 'enum_notification_schedules_status',
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notification_schedules');

    await queryInterface.sequelize.query(`DROP TYPE "enum_notification_schedules_type";`);
    await queryInterface.sequelize.query(`DROP TYPE "enum_notification_schedules_status";`);
  },
};
