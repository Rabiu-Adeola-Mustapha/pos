const userRoutes = require("express").Router();

const {registerUser, } = require("../controllers/userController");




userRoutes.post("/register", registerUser);




module.exports = userRoutes ;
