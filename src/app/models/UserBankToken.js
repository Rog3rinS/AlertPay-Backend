import { Model, DataTypes } from 'sequelize';

const BANK_IDS = [
	'api-mini-bc',
	'banco-central',
	'bank-account-api',
	'mini-banco-central',
];

class UserBankToken extends Model {
	static init(sequelize) {
		super.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					allowNull: false,
					autoIncrement: true,
				},
				user_cpf: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				bank_id: {
					type: DataTypes.ENUM(...BANK_IDS),
					allowNull: false,
					validate: {
						isIn: [BANK_IDS],
					},
				},
				bank_token: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
			},
			{
				sequelize,
				tableName: 'user_bank_tokens',
				underscored: true,
			}
		);
	}

	static associate(models) {
		this.belongsTo(models.User, {
			foreignKey: 'user_cpf',
			as: 'user',
		});
	}
}

export default UserBankToken;
export { BANK_IDS };
