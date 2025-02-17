const mongoose = require('mongoose');

const { validateCreateUser } = require("../validations/user.validation") ;
const logger = require("../utils/logger");
const UserModel =  require("../models/user.model") ;
const OTPModel = require("../models/otp.model") ;
const { generateOtp, sendOTPViaMail } = require("../utils/helpers");
const { sendEMail } = require("../services/mail/googleMail");





const registerUser = async (req, res) => {
  // Log the incoming registration request
  logger.info(
    `Incoming registration request for email: ${req.body.email} on controller /registerUser`
  );

  const { error } = validateCreateUser(req.body);

  if (error) {
    logger.warn(`Validation failed: ${error.details[0].message}`);
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
    });
  }

  // initialize a mongoose session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { firstName, email } = req.body;

    const existingUser = await UserModel.findOne({ email });

    const _otp = await generateOtp(5);


    if (existingUser) {
      // if existing user is already email verified
      if (existingUser.isEmailVerified) {
        logger.warn(`User with ${email} already exist`);

        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          status: false,
          message: "User Already Exist",
        });
      }

      // user exist but yet to be Email Verified,
      if (!existingUser.isEmailVerified) {
        // resend otp and update the previous otp value
        // otp , email , otp_type
        logger.warn(`User with ${email} already registered but is yet to be verified`);

        //email, firstName, subject, bannerTitle
        await sendOTPViaMail({
          email,
          otp : _otp,
          firstName,
          subject: "Your OTP for Registration",
          bannerTitle: "Verify Your Email",
          templateFile: "sign-up.hbs"
        });


        await OTPModel.updateOne(
          { email },
          { $set: { otp: _otp } },
          { upsert: true }
        );

        

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
          status: true,
          message: "OTP resent for verification",
        });
      }
    }

    // if user does not exist
    // create new user instance and save
    const newUser = new UserModel(req.body);
    await newUser.save({ session });

    const newOtp = await OTPModel.create(
      [
        {
          otp: _otp,
          firstName: firstName,
          otp_type: "REGISTRATION",
          email,
        },
      ],
      { session }
    );


    // email, firstName, subject, bannerTitle
    await sendOTPViaMail({
      email,
      firstName,
      otp: _otp,
      subject: "Your OTP for Registration",
      bannerTitle:"Verify Your Email",
      templateFile: "sign-up.hbs"
    });

    await session.commitTransaction();
    session.endSession();
    

    // Simulate successful registration
    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({
      status: true,
      message: "Registration successful. Please verify your email.",
    });

  } catch (error) {
    // Rollback transaction in case of any errors
    await session.abortTransaction();
    session.endSession();
    logger.error(
      `Registration failed for email: ${req.body.email}. Error: ${error.message}`
    );
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  };

};



module.exports = {
  registerUser,
};
