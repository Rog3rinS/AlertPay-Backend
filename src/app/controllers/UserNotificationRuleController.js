// Gerencia as regras configuráveis de notificação para cada usuário

import UserNotificationRule from '../models/UserNotificationRule.js';

class UserNotificationRuleController {
    async index(req, res) {
        const rules = await UserNotificationRule.findAll({ where: { user_cpf: req.userCpf } });
        return res.json(rules);
    }

    async store(req, res) {
        const { days_before, min_amount, type } = req.body;

        const rule = await UserNotificationRule.create({
            user_cpf: req.userCpf,
            days_before,
            min_amount,
            type,
        });

        return res.status(201).json(rule);
    }

    async delete(req, res) {
        const rule = await UserNotificationRule.findOne({
            where: { id: req.params.id, user_cpf: req.userCpf },
        });

        if (!rule) return res.status(404).json({ error: 'Regra não encontrada' });

        await rule.destroy();
        return res.json({ message: 'Regra removida com sucesso' });
    }
}

export default new UserNotificationRuleController();
