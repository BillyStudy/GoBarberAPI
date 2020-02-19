import {Router} from 'express';
import multer from 'multer';
import MulterConfig from './config/multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import AuthMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(MulterConfig);

  routes.post('/users', UserController.store);
  routes.post('/sessions', SessionController.store);
  routes.post('/files',upload.single('file'), (req, res) => {
    return res.json({message: "OK"})
  });

  routes.use(AuthMiddleware);

  routes.put('/users', UserController.update);

export default routes;
