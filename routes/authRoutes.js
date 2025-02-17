const authRoutes = require("express").Router();

const {
  loginUser,
  emailVerify,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");




authRoutes.post("/login", loginUser);
authRoutes.post("/verify-email/:email", emailVerify);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/change-password", changePassword);



module.exports = authRoutes
