import { Router } from 'express';

import authMiddlewares from "./app/middlewares/auth.js";

import UserController from "./app/controllers/UserController.js";
import SessionController from "./app/controllers/SessionController.js";

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

routes.get('/users', UserController.index);
// Não há JSON para GET

routes.delete('/users', UserController.delete);
// Não há JSON para DELETE

export default routes;
