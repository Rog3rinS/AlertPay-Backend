import cron from 'node-cron';
import importInvoices from '../src/app/services/ImportInvoicesJob.js';
import updateInvoiceStatuses from '../src/app/services/UpdateInvoiceStatusJob.js';

// Executa os jobs uma vez assim que a API inicia
(async () => {
    console.log('[STARTUP] Executando jobs iniciais...');
    await importInvoices();
    await updateInvoiceStatuses();
    console.log('[STARTUP] Jobs iniciais concluídos.');
})();

// Agenda execução automática a cada 30 minutos
cron.schedule('*/30 * * * *', async () => {
    console.log('[CRON] Executando jobs agendados...');
    await importInvoices();
    await updateInvoiceStatuses();
    console.log('[CRON] Jobs agendados finalizados.');
});
