import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
	static init(sequelize) {
		super.init({
			cpf: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			phone: {
                type: Sequelize.STRING,
                allowNull: true, // Pode ser opcional, mas recomendado para SMS
            },
			password: {
				type: Sequelize.STRING,
				allowNull: false,
			},
		}, {
			sequelize,
			tableName: 'users',
		});

		this.addHook('beforeSave', async (user) => {
			if (user.password) {
				user.password = await bcrypt.hash(user.password, 6);
			}
		});

		return this;
	}

	checkPassword(password) {
		return bcrypt.compare(password, this.password);
	}
}

export default User;
