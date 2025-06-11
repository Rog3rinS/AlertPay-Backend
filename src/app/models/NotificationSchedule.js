import Sequelize, { Model } from 'sequelize';

class NotificationSchedule extends Model {
    static init(sequelize) {
        super.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            invoice_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            scheduled_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            type: {
                type: Sequelize.ENUM('email', 'sms', 'push'),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('Pendente', 'Enviado', 'Erro'),
                allowNull: false,
            },
        }, {
            sequelize,
            tableName: 'notification_schedules',
        });

        return this;
    }

    static associate(models) {
        this.belongsTo(models.Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
    }
}

export default NotificationSchedule;
