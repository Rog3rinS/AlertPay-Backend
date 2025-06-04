import Sequelize from 'sequelize';
import databaseConfig from '../config/database.js'

import User from "../app/models/User.js";

const models = [User];

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
