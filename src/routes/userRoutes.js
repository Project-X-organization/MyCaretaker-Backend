const express = require("express");
const passport = require("passport");
require("../utils/passport");
const {
  registerUser,
  verifyEmail,
  resendOtp,
  loginUser,
  socialLogin,
} = require("../controllers/userController");

const {
  userValidationRules,
  loginValidationRule,
} = require("../validators/userValidator");
const validateRequest = require("../middlewares/validateRequest");
const validateRegistation = [...userValidationRules, validateRequest];
const validateLogin = [...loginValidationRule, validateRequest];
const router = express.Router();

router.post("/register", validateRegistation, registerUser);

router.post("/verify-email", verifyEmail);

router.post("/resend-otp", resendOtp);

router.post(
  "/login",
  validateLogin,
  passport.authenticate("local", { session: false }),
  loginUser
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  socialLogin
);

module.exports = router;
