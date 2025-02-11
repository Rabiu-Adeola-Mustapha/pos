const winston = require("winston");

// Define custom log format with colorization
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `\nTimestamp: ${timestamp}\nLevel: ${level}\nMessage: ${message}\n-----------`;
});

winston.addColors({
  info: "green",
  warn: "yellow",
  error: "red",
  debug: "blue",
});


const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize({all:true}), // Add colors to logs
    winston.format.timestamp(), // Include timestamp
    customFormat // Apply custom structure
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({
      // Log to file (without color)
      filename: "logs/app.log",
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.timestamp(),
        customFormat
      ),
    }),
  ],
});

module.exports = logger;
