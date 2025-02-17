require("dotenv").config();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

const { sendEMail } =  require("../services/mail/googleMail") ;



const generateOtp = async (num) => {
  if (num < 2) {
    return Math.floor(1000 + Math.random() * 9000);
  }
  const c = Math.pow(10, num - 1);

  return Math.floor(c + Math.random() * 9 * c);
};

const phoneValidation = (userPhone) => {
  if (!userPhone) return false;
  const phone = userPhone.trim();
  const firstChar = phone.charAt(0);
  if (firstChar === "+" && phone.length === 14) {
    return phone;
  } else if (firstChar === "0" && phone.length === 11) {
    return `+234${phone.slice(1)}`;
  } else if (firstChar === "2" && phone.length === 13) {
    return `+${phone}`;
  } else {
    return false;
  }
};

const signJWT = async (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

// send otp with otp_type to email
const sendOTPViaMail = async ({ email, otp, firstName = "", subject, bannerTitle, templateFile,}) => {

  try {

    // Construct the dynamic template file path
    const templatePath = path.join(
      __dirname,
      "..",
      "mail_templates",
      templateFile
    );

    // Read and compile the template
    const templateSource = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateSource);

    // Prepare email content with optional firstName
    const replacements = {
      bannerTitle,
      firstName, // If not provided, it defaults to an empty string
      otp,
    };

    const htmlToSend = template(replacements);

    // Prepare email options
    const mailOptions = {
      to: email,
      subject,
      html: htmlToSend,
    };

    // Send email
    await sendEMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

//  async resendVerificationEmail(email: string) {
//     const existingUser = await userModel.findOne({
//       email,
//       isEmailVerified: false,
//       verificationCode: { $exists: true },
//     });

//     if (!existingUser) {
//       throw new HttpException(
//         'No user with this email exists',
//         HttpStatus.NOT_FOUND,
//       );
//     }

//     const code = existingUser.generateCode();

//     // send email
//     try {

//        await this.awsEmailService.sendSignupEmail(
//          existingUser.email,
//          existingUser.firstName,
//          code, // The generated token
//        );

//       console.log('Resent Verification Email');
//     } catch (error) {
//       console.error('Error re-sending Verification email: ', error);
//     }

//     return existingUser.save();
//   }

module.exports = {
  phoneValidation,
  generateOtp,
  signJWT,
  sendOTPViaMail,
};
