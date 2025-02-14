require("dotenv").config();
const nodemailer = require("nodemailer");

const logger = require("../../utils/logger");


async function sendEMail(mailOptions) {
  logger.info(`Sending mail...`);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465, // Use 587 if STARTTLS is required
    secure: true,
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates (Use with caution)
    },

    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_PASS, // Your Gmail password or App-specific password
    },
    defaults: {
      from: '"Omnicom POS" tascom.app@gmail.com', // Make sure this domain is correctly configured
    },
  });

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent: ", info.response);
    logger.info(`Email sent: ${info}`);

    return info; // Return the info object in case you need it
  } catch (error) {
    logger.error(`Error sending email: Error: ${error.message}`);
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email");
  }
}

module.exports = {
  sendEMail,
};
