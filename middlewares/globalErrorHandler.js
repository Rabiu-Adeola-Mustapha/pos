const logger = require("../utils/logger"); // Import the logger
const config = require("../configs/config"); // Ensure you have config for nodeEnv

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log the error details
  logger.error(`Error: ${err.message}`);
  logger.error(`Status Code: ${statusCode}`);
  if (config.nodeEnv === "development") {
    logger.error(`Stack Trace: ${err.stack}`);
  }

  // Respond with error details
  res.status(statusCode).json({
    status: statusCode,
    message: err.message,
    errorStack: config.nodeEnv === "development" ? err.stack : "",
  });

  // Call next middleware if any (though not needed after sending response)
  next();
};

module.exports = globalErrorHandler;
