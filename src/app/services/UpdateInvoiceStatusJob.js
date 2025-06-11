// Atualiza o status das faturas importadas com base nas informações dos bancos

import axios from 'axios';
import Invoice from '../models/Invoice.js'; // Corrected path from '../models/Invoice.js'
import UserBankToken from '../models/UserBankToken.js'; // Corrected path from '../models/UserBankToken.js'

// This map holds the actual internal Docker hostnames for communication.
// It is used here because bank_id comes directly from UserBankToken.
const BANK_URLS = {
    'api-mini-bc': 'http://open-finance-api-minibc-1:3002',
    'banco-central': 'http://open-finance-bancocentral-1:3003',
    'bank-account-api': 'http://open-finance-bank-account-api-1:3004',
    'mini-banco-central': 'http://open-finance-mini-banco-central-1:3005',
};

const normalizeStatus = (status) => {
    switch (status) {
        case 'Paga': return 'Paga';
        case 'Vencida': return 'Vencida';
        case 'Em aberto': return 'Em aberto';
        default: return 'Em aberto';
    }
};

async function updateInvoiceStatuses() {
    const tokens = await UserBankToken.findAll();

    for (const token of tokens) {
        const baseUrl = BANK_URLS[token.bank_id];
        if (!baseUrl) {
            console.warn(`[UpdateInvoiceStatusJob] URL não configurada para o banco ${token.bank_id}. Pulando.`);
            continue;
        }

        try {
            const { data: bankInvoices } = await axios.get(`${baseUrl}/invoices`, {
                headers: { Authorization: `Bearer ${token.bank_token}` },
            });

            const localInvoices = await Invoice.findAll({
                where: {
                    user_id: token.user_cpf,
                    origin: 'Open Finance'
                }
            });

            for (const local of localInvoices) {
                const match = bankInvoices.find(bank =>
                    bank.description === local.description &&
                    parseFloat(bank.amount) === parseFloat(local.amount) &&
                    new Date(bank.due_date).toISOString().slice(0, 10) ===
                    new Date(local.due_date).toISOString().slice(0, 10)
                );

                if (match) {
                    const newStatus = normalizeStatus(match.status);
                    if (local.status !== newStatus) {
                        local.status = newStatus;
                        await local.save();
                    }
                }
            }
        } catch (err) {
            console.error(`[UpdateInvoiceStatusJob] Erro com banco ${token.bank_id}:`, err.message);
            // Log more details if err.response exists for better debugging
            if (err.response) {
                console.error(`[UpdateInvoiceStatusJob] Resposta de erro do banco ${token.bank_id}:`, err.response.status, err.response.data);
            }
        }
    }
}

export default updateInvoiceStatuses;
