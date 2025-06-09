// Consulta e remove agendamentos (geração é automática)

import NotificationSchedule from '../models/NotificationSchedule.js';

class NotificationScheduleController {
    async index(req, res) {
        const schedules = await NotificationSchedule.findAll();
        return res.json(schedules);
    }

    async delete(req, res) {
        const schedule = await NotificationSchedule.findByPk(req.params.id);
        if (!schedule) return res.status(404).json({ error: 'Agendamento não encontrado' });

        await schedule.destroy();
        return res.json({ message: 'Agendamento removido' });
    }
}

export default new NotificationScheduleController();
