import User from '../models/User'
import * as Yup from 'yup';

class UserController{
  async store(req, res){
    //Validação dos dados com Yup
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password_hash: Yup.string().required().min(6)
    });


    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({"error": "Validation fails"})
    }



    const userExists = await User.findOne({ where: { email: req.body.email }})
    if (userExists) {
      return res.status(400).json({"error": "Email already exist"})
    }
    const {id , name , email, provider } = await User.create(req.body)

    return res.json({id , name , email, provider});
  }

  async update (req, res){

    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);



    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email }});
      if (userExists) {
        return res.status(400).json({"error": "Email already exist"})
      }
    }

    //Validação dos dados com Yup
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password_hash: Yup.string().min(6).when('oldPassword', (oldPassword, field) =>
        oldPassword ? field.required() : field
      ),
      confirmPassword: Yup.string().when('password_hash', (password_hash, field) =>
      password_hash ? field.required().oneOf([Yup.ref('password_hash')]) : field
      )
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({"error": "Validation fails"})
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(400).json({"error": "Password does not match"})
    }

    const {id, name, provider} = await user.update(req.body);
    return res.json({id, name, email, provider});
  }
}

export default new UserController();
