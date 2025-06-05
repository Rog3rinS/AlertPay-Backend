import axios from "axios";
import * as Yup from "yup";

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

		console.log('request body:', JSON.stringify(req.body));

		try {
			await schema.validate(req.body, { abortEarly: false });
		} catch (err) {
			console.log('Falha na validacao:', err.errors);
			return res.status(400).json({ error: 'Falha na validacao', details: err.errors });
		}

		const { email, password, bankBaseUrl } = req.body;

		try {
			const response = await axios.post(`${bankBaseUrl}/login`, { email, password });
			return res.json(response.data);
		} catch (err) {
			return res.status(err.response?.status || 500).json({
				error: err.response?.data?.error || 'Login com banco externo falhou',
			});
		}
	}
}

export default new BankSessionController();
