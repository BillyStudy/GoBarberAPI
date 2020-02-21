import nodemailer from 'nodemailer';
import mailConfig from '../config/mail';
import exphbs from 'express-handlebars';
import nodemailerhbs from 'nodemailer-express-handlebars';
import { resolve } from 'path';

    class Mail{
      constructor(){

        const { host, port, secure, auth } = mailConfig;
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: auth.user ? auth : null,

        });


        this.configureTemplates();
      }


      sendMail(message){
        return this.transporter.sendMail({

          ...mailConfig.default,
          ...message,
        });
      }
      configureTemplates(){
        const viewPath = resolve( __dirname, '..', 'app', 'views', 'emails');
        this.transporter.use('compile', nodemailerhbs({
          viewEngine: exphbs.create({
            layoutsDir: resolve(viewPath, 'layouts'),
            partialsDir: resolve(viewPath, 'partials'),
            defaultLayout: 'default',
            extname: '.hbs'
          }),
          viewPath,
          extname: '.hbs'
        }));


      }

    }

    export default new Mail();
