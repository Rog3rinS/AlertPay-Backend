import axios from "axios";
import * as Yup from "yup";
import UserBankToken from '../models/UserBankToken.js';

const BANK_URL_TO_ID = {
	'http://api-mini-bc:3002': 'api-mini-bc',
	'http://banco-central:3003': 'banco-central',
	'http://bank-account-api:3004': 'bank-account-api',
	'http://mini-banco-central:3005': 'mini-banco-central',
};

class BankSessionController {
	async store(req, res) {
		const schema = Yup.object().shape({
			email: Yup.string().email().required(),
			password: Yup.string().required(),
			bankBaseUrl: Yup.string()
				.required()
				.test('is-url', 'bankBaseUrl deve ser uma URL válida', value => {
					try {
						new URL(value);
						return true;
					} catch {
						return false;
					}
				}),
		});

		try {
			await schema.validate(req.body, { abortEarly: false });
		} catch (err) {
			return res.status(400).json({ error: 'Falha na validacao', details: err.errors });
		}

		const { email, password, bankBaseUrl } = req.body;
		const userCpf = req.userCpf;

		const bank_id = BANK_URL_TO_ID[bankBaseUrl];
		if (!bank_id) {
			return res.status(400).json({ error: 'bankBaseUrl não corresponde a um banco conhecido' });
		}

		try {
			const response = await axios.post(`${bankBaseUrl}/login`, { email, password });
			const bankToken = response.data.token;

			// Verifica se já existe o token para esse user + banco
			const [userBankToken, created] = await UserBankToken.findOrCreate({
				where: { user_cpf: userCpf, bank_id },
				defaults: { bank_token: bankToken }
			});

			if (!created) {
				// Atualiza o token se já existia
				userBankToken.bank_token = bankToken;
				await userBankToken.save();
			}

			return res.json({ message: 'Login no banco feito com sucesso', bankToken });
		} catch (err) {
			return res.status(err.response?.status || 500).json({
				error: err.response?.data?.error || 'Login com banco externo falhou',
			});
		}
	}
}

export default new BankSessionController();
