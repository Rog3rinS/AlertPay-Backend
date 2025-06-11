import UserNotificationRule from '../models/UserNotificationRule.js';

async function generateSchedules(invoice) {
    const rules = await UserNotificationRule.findAll({
        where: { user_cpf: invoice.user_id },
    });

    const schedules = [];

    for (const rule of rules) {
        if (invoice.amount >= rule.min_amount && invoice.due_date) {
            const due = new Date(invoice.due_date);
            const now = new Date();

            const scheduledDate = new Date(due);
            scheduledDate.setDate(due.getDate() - rule.days_before);

            // Evita agendamento no passado
            if (scheduledDate < now) continue;

            // Validação de type
            const validTypes = ['email', 'sms', 'push'];
            if (!validTypes.includes(rule.type)) continue;

            schedules.push({
                invoice_id: invoice.id,
                scheduled_date: scheduledDate,
                type: rule.type,
                status: 'Pendente',
            });
        }
    }

    return schedules;
}

export default generateSchedules;
