require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const cookie = require("cookie-parser");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
//const authRouter = require("./routes/authRoute");
const swaggerUI = require('swagger-ui-express') ;
const morgan = require('morgan') ;
const YAML = require("yamljs");


const logger = require('./utils/logger')
const swaggerDocummnet = YAML.load('./configs/swagger.yaml') ;



const app = express();

// enables json
app.use(express.json());
//app.use(bodyParser.json());

app.use(cookie());
app.use(mongoSanitize());
app.use(helmet());
//app.use(multer)

app.use(bodyParser.urlencoded({ extended: true }));

// Concise Morgan format: Method, URL, Status, Client IP
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),               // HTTP Method (GET, POST)
    tokens.url(req, res),                  // Requested URL (/)
    tokens.status(req, res),               // Status Code (200, 404)
    '- IP:', req.ip || tokens['remote-addr'](req, res)  // Client IP (::1)
  ].join(' ');
}, {
  stream: {
    write: (message) => logger.info(message.trim())  // Send to Winston
  }
}));

app.use('/api-docs',  swaggerUI.serve, swaggerUI.setup(swaggerDocummnet))

//allow request from different domain
app.use(
  cors({
    origin: [
     
      "*",
    
    ],
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);



app.get("/", (req, res) => {

  //logger.info("Root endpoint accessed")
  res.json({
    message: "Welcome from POS health route",
  });
});


const apiPrefix = "api/pos/v1"

//   Auth Routes
app.use(`/${apiPrefix}/auth`, require('./routes/authRoutes'));

// User Routes
app.use(`/${apiPrefix}/user`, require('./routes/userRoutes'));

// Catch undefined routes
app.all('*', (req, res, next) => {

  const errMsg = `Can't find ${req.originalUrl} on this server!`;

  // Log the 404 error
  logger.warn(`404 Error - ${errMsg} - Method: ${req.method} - IP: ${req.ip}`);

  const err = new Error(errMsg);
  err.statusCode = 404;
  next(err); // Forward to the global error handler

});

//app.use(Global Error Handler);
app.use(globalErrorHandler) ;
 

module.exports = app;
