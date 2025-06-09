// Importa faturas automaticamente das instituições conectadas via Open Finance

import axios from 'axios';
import Invoice from '../models/Invoice.js';
import UserBankToken from '../models/UserBankToken.js';
import generateSchedules from './ScheduleRulesService.js';
import NotificationSchedule from '../models/NotificationSchedule.js';

const BANK_URLS = {
    'api-mini-bc': 'http://api-mini-bc:3002',
    'banco-central': 'http://banco-central:3003',
    'bank-account-api': 'http://bank-account-api:3004',
    'mini-banco-central': 'http://mini-banco-central:3005',
};

async function importInvoices() {
    const tokens = await UserBankToken.findAll();

    for (const { user_cpf, bank_id, bank_token } of tokens) {
        const baseUrl = BANK_URLS[bank_id];
        if (!baseUrl) continue;

        try {
            const { data } = await axios.get(`${baseUrl}/faturas`, {
                headers: { Authorization: `Bearer ${bank_token}` },
            });

            for (const invoice of data) {
                const exists = await Invoice.findOne({
                    where: {
                        user_id: user_cpf,
                        description: invoice.description,
                        amount: invoice.amount,
                        due_date: invoice.due_date,
                        origin: 'Open Finance',
                    }
                });

                if (!exists) {
                    const created = await Invoice.create({
                        user_id: user_cpf,
                        description: invoice.description,
                        amount: invoice.amount,
                        due_date: invoice.due_date,
                        status: 'Em aberto',
                        origin: 'Open Finance',
                    });

                    const schedules = await generateSchedules(created);
                    await NotificationSchedule.bulkCreate(schedules);
                }
            }
        } catch (err) {
            console.error(`[ImportInvoicesJob] Erro ao importar faturas de ${bank_id}:`, err.message);
        }
    }
}

export default importInvoices;
