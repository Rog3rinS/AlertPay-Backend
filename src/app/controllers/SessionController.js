import jwt from 'jsonwebtoken';
import User from '../models/User.js';

import authConfig from '../../config/auth.js';

class SessionController {
	async store(req, res) {
		const { email, password } = req.body;

		const user = await User.findOne({ where: { email } });

		if (!user) {
			return res.status(401).json({ error: 'Usuário não existe' });
		}

		if (!(await user.checkPassword(password))) {
			return res.status(401).json({ error: 'senha incorreta' });
		}

		const { cpf, name, phone } = user;

        return res.json({
            user: {
                cpf,
                name,
                email,
                phone,
            },
            token: jwt.sign({ cpf }, authConfig.secret, {
                expiresIn: authConfig.expiresIn,
            }),
        });
    }
}
export default new SessionController()
