// src/app/controllers/BankSessionController.js
import axios from "axios";
import * as Yup from "yup";
import UserBankToken from '../models/UserBankToken.js';

// This map is used to VALIDATE the incoming 'bankBaseUrl' from the client
// and to get the canonical 'bank_id' (e.g., 'banco-central').
// Its keys MUST match the URLs that the client is expected to send.
const BANK_URL_TO_ID = {
	'http://api-mini-bc:3002': 'api-mini-bc',
	'http://banco-central:3003': 'banco-central',
	'http://bank-account-api:3004': 'bank-account-api',
	'http://mini-banco-central:3005': 'mini-banco-central',
};

// This new map holds the ACTUAL INTERNAL DOCKER HOSTNAMES
// that the backend should use to communicate with the bank services.
// Its keys are the 'bank_id's (e.g., 'banco-central').
const INTERNAL_BANK_ENDPOINTS = {
	'api-mini-bc': 'http://open-finance-api-minibc-1:3002',
	'banco-central': 'http://open-finance-bancocentral-1:3003',
	'bank-account-api': 'http://open-finance-bank-account-api-1:3004', // Implied, verify actual name from your Open Finance setup
	'mini-banco-central': 'http://open-finance-mini-banco-central-1:3005', // Implied, verify actual name from your Open Finance setup
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

		// Use BANK_URL_TO_ID to get the canonical bank_id from the client's request
		const bank_id = BANK_URL_TO_ID[bankBaseUrl];
		if (!bank_id) {
			return res.status(400).json({ error: 'bankBaseUrl não corresponde a um banco conhecido' });
		}

		// Get the internal URL for the axios call using the canonical bank_id
		const internalBankUrl = INTERNAL_BANK_ENDPOINTS[bank_id];
		if (!internalBankUrl) {
			// This case should ideally not happen if INTERNAL_BANK_ENDPOINTS is complete
			return res.status(500).json({ error: 'Configuração interna do banco não encontrada' });
		}

		try {
			// Use the internalBankUrl for the actual API request to the bank service
			const response = await axios.post(`${internalBankUrl}/login`, { email, password });
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
