import Sequelize, { Model } from 'sequelize';

class Invoice extends Model {
    static init(sequelize) {
        super.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: true,
            },
            user_id: {
                type: Sequelize.STRING,
                allowNull: false,
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
                type: Sequelize.ENUM('Em aberto', 'Paga', 'Vencida'),
                allowNull: false,
            },
            origin: {
                type: Sequelize.ENUM('Manual', 'Open Finance'),
                allowNull: false,
            },
        }, {
            sequelize,
            tableName: 'invoices',
        });

        return this;
    }

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
}

export default Invoice;
