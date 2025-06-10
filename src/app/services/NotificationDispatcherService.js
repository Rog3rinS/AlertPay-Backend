import 'dotenv/config';
import { Op } from 'sequelize';
import nodemailer from 'nodemailer';
import axios from 'axios';
import NotificationSchedule from '../models/NotificationSchedule.js';
import Invoice from '../models/Invoice.js';
import User from '../models/User.js';

// === Credenciais via .env ===

// E-mail (Nodemailer)
const mailTransporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Push (OneSignal)
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

// Número do sistema para SMS simulado
const SMS_FROM = process.env.SMS_FROM || 'Sistema';

async function dispatchNotifications() {
    const now = new Date();

    const schedules = await NotificationSchedule.findAll({
        where: {
            status: 'Pendente',
            scheduled_date: { [Op.lte]: now },
        },
        include: [
            {
                model: Invoice,
                as: 'invoice',
                include: [{ model: User, as: 'user' }],
            },
        ],
    });

    for (const schedule of schedules) {
        const { type, invoice } = schedule;
        const { user } = invoice;

        try {
            const message = `Olá, ${user.name}! Sua fatura de R$${invoice.amount} vence em ${new Date(invoice.due_date).toLocaleDateString()}!`;

            // Envio por e-mail (Nodemailer)
            if (type === 'email') {
                await mailTransporter.sendMail({
                    from: `"Sistema de Faturas" <${process.env.MAIL_USER}>`,
                    to: user.email,
                    subject: 'Lembrete de Fatura',
                    text: message,
                });

            // Envio por SMS (Simulado)
            } else if (type === 'sms') {
                console.log(`[SIMULAÇÃO DE SMS] De: ${SMS_FROM} Para: ${user.phone || 'número não informado'} | Mensagem: ${message}`);

            // Envio por push (OneSignal)
            } else if (type === 'push') {
                await axios.post('https://onesignal.com/api/v1/notifications', {
                    app_id: ONESIGNAL_APP_ID,
                    include_external_user_ids: [user.cpf],
                    headings: { en: 'Lembrete de Fatura' },
                    contents: { en: message },
                }, {
                    headers: {
                        Authorization: `Basic ${ONESIGNAL_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                });
            }

            schedule.status = 'Enviado';
            await schedule.save();

        } catch (err) {
            schedule.status = 'Erro';
            await schedule.save();
            console.error(`[Notificação] Erro ao enviar (${type}) para ${user.email || user.phone}:`, err.message);
        }
    }
}

export default dispatchNotifications;