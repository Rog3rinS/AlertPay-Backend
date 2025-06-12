// src/app/controllers/BankSessionController.js
import axios from "axios";
import * as Yup from "yup";
import UserBankToken from "../models/UserBankToken.js";

// Mapeamento de bank_id → endpoint interno (Docker)
const INTERNAL_BANK_ENDPOINTS = {
	'api-mini-bc': 'http://open-finance-api-minibc-1:3002',
	'banco-central': 'http://open-finance-bancocentral-1:3003',
	'bank-account-api': 'http://open-finance-bank-account-api-1:3004',
	'mini-banco-central': 'http://open-finance-mini-banco-central-1:3005',
};

class BankSessionController {
	async store(req, res) {
		const schema = Yup.object().shape({
			email: Yup.string().email().required(),
			password: Yup.string().required(),
			bankId: Yup.string()
				.oneOf(Object.keys(INTERNAL_BANK_ENDPOINTS), 'bankId inválido')
				.required(),
		});

		try {
			await schema.validate(req.body, { abortEarly: false });
		} catch (err) {
			return res.status(400).json({ error: 'Falha na validação', details: err.errors });
		}

		const { email, password, bankId } = req.body;
		const userCpf = req.userCpf;

		const internalBankUrl = INTERNAL_BANK_ENDPOINTS[bankId];

		try {
			const response = await axios.post(`${internalBankUrl}/login`, { email, password });
			const bankToken = response.data.token;

			const [userBankToken, created] = await UserBankToken.findOrCreate({
				where: { user_cpf: userCpf, bank_id: bankId },
				defaults: { bank_token: bankToken }
			});

			if (!created) {
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

	async delete(req, res) {
		const schema = Yup.object().shape({
			bankId: Yup.string()
				.oneOf(Object.keys(INTERNAL_BANK_ENDPOINTS), 'bankId inválido')
				.required(),
		});

		try {
			// CORREÇÃO 1: Validar req.params em vez de req.body
			await schema.validate(req.params, { abortEarly: false });
		} catch (err) {
			return res.status(400).json({ error: 'Falha na validação', details: err.errors });
		}

		// CORREÇÃO 2: Extrair bankId de req.params
		const { bankId } = req.params;
		const userCpf = req.userCpf;

		try {
			const deletedCount = await UserBankToken.destroy({
				where: { user_cpf: userCpf, bank_id: bankId },
			});

			if (deletedCount === 0) {
				return res.status(404).json({ error: 'Token não encontrado para este banco' });
			}

			return res.json({ message: 'Token removido com sucesso' });
		} catch (err) {
			return res.status(500).json({ error: 'Erro ao remover o token' });
		}
	}

	async getAllBankTokens(req, res) {
		const userCpf = req.userCpf;
		try {
			const connectedTokens = await UserBankToken.findAll({
				where: { user_cpf: userCpf },
				attributes: ['bank_id'],
			});

			// Retorna o array de tokens diretamente
			return res.json(connectedTokens);

		} catch (err) {
			console.error("Error fetching connected banks:", err);
			return res.status(500).json({ error: 'Erro ao buscar bancos conectados' });
		}
	}
}

export default new BankSessionController();
