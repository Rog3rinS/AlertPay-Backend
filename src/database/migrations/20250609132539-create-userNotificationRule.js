'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_user_notification_rules_type" AS ENUM ('email', 'sms', 'push');
    `);

    await queryInterface.createTable('user_notification_rules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_cpf: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: 'users', key: 'cpf' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      days_before: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      min_amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      type: {
        type: 'enum_user_notification_rules_type',
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
    await queryInterface.dropTable('user_notification_rules');

    await queryInterface.sequelize.query(`DROP TYPE "enum_user_notification_rules_type";`);
  },
};
