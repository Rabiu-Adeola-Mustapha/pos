const {model, Schema } = require('mongoose') ;

const otpSchema = new Schema ({


  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  otp_type: {
    type: String,
    required: true,
    default: "REGISTRATION",
  },


}, {timestamps: true} );




module.exports = model("OTP", otpSchema)