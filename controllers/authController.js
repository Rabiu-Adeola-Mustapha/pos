require("dotenv").config();
const {nanoid} = require('nanoid');
const bcrypt = require("bcrypt")

const { signJWT, sendOTPViaMail, generateOtp} = require('../utils/helpers');
const {validateLoginUser, validateForgotPassword} = require('../validations/user.validation');
const logger = require("../utils/logger");
const UserModel =  require("../models/user.model") ;
const OTPModel = require("../models/otp.model") ;



const loginUser = async (req, res) => {
  // Log the incoming registration request
  logger.info(
    `Incoming login request for email: ${req.body.email} on controller /login`
  );

  const { error } = validateLoginUser(req.body);

  if (error) {
    logger.warn(`Validation failed for email: ${req.body.email} on controller /login. Error: ${error.details[0].message}`);
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
    });
  }

  const { email, password } = req.body;

  try {
    // check if email/user exist
    const userExist = await UserModel.findOne({ email }).select("+password");

    if (!userExist) {
      logger.error(`Email not found ${error.details[0].message}`);
      return res.status(401).json({
        status: false,
        message: "Invalid credentials, invalid email or password",
      });
    }

    // check if password matches
    const isCorrectPassword = await userExist.comparePassword(password);

    if (!isCorrectPassword) {
      logger.error(
        `Incorrect Password for email: ${email} }`
      );
      return res.status(401).json({
        status: false,
        message: "Invalid credentials, incorrect email or password",
      });
    }

    // check if user email is verified
    if (!userExist.isEmailVerified) {
      logger.warn(`Email not verified for email: ${email}. Resending OTP...`);

      // Generate OTP for email verification
      const _otp = await generateOtp(5);

      // resend otp to user email with otp_type REGISTRATION
      //email, firstName, subject, bannerTitle
      await sendOTPViaMail({
        email,
        otp: _otp,
        firstName: userExist.firstName,
        subject: "Your OTP for Registration",
        bannerTitle: "Verify Your Email",
        templateFile: "sign-up.hbs",
      });

      logger.info(
        `OTP resent to email : ${email} while trying to login before verifying the email address`
      );

      return res.status(403).json({
        status: false,
        message:
          "Please kindly verify your email using the otp sent to your email before logging in.",
      });
    }

    // Sign Payload
    const payload = {
      firstName: userExist.firstName,
      email: email,
      id: userExist._id,
    };

    const token = await signJWT(payload);

    // Set token in response headers
    res.setHeader("Authorization", `Bearer ${token}`);

    logger.info(`Token generated for email: ${email} set on header`);
    // Send response
    return res.status(200).json({
      status: true,
      message: "Login successful",
      token, // Optional, but good for debugging
    });
  } catch (error) {
    
     //await session.abortTransaction();
     //session.endSession();
     logger.error(
       `login failed for email: ${req.body.email}. Error: ${error.message}`
     );
     res.status(500).json({
       status: false,
       message: "Internal Server Error",
     });
  } ;

  

};


  // Email Verification using otp
const emailVerify = async (req, res) => {
  // Log the incoming email verification request
  logger.info(
    `Incoming email verification request for email: ${req.params.email} on controller /emailVerify`
  );

  const { email } = req.params;
  const { otp } = req.body;


  try {
    // check if email exists on OTP table
    const recordExist = await OTPModel.findOne({
      email,
      otp,
      otp_type: "REGISTRATION",
    });

    if (!recordExist) {
      logger.error(`OTP record does not match for email : ${email}`);
      return res.status(401).json({
        status: false,
        message:
          "The provided OTP does not match. Please try again or request a new one.",
      });
    }

    // generate otp
    const _otp = await generateOtp(5);

    // check if the createdAt or updatedAt is less than 10mints
    // const createdAt = new Date(recordExist.createdAt);
    const updatedAt = new Date(recordExist.updatedAt);
    const now = new Date();

    // Calculate time difference in minutes
    //const diffCreatedAt = (now - createdAt) / (1000 * 60);
    const diffUpdatedAt = (now - updatedAt) / (1000 * 60);

    if (diffUpdatedAt > 5) {
      // send a new one via email
      await sendOTPViaMail({
        email,
        otp: _otp,
        firstName: recordExist.firstName,
        subject: "Your OTP for Registration",
        bannerTitle: "Verify Your Email",
        templateFile: "sign-up.hbs"
      });

      logger.error(
        `OTP expired for email : ${email} and new OTP sent via email`
      );

      await OTPModel.updateOne(
        { email },
        { $set: { otp: _otp } },
        { upsert: true }
      );

      return res.status(401).json({
        status: false,
        message: "Your OTP has expired and a new one has been resent.",
      });
    }

    // update the record on User Model table
    await UserModel.updateOne({ email }, { $set: { isEmailVerified: true } });

    // destroy the record from OTP table
    await OTPModel.deleteOne({ email });

    logger.info(`Document with Email: ${email} , updated successfully`);

    // Sign Payload
    const payload = {
      firstName: recordExist.firstName,
      email: email,
      id: userExist._id,
    };

    const token = await signJWT(payload);

    // Set token in response headers
    res.setHeader("Authorization", `Bearer ${token}`);

    logger.info(`Token generated for email: ${email} set on header`);

    return res.status(200).json({
      status: true,
      message: "Account Verified Successfully and token set on header!",
    });

    
  } catch (error) {

      logger.error(
        `Email Verification failed for email: ${req.params.email}. Error: ${error.message}`
      );
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
  }

 
};


