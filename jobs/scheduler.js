import cron from 'node-cron';
import importInvoices from '../src/app/services/ImportInvoicesJob.js';
import updateInvoiceStatuses from '../src/app/services/UpdateInvoiceStatusJob.js';
import dispatchNotifications from '../src/app/services/NotificationDispatcherService.js'

// Executa os jobs imediatamente ao iniciar a API
/*
(async () => {
    console.log('[STARTUP] Executando jobs iniciais...');
    await importInvoices();
    await updateInvoiceStatuses();
    await dispatchNotifications();
    console.log('[STARTUP] Jobs iniciais concluídos.');
})();
*/

// Agenda execução automática a cada 30 minutos
cron.schedule('*/2 * * * *', async () => {
    console.log('[CRON] Executando jobs agendados...');
    await importInvoices();
    await updateInvoiceStatuses();
    await dispatchNotifications();
    console.log('[CRON] Jobs agendados finalizados.');
});
