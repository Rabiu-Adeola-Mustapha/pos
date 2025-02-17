const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');




const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      //required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /\S+@\S+\.\S+/.test(v);
        },
        message: "Email must is not valid",
      },
    },
    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      // required: true,
      validate: {
        validator: function (v) {
          return /\d{11}/.test(v);
        },
        message: "Phone Number is not vallid !",
      },
    },
    role: {
      type: String,
      // required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetToken:{
      type : String
    },
    resetTokenExpires:{
      type: Date
    }
  },
  { timestamps: true }
); 



// Encrypting password
userSchema.pre("save", async function (next) {

  if(!this.isModified('password')) {
    next() ;
  };

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

// compare user password in DB
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};




module.exports = model("User", userSchema);
