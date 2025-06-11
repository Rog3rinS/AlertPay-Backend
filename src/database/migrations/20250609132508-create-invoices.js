'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_invoices_status" AS ENUM ('Em aberto', 'Paga', 'Vencida');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_invoices_origin" AS ENUM ('Manual', 'Open Finance');
    `);

    await queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: 'users', key: 'cpf' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: 'enum_invoices_status',
        allowNull: false,
      },
      origin: {
        type: 'enum_invoices_origin',
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
    await queryInterface.dropTable('invoices');

    await queryInterface.sequelize.query(`DROP TYPE "enum_invoices_status";`);
    await queryInterface.sequelize.query(`DROP TYPE "enum_invoices_origin";`);
  },
};
