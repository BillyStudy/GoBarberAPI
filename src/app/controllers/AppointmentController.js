import Appointment from '../models/Appointment';
import { startOfHour, parseISO, isBefore, format, subHours} from 'date-fns';
import pt from 'date-fns/locale/pt';
import * as Yup from 'yup';

import Notification from '../schemas/Notification';
import User from '../models/User';
import File from '../models/File';

import CancellationMail from '../jobs/CancellationsMail';
import Queue from '../../lib/Queue';



  class AppointmentController{
    async index(req, res){
      const { page = 1 } = req.query;
      const appointment = await Appointment.findAll({
        where:{ user_id: req.userId, canceled_at: null},
        onder: ['date'],
        attributes:['id', 'date'],
        limit: 15,
        offset: (page - 1 ) * 15,
        include: [
          {
            model: User,
            as: 'provider',
            attributes: ['id', 'name'],
            include: [
              {
                model: File,
                as: 'avatar',
                attributes:['id','path','url']
              }
            ]
          }
        ]
      });

      return res.json(appointment);
    }

    async store(req, res){
      const schema = Yup.object().shape({
        provider_id: Yup.number().required(),
        date: Yup.date().required()
      })

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({"error": "Validation fails"})
      }

      const { provider_id, date} = req.body;


      /**
       * check for past dates
       */
      const hourStart = startOfHour(parseISO(date));
      if (isBefore(hourStart, new Date())) {
        return res.status(400).json({
          error:"Past hour is not permitted"})
      }

      /**
       * Check date availability
       */
      const ckeckAvailability = await Appointment.findOne({
        where: { provider_id, canceled_at: null, date: hourStart}
      })
      if (ckeckAvailability) {
        return res.status(401).json({error:"Appointment date is not available"});
      }

      /**
       * check if provider_id is valid
       */
      const isProvider = await User.findOne({where: { id:provider_id , provider: true}})

      if (provider_id === req.userId) {
        return res.status(401).json({
          error:"Providers can not create appointments with yourself"})
      }
      if (!isProvider) {
        return res.status(401).json({
          error:"You can only create appointments with providers"})
      }

      const appointment = await Appointment.create({
        user_id: req.userId,
        provider_id: req.body.provider_id,
        date: hourStart,
      })

      /**
       * Notify appointment provider
       */

      const user = await User.findByPk(req.userId);
      const formattedDate = format(
        hourStart,
        "'dia' dd 'de' MMMM', às' H:mm'h'",
        {locale: pt}
        )
      await Notification.create({
        content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
        user: provider_id,

      })


      return res.json(appointment);
    }

    async delete(req, res){
        const appointment = await Appointment.findByPk(req.params.id,
          {
            include:
            [
              {
                model: User ,
                as: 'provider',
                attributes: ['name', 'email']
              },
              {
                model: User,
                as: 'user',
                attributes: [ 'name' ]
              }
            ],


          }
          );

        if (appointment.user_id != req.userId) {
          return res.status(401).json({
            "error": "You don't have permission to cancel this appointment"
          })
        }

        const dateWithSub = subHours(appointment.date, 2);

        if (isBefore(dateWithSub, new Date())) {
          return res.status(401).json(
            {"error": "You can only cancel appointments 2 hours in advance."})
        }

        appointment.canceled_at = new Date();
        await appointment.save();

        await Queue.add(CancellationMail.key, {
          appointment,
        });

        return res.json(appointment);


    }
  }

  export default new AppointmentController();
