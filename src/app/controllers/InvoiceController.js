import axios from 'axios';
import * as Yup from 'yup';
import Invoice from '../models/Invoice.js';
import UserBankToken from '../models/UserBankToken.js';
import generateSchedules from '../services/ScheduleRulesService.js';
import NotificationSchedule from '../models/NotificationSchedule.js';

const INTERNAL_BANK_ENDPOINTS = {
    'api-mini-bc': 'http://open-finance-api-minibc-1:3002',
    'banco-central': 'http://open-finance-bancocentral-1:3003',
    'bank-account-api': 'http://open-finance-bank-account-api-1:3004',
    'mini-banco-central': 'http://open-finance-mini-banco-central-1:3005',
};

class InvoiceController {
    async store(req, res) {
        const invoice = await Invoice.create({
            ...req.body,
            user_id: req.userCpf,
            status: 'Em aberto',
            origin: req.body.origin || 'Manual',
        });

        const schedules = await generateSchedules(invoice);
        await NotificationSchedule.bulkCreate(schedules);

        return res.status(201).json(invoice);
    }

    async index(req, res) {
        const schema = Yup.object().shape({
            bankId: Yup.string()
                .oneOf(Object.keys(INTERNAL_BANK_ENDPOINTS), 'bankId inválido')
                .required(),
        });

        try {
            await schema.validate(req.query, { abortEarly: false });
        } catch (err) {
            return res.status(400).json({ error: 'Falha na validação', details: err.errors });
        }

        const { bankId } = req.query;
        const userCpf = req.userCpf;
        const internalBankUrl = INTERNAL_BANK_ENDPOINTS[bankId];

        const userBankToken = await UserBankToken.findOne({
            where: { user_cpf: userCpf, bank_id: bankId },
        });

        if (!userBankToken) {
            return res.status(401).json({
                error: 'Usuário não está autenticado com este banco. Faça login primeiro.',
            });
        }

        try {
            const response = await axios.get(`${internalBankUrl}/invoices`, {
                params: { cpf: userCpf },
                headers: {
                    Authorization: `Bearer ${userBankToken.bank_token}`,
                },
            });

            return res.json(response.data);
        } catch (err) {
            return res.status(err.response?.status || 500).json({
                error: err.response?.data?.error || 'Erro ao buscar faturas no banco externo',
            });
        }
    }

    async getManualInvoices(req, res) {
        const userCpf = req.userCpf;

        try {
            const manualInvoices = await Invoice.findAll({
                where: { user_id: userCpf, origin: 'Manual' },
            });
            return res.json(manualInvoices);
        } catch (error) {
            console.error("Erro ao buscar faturas manuais:", error);
            return res.status(500).json({ error: 'Erro ao buscar faturas manuais' });
        }
    }

    async update(req, res) {
        const invoice = await Invoice.findOne({
            where: { id: req.params.id, user_id: req.userCpf },
        });

        if (!invoice) return res.status(404).json({ error: 'Fatura não encontrada' });

        if (invoice.origin !== 'Manual' && req.body.status) {
            return res.status(403).json({
                error: 'Você não pode atualizar o status de faturas importadas automaticamente',
            });
        }

        await invoice.update(req.body);
        return res.json(invoice);
    }

    async delete(req, res) {
        const invoice = await Invoice.findOne({
            where: { id: req.params.id, user_id: req.userCpf },
        });

        if (!invoice) return res.status(404).json({ error: 'Fatura não encontrada' });

        await invoice.destroy();
        return res.json({ message: 'Fatura removida' });
    }
}

export default new InvoiceController();
