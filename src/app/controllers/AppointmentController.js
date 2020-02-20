import Appointment from '../models/Appointment';
import { startOfHour, parseISO, isBefore} from 'date-fns';
import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';



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
      if (!isProvider) {
        return res.status(401).json({
          error:"You can only create appointments with providers"})
      }

      const appointment = await Appointment.create({
        user_id: req.userId,
        provider_id: req.body.provider_id,
        date: hourStart,
      })
      return res.json(appointment);
    }
  }

  export default new AppointmentController();
