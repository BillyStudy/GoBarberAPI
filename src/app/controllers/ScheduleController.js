import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';

  class ScheduleController{
    async index(req, res){
      /**
       *  Check user provider
       */
      const checkUserProvider = await User.findOne({
        where: { id : req.userId, provider: false}
      })

      if (checkUserProvider) {
          return res.status(401).json({error: "User is not a provider"})
      }

      const { date } = req.query;
      const parseDate = parseISO(date);
      const appointment = await Appointment.findAll({
          where:{
            provider_id: req.userId,
            canceled_at: null,
            date:{
              [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)]
            }
          },
          order: ['date']
      });

      return res.json(appointment);
    }
  }

  export default new ScheduleController();
