const { signJWT, sendOTPViaMail, generateOtp} = require('../utils/helpers');
const {validateLoginUser} = require('../validations/user.validation');
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
    logger.warn(`Validation failed: ${error.details[0].message}`);
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
        `Incorrect Password for email: ${email} -  ${error.details[0].message}`
      );
      return res.status(401).json({
        status: false,
        message: "Invalid credentials, incorrect email or password",
      });
    }

    // check if user email is verified
    if (!userExist.isEmailVerified) {
      logger.warn(
        `Email not verified for email: ${email} -  ${error.details[0].message}`
      );

      // resend otp to user email with otp_type REGISTRATION
      //email, firstName, subject, bannerTitle
      await sendOTPViaMail(
        email,
        _otp,
        firstName,
        "Your OTP for Registration",
        "Verify Your Email"
      );

      logger.warn(
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
       `login failed for email: ${req.params.email}. Error: ${error.message}`
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
      await sendOTPViaMail(
        email,
        _otp,
        recordExist.firstName,
        "Your OTP for Registration",
        "Verify Your Email"
      );

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

    return res.status(200).json({
      status: true,
      message: "Account Verified Successfully!",
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

const forgotPassword = async (req, res) => {};

const resetPassword = async (req, res) => {};

const changePassword = async (req, res) => {};

const logoutUser = async (req, res) => {};

const refreshToken = async (req, res) => {};

const verifyToken = async (req, res) => {};


module.exports = {
  loginUser,
  emailVerify,
};
