const Joi = require("joi");
const { validate } = require("../models/user.model");

const validateCreateUser = (data) => {
  const createAccountSchema = Joi.object({
    firstName: Joi.string(),
    //last_name: Joi.string(),
   // username: Joi.string().required(),
    //phone: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    repeat_password: Joi.ref("password"),
  });

  return createAccountSchema.validate(data);
};

const validateUpdateUser = (data) => {
  const updateUserSchema = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    gender: Joi.string(),
    phone: Joi.string(),
  });
  return updateUserSchema.validate(data);
};

const validateLoginUser = (data) => {
  const loginUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return loginUserSchema.validate(data);
};

const validateChangePassword = (data) => {
  const resetPasswordSchema = Joi.object({
    old_password: Joi.string().required(),
    new_password: Joi.string().required(),
    confirm_new_password: Joi.ref("new_password"),
  });

  return resetPasswordSchema.validate(data) ;
};

const validateForgotPassword = (data) => {
  const forgotPasswordSchema = Joi.object({
    email : Joi.string().email().required()
  })

  return forgotPasswordSchema.validate(data) ;
}

const validateResetPassword = (data) => {
  const resetPasswordSchema = Joi.object({
   // token: Joi.string().required(),
    password: Joi.string().required(),
    confirm_password: Joi.ref("password"),

  });

  return resetPasswordSchema(data);

}

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateLoginUser,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
};
