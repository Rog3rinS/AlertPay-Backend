import { Router } from 'express';

import authMiddlewares from "./app/middlewares/auth.js";

import UserController from "./app/controllers/UserController.js";
import SessionController from "./app/controllers/SessionController.js";
import BankSessionController from "./app/controllers/BankSessionController.js";
import InvoiceController from './app/controllers/InvoiceController.js';
import NotificationScheduleController from './app/controllers/NotificationScheduleController.js';
import UserNotificationRuleController from './app/controllers/UserNotificationRuleController.js';

const routes = new Router();

routes.post('/users', UserController.store);
// JSON ROUTE
// {
//   "cpf": "12345678910",
//   "name": "Eduardo Kroth",
//   "email": "eduardo@kroth.com",
//   "password": "senha123"
// }

routes.post('/login', SessionController.store);

routes.use(authMiddlewares);

// ROTAS PROTEGIDAS (precisam do token JWT)
// ----------------------------------------

routes.put('/users', UserController.update);
// JSON ROUTE (exemplo para atualizar nome e email)
// {
//   "name": "Eduardo Kroth Silva",
//   "email": "eduardo.silva@kroth.com"
// }
// JSON ROUTE (exemplo para alterar senha)
// {
//   "oldPassword": "senha123",
//   "password": "novaSenha123",
//   "confirmPassword": "novaSenha123"
// }

routes.get('/users', UserController.index); // Não há JSON para GET

routes.delete('/users', UserController.delete); // Não há JSON para DELETE

routes.post('/bank-login', BankSessionController.store);
routes.delete('/bank-rm-login/:bankId', BankSessionController.delete);
routes.get('/bank-logins', BankSessionController.getAllBankTokens);

// Faturas
routes.post('/invoices', InvoiceController.store);
// JSON ROUTE (exemplo para criar uma nova fatura manual)
// OBS.: gera agendamento automaticamente com base nas regras do usuário; status será automaticamente "Em aberto"
// {
//  "description": "Conta de luz",
//  "amount": 320.50,
//  "due_date": "2025-07-10",
//  "origin": "Manual"
// }
routes.get('/invoices', InvoiceController.index); // Não há JSON para GET

routes.get('/invoices/manual', InvoiceController.getManualInvoices);

routes.put('/invoices/:id', InvoiceController.update);
// JSON ROUTE (exemplo para atualizar uma fatura) 
// OBS.: só permitido para faturas com origin "Manual"
// {
//  "description": "Conta de luz ajustada",
//  "amount": 305.00,
//  "status": "Paga"
// }
routes.delete('/invoices/:id', InvoiceController.delete); // Não há JSON para DELETE

// Agendamentos (apenas leitura e remoção)
routes.get('/schedules', NotificationScheduleController.index); // Não há JSON para GET
routes.delete('/schedules/:id', NotificationScheduleController.delete); // Não há JSON para DELETE

// Regras de notificação
routes.post('/user-rules', UserNotificationRuleController.store);
// JSON ROUTE (exemplo para criar uma nova regra personalizada de notificação)
// {
//  "days_before": 3,
//  "min_amount": 300,
//  "type": "email"
// }
routes.get('/user-rules', UserNotificationRuleController.index); // Não há JSON para GET
routes.delete('/user-rules/:id', UserNotificationRuleController.delete); // Não há JSON para DELETE

export default routes;
