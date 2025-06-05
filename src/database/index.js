import Sequelize from 'sequelize';
import databaseConfig from '../config/database.js'

import User from "../app/models/User.js";
import UserBankToken from "../app/models/UserBankToken.js";

const models = [User, UserBankToken];

class Database {
	constructor() {
		this.init();
	}
	init() {
		this.connection = new Sequelize(databaseConfig);

		models.forEach(model => model.init(this.connection));

		models.forEach(model => {
			if (model.associate) {
				model.associate(this.connection.models);
			}
		});
	}

}
export default new Database();
