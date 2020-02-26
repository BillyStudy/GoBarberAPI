import express from 'express';
import 'express-async-errors';
import path from 'path';
import routes from './routes';
import * as Sentry from '@sentry/node';
import sentryConfig from './config/sentry';
import Youch from 'youch';



import './database'

class App {
  constructor() {
    this.server = express();
    Sentry.init(sentryConfig);
    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }


  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')))
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler(){
    this.server.use(async (err, req, res, next) =>{
      const erros = await new Youch(err, req).toJSON();
      return res.status(500).json(erros);
    })
  }
}

export default new App().server;

// docker run --name mongobarber -p 27017:27017 -d -t mongo
// docker run --name redisbarber -p 6379:6379 -d -t redis:alpine
