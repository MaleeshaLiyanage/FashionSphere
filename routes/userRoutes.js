const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const { verifyEmailTemplate } = require("../emails/verification");
const { forgotPasswordTemplate } = require("../emails/forgot-password");
const { sendEmail } = require("../emails/client");
const router = express.Router();

// @route POST /api/users/register
// @desc Register a new user
// @access Public
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Registration logic
    let user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ name, email, password });
    await user.save();

    // Generate a verification code
    const verificationCode = user.getVerificationCode();
    await user.save();
    const emailTemplate = verifyEmailTemplate(verificationCode, name);

    // send email to user
    const isSuccess = sendEmail(
      email,
      "Verify Your Email",
      emailTemplate,
      undefined
    );

    if (!isSuccess) {
      return res.status(500).json({
        error: "Failed to send verification email.",
      });
    }

    // Success response
    res.status(201).json({
      message: "User registered successfully",
      isVerified: false,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

// @route POST /api/users/login
// @desc Authenticate user
// @access Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid Credentials" });
    if (!user.isVerified) {
      // Resend verification code if the user is not verified
      const verificationCode = user.getVerificationCode();
      await user.save();
      const emailTemplate = verifyEmailTemplate(verificationCode, user.name);

      // send email to user
      const isSuccess = sendEmail(
        email,
        "Verify Your Email",
        emailTemplate,
        undefined
      );

      if (!isSuccess) {
        return res.status(500).json({
          error: "Failed to send verification email.",
        });
      }

      return res.status(401).json({
        message:
          "Not authorized, account is not verified. Please check your email for the verification link.",
        isVerified: false,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // Sign and return the token along with user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "40h" },
      (err, token) => {
        if (err) throw err;

        // Send the user and token in response
        res.json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            saleNotification: user.saleNotification,
          },
          isVerified: user.isVerified,
          token,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/users/profile
// @desc Get logged-in user's profile (Protected Route)
// @access Private
router.get("/profile", protect, async (req, res) => {
  res.json(req.user);
});

// @route POST /api/users/verify
// @desc Verify user account
// @access Public
router.post("/verify", async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    // Find the user by email
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    // verify the verification code
    const isMatch = user.verifyVerificationCode(verificationCode);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid verification code" });

    // Update user to verified
    user.isVerified = true;
    user.verificationCode = null; // Clear the verification code
    user.verificationCodeExpire = null; // Clear the expiration time
    await user.save();

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // Sign and return the token along with user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "40h" },
      (err, token) => {
        if (err) throw err;

        // Send the user and token in response
        res.json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          isVerified: user.isVerified,
          token,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/users/forget-password
// @desc Send reset password email
// @access Public
router.post("/forget-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.isVerified)
      return res
        .status(401)
        .json({ message: "Not authorized, account is not verified" });
    // Generate a reset password token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // get verification email template
    const emailTemplate = forgotPasswordTemplate(resetToken, user.name);

    // send email to user
    const isSuccess = sendEmail(
      email,
      "Password reset",
      emailTemplate,
      undefined
    );

    if (!isSuccess) {
      return res.status(500).json({
        error: "Failed to send verification email.",
      });
    }

    // Send success response
    res.status(200).json({
      message: "Reset password email sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route POST /api/users/reset-password
// @desc Reset user password
// @access Public
router.post("/reset-password", async (req, res) => {
  const { email, resetToken, newPassword, repeatPassword } = req.body;

  try {
    // Check if the new password and verify password match
    if (newPassword !== repeatPassword)
      return res.status(400).json({ message: "Passwords do not match" });
    // Find the user by email
    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.isVerified)
      return res
        .status(401)
        .json({ message: "Not authorized, account is not verified" });

    // Verify the reset token
    const isMatch = user.verifyResetPasswordToken(resetToken);
    if (!isMatch) return res.status(400).json({ message: "Invalid reset OTP" });

    // Update the password
    user.password = newPassword;
    user.resetPasswordToken = null; // Clear the reset token
    user.resetPasswordExpire = null; // Clear the expiration time

    await user.save();
    // Send success response
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route POST /api/users/update-sale-notification
// @desc Update sale notification preference
// @access Private
router.post("/sale-notification", protect, async (req, res) => {
  const { saleNotification } = req.body;

  try {
    // Find the user by ID
    let user = await User.findById(req.user._id);
    if (!user) return res.status(400).json({ message: "User not found" });
    // Update the sale notification preference
    user.saleNotification = saleNotification;
    await user.save();
    // Send success response
    res.status(200).json({
      message: "Sale notification preference updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        saleNotification: user.saleNotification,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
