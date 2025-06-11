// Importa faturas automaticamente das instituições conectadas via Open Finance

import axios from 'axios';
import Invoice from '../models/Invoice.js';
import UserBankToken from '../models/UserBankToken.js';
import generateSchedules from './ScheduleRulesService.js';
import NotificationSchedule from '../models/NotificationSchedule.js';

// This map holds the actual internal Docker hostnames for communication.
// It is used here because bank_id comes directly from UserBankToken.
const BANK_URLS = {
    'api-mini-bc': 'http://open-finance-api-minibc-1:3002',
    'banco-central': 'http://open-finance-bancocentral-1:3003',
    'bank-account-api': 'http://open-finance-bank-account-api-1:3004',
    'mini-banco-central': 'http://open-finance-mini-banco-central-1:3005',
};

async function importInvoices() {
    const tokens = await UserBankToken.findAll();

    for (const { user_cpf, bank_id, bank_token } of tokens) {
        const baseUrl = BANK_URLS[bank_id];
        if (!baseUrl) {
            console.warn(`[ImportInvoicesJob] URL não configurada para o banco ${bank_id}. Pulando.`);
            continue;
        }

        try {
            const { data: bankInvoices } = await axios.get(`${baseUrl}/invoices`, {
                headers: { Authorization: `Bearer ${bank_token}` },
            });

            for (const invoice of bankInvoices) {
                // Normalize due_date to a Date object for consistent comparison
                const normalizedDueDate = invoice.due_date ? new Date(invoice.due_date) : null;

                const exists = await Invoice.findOne({
                    where: {
                        user_id: user_cpf,
                        description: invoice.description,
                        amount: parseFloat(invoice.amount), // Parse amount as float for consistent comparison
                        due_date: normalizedDueDate, // Use the normalized Date object
                        origin: 'Open Finance',
                    }
                });

                if (!exists) {
                    const created = await Invoice.create({
                        user_id: user_cpf,
                        description: invoice.description,
                        amount: parseFloat(invoice.amount), // Parse amount as float before creation
                        due_date: normalizedDueDate, // Use the normalized Date object
                        status: 'Em aberto',
                        origin: 'Open Finance',
                    });

                    const schedules = await generateSchedules(created);
                    await NotificationSchedule.bulkCreate(schedules);
                }
            }
        } catch (err) {
            console.error(`[ImportInvoicesJob] Erro ao importar faturas de ${bank_id}:`, err.message);
            // Log more details if err.response exists for better debugging
            if (err.response) {
                console.error(`[ImportInvoicesJob] Resposta de erro do banco ${bank_id}:`, err.response.status, err.response.data);
            }
        }
    }
}

export default importInvoices;
