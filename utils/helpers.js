const generateOtp = (num) => {
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
}