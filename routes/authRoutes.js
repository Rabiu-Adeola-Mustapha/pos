const authRoutes = require("express").Router();

const {
  loginUser,
  ///forgetPassword,
  //resetPassword,
} = require("../controllers/authController");




authRoutes.post("/login", loginUser);



module.exports = authRoutes
