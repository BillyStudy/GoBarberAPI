import Notification from '../schemas/Notification';

import User from '../models/User';

  class NotificationController{
    async index(req, res){

      /**
       *  Check user provider
       */
      const checkUserProvider = await User.findOne({
        where: { id : req.userId, provider: false}
      })

      if (checkUserProvider) {
          return res.status(401).json({error: "Only provider can load notifcations"})
      }


      const notifications = await Notification.find({
        user: req.userId,
      }).sort({createdAt: 'desc'}).limit(20);

      return res.json(notifications);
    }

    async update(req, res){
      const notify = await Notification.findByIdAndUpdate(
          req.params.id,
          { read: true },
          { new: true}
        );

        return res.json(notify);


    }
  }

  export default new NotificationController();
