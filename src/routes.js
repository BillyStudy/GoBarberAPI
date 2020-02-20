import {Router} from 'express';
import multer from 'multer';
import MulterConfig from './config/multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';

import AuthMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(MulterConfig);

  routes.post('/users', UserController.store);
  routes.post('/sessions', SessionController.store);
  routes.post('/files',upload.single('file'), FileController.store);

  routes.use(AuthMiddleware);

  routes.put('/users', UserController.update);

export default routes;
