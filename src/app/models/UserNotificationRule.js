import Sequelize, { Model } from 'sequelize';

class UserNotificationRule extends Model {
    static init(sequelize) {
        super.init({
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            user_cpf: {
                type: Sequelize.STRING,
                allowNull: false,
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
                type: Sequelize.ENUM('email', 'sms', 'push'),
                allowNull: false,
            },
        }, {
            sequelize,
            tableName: 'user_notification_rules',
        });

        return this;
    }

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_cpf', as: 'user' });
    }
}

export default UserNotificationRule;