const forgotPassword = async (req, res) => {
  // Log the incoming forgot password request
  logger.info(
    `Incoming forgot password request for email: ${req.body.email} on controller /forgotPassword`
  );

  // validate with joi
  const { error } = validateForgotPassword(req.body);

  if (error) {
    logger.warn(
      `Validation failed for email: ${req.body.email} on controller /forgotPassword. Error: ${error.details[0].message}`
    );

    return res.status(400).json({
      status: false,
      message: error.details[0].message,
    });
  }

  const { email } = req.body;

  // Use nanoid to generate a secure reset token
  const resetToken = nanoid(64); // 64-character token
  //const hashedToken = await bcrypt.hash(resetToken, 10);
 

  try {
    const user = await UserModel.findOne({ email });

    // If no use
    if (!user) {
      logger.error(
        `User with emai ${email} does not exit on controller /forgotPassword`
      );
      return res.status(401).json({
        status: false,
        message: "Check your mail for OTP if you have registered",
      });
    }
    // send otp to the mail for verification
    //const _otp = await generateOtp(5);

    const magicLink = `${process.env.FRONTEND_LOCAL_URL}/auth/reset-password?token=${resetToken}`;
    //const hashedMagicLink = await bcrypt.hash(magicLink, 10);

    // send mail
    //email, firstName, subject, bannerTitle
    await sendOTPViaMail({
      email,
      otp: magicLink,
      firstName : user.firstName,
      subject: "Your OTP for Forgot Password", //
      bannerTitle: "Password Reset Request",
      templateFile: "forgotPass.hbs",
    });

    logger.info(`Magic Link sent to email : ${email} for forgot Password`);

    // save otp to otp table
    await UserModel.updateOne(
      { email },
      { $set: { resetToken: resetToken } },
      { upsert: true }
    );

    return res.status(403).json({
      status: false,
      message:
        "Please kindly verify your email using the otp sent to your email.",
    });
  } catch (error) {
    logger.error(
      `Forgot Password sending Magic Link failed for email: ${req.params.email}. Error: ${error.message}`
    );
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};


const resetPassword = async (req, res) => {
  // Log the incoming reset password request
  logger.info(
    `Incoming reset password request with link: ${req.url} on controller /resetPassword`
  );

  // validate the query string
  const { token } = req.query;
  const { newPassword } = req.body;

  logger.info(`token : ${token}`);

  // find the token in oTP Model

  token = token.trim();

  try {

      const recordExist = await UserModel.findOne({
        resetToken: token,
      });

      // check if record exist
      if (!recordExist) {
        logger.error(`Record does not exist for token : ${token}`);
        return res.status(401).json({
          status: false,
          message: "Invalid Request",
        });
      }

      // check if the createdAt or updatedAt is less than 10mints
      // const createdAt = new Date(recordExist.createdAt);
      const updatedAt = new Date(recordExist.updatedAt);
      const now = new Date();

      // Calculate time difference in minutes
      //const diffCreatedAt = (now - createdAt) / (1000 * 60);
      const diffUpdatedAt = (now - updatedAt) / (1000 * 60);

     if (diffUpdatedAt > 7) {
        // send a new one via email

        const resetToken = nanoid(64); // 64-character token
        const magicLink = `${process.env.FRONTEND_LOCAL_URL}/auth/reset-password?token=${resetToken}`;

        await sendOTPViaMail({
          email,
          otp: magicLink,
          firstName: recordExist.firstName,
          subject: "Your OTP for Forgot Password", //
          bannerTitle: "Password Reset Request",
          templateFile: "forgotPass.hbs",
        });

        logger.error(
          `Magic link expired for email : ${recordExist.email} and new link sent via email`
        );

        // save otp to otp table
        await UserModel.updateOne(
          { email },
          { $set: { resetToken: resetToken } },
          { upsert: true }
        );

        return res.status(403).json({
          status: false,
          message:
            "Please kindly reset your password using the link sent to your email.",
        });
      }

      updatePassword = await bcrypt.hash(newPassword, 10) ;
      recordExist.password = updatePassword ;
      recordExist.resetToken = null ;

      await recordExist.save() ;

       logger.info(`Reset Password successfull for email: ${recordExist.email}`);

      return res.status(200).json({
        status: true,
        message: "Password changed successfully",
      });





  } catch (error) {

    logger.error(
      `Forgot Password sending Magic Link failed for email: ${recordExist.email}. Error: ${error.message}`
    );
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
  

};

const changePassword = async (req, res) => {};

const logoutUser = async (req, res) => {};

const refreshToken = async (req, res) => {};

const verifyToken = async (req, res) => {};


module.exports = {
  loginUser,
  emailVerify,
  resetPassword,
  forgotPassword,
  changePassword,
};
