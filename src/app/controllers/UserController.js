import * as Yup from 'yup';
import { Op } from 'sequelize';
import User from '../models/User.js';

class UserController {
	async store(req, res) {
		const schema = Yup.object().shape({
			cpf: Yup.string().required('CPF é obrigatório'),
			name: Yup.string().required('Nome é obrigatório'),
			email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
			password: Yup.string()
				.required('Senha é obrigatória')
				.min(6, 'A senha deve ter no mínimo 6 caracteres'),
			phone: Yup.string().optional(), // telefone é opcional
		});

		if (!(await schema.isValid(req.body))) {
			return res.status(400).json({ error: 'Falha na validação' });
		}

		const { cpf, email } = req.body;

		const userExists = await User.findOne({
			where: {
				[Op.or]: [{ cpf }, { email }],
			},
		});

		if (userExists) {
			return res.status(400).json({ error: 'CPF ou E-mail já está em uso.' });
		}

		const { name, phone } = await User.create(req.body);

		return res.status(201).json({ cpf, name, email, phone });
	}

	async update(req, res) {
		const schema = Yup.object().shape({
			name: Yup.string(),
			email: Yup.string().email('E-mail inválido'),
            phone: Yup.string(),
			oldPassword: Yup.string().min(6, 'A senha antiga deve ter no mínimo 6 caracteres'),
			password: Yup.string()
				.min(6, 'A nova senha deve ter no mínimo 6 caracteres')
				.when('oldPassword', (oldPassword, field) =>
					oldPassword ? field.required('Nova senha obrigatória') : field
				),
			confirmPassword: Yup.string().when('password', (password, field) =>
				password ? field.required('Confirmação obrigatória').oneOf([Yup.ref('password')], 'As senhas não coincidem') : field
			),
		});

		if (!(await schema.isValid(req.body))) {
			return res.status(400).json({ error: 'Falha na validação' });
		}

		const user = await User.findByPk(req.userCpf);

		if (!user) {
			return res.status(404).json({ error: 'Usuário não encontrado' });
		}

		if (req.body.email && req.body.email !== user.email) {
			const userExists = await User.findOne({ where: { email: req.body.email } });

			if (userExists) {
				return res.status(400).json({ error: 'E-mail já está em uso.' });
			}
		}

		if (req.body.oldPassword && !(await user.checkPassword(req.body.oldPassword))) {
			return res.status(401).json({ error: 'Senha antiga incorreta' });
		}

		await user.update(req.body);

		const { cpf, name, email, phone } = user;

		return res.json({ cpf, name, email, phone });
	}

	async index(req, res) {
		const user = await User.findByPk(req.userCpf);

		if (!user) {
			return res.status(404).json({ error: 'Usuário não encontrado' });
		}

		return res.json(user);
	}

	async delete(req, res) {
		const cpf = req.userCpf;

		const user = await User.findByPk(cpf);

		if (!user) {
			return res.status(404).json({ error: 'Usuário não encontrado' });
		}

		await user.destroy();

		return res.status(200).json({ message: 'Usuário deletado com sucesso' });
	}
}

export default new UserController();