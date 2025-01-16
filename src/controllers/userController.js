const { prisma } = require("../utils/prismaUtill");
const { encryptData } = require("../utils/bcrypt");
const { generateOTP } = require("../utils/generateOtp");
const { sendEmail } = require("../utils/nodemail");
const jwt = require("jsonwebtoken");
exports.registerUser = async (req, res) => {
  const { username, email, password, phoneNumber } = req.body;
  try {
    const isRegisterAlready = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isRegisterAlready) {
      return res.status(409).json({ message: "Email already registered." });
    }
    const hashedPassword = await encryptData(password);
    const verificationOtp = generateOTP();
    const verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phoneNumber,
        verificationOtp,
        verificationOtpExpires,
      },
    });
    await sendEmail(
      email,
      "Verify your email",
      `Your verification code is: ${verificationOtp}`
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.verificationOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }
    if (user.verificationOtpExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationOtp: null,
        verificationOtpExpires: null,
      },
    });
    // token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Email verified successfully.", token });
  } catch (error) {
    res.status(500).json({ message: "Error verifying email." });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    await prisma.user.update({
      where: { email },
      data: {
        verificationOtp: otp,
        verificationOtpExpires: otpExpires,
      },
    });
    await sendEmail(
      email,
      "New Verification OTP",
      `Your new OTP is: ${otp}. It will expire in 15 minutes.`
    );
    res.json({
      message: "New OTP sent. Please verify your email within 15 minutes.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error resending OTP." });
  }
};

exports.loginUser = async (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({ token });
};

// For social login
exports.socialLogin = async (req, res) => {
  const { user, token } = req.user;

  if (!user && token) {
    res.redirect("/login");
  }
  res.json({
    message: "Authentication successful!",
    token, // Client can store this for future requests
    user,
  });
};
