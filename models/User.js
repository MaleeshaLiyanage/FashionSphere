const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpire: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    saleNotification: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Password Hash middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//  Match User entered password to Hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Verification Code
userSchema.methods.getVerificationCode = function () {
  // Generate a verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Set the verification code and its expiration time
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 10 * (60 * 1000); // 10 minutes

  return verificationCode;
};

// Generate Reset Password Token
userSchema.methods.getResetPasswordToken = function () {
  // Generate a token
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the token and set it to resetPasswordToken field
  this.resetPasswordToken = resetToken;

  // Set the expire time for the token
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000); // 10 minutes

  return resetToken;
};

// Verify Reset Password Token
userSchema.methods.verifyResetPasswordToken = function (token) {
  return (
    this.resetPasswordToken === token && this.resetPasswordExpire > Date.now()
  );
};

// Verify Verification Code
userSchema.methods.verifyVerificationCode = function (code) {
  // Check if the code matches and if it hasn't expired
  return (
    this.verificationCode === code && this.verificationCodeExpire > Date.now()
  );
};

module.exports = mongoose.model("User", userSchema);
