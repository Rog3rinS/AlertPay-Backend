// Gerencia o CRUD de faturas e gera agendamentos automaticamente

import Invoice from '../models/Invoice.js';
import generateSchedules from '../services/ScheduleRulesService.js';
import NotificationSchedule from '../models/NotificationSchedule.js';

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
        const invoices = await Invoice.findAll({ where: { user_id: req.userCpf } });
        return res.json(invoices);
    }

    async update(req, res) {
        const invoice = await Invoice.findOne({
            where: { id: req.params.id, user_id: req.userCpf },
        });

        if (!invoice) return res.status(404).json({ error: 'Fatura não encontrada' });

        // Só permite atualização de status para faturas manuais
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
