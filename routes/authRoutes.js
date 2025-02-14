const authRoutes = require("express").Router();

const {
  loginUser,
  emailVerify
  ///forgetPassword,
  //resetPassword,
} = require("../controllers/authController");




authRoutes.post("/login", loginUser);
authRoutes.post("/verify-email/:email", emailVerify);



module.exports = authRoutes
