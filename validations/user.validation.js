const Joi = require("joi");

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

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateLoginUser,
};
