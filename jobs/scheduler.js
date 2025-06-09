// Executa jobs de forma automática usando node-cron
import cron from 'node-cron';
import importInvoices from '../app/services/ImportInvoicesJob.js';
import updateInvoiceStatuses from '../app/services/UpdateInvoiceStatusJob.js';

cron.schedule('*/30 * * * *', async () => {
    console.log('[CRON] Iniciando execução automática...');
    await importInvoices();
    await updateInvoiceStatuses();
    console.log('[CRON] Execução automática concluída.');
});
