const express = require("express");
const passport = require("passport");
require("../utils/passport");
const {
  registerUser,
  verifyEmail,
  resendOtp,
  loginUser,
  socialLogin,
  userProfile,
  getAllUsers,
  submitApplication,
  singlePropertyApplication,
  getAllApplications,
  updateApplicationStatus,
  updateUser,
} = require("../controllers/userController");

const {
  userValidationRules,
  loginValidationRule,
} = require("../validators/userValidator");
const validateRequest = require("../middlewares/validateRequest");
const { getPropertyApplications } = require("../helpers/user.helper");
const validateRegistation = [...userValidationRules, validateRequest];
const validateLogin = [...loginValidationRule, validateRequest];
const router = express.Router();

router.post("/register", validateRegistation, registerUser);
router.patch("/", updateUser);
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

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  userProfile
);

router.get("/", passport.authenticate("jwt", { session: false }), getAllUsers);
router.post(
  "/apply-property",
  passport.authenticate("jwt", { session: false }),
  submitApplication
);
router.get(
  "/all-applications",
  passport.authenticate("jwt", { session: false }),
  getAllApplications
);
router.get(
  "/property/applications/:id",
  passport.authenticate("jwt", { session: false }),
  singlePropertyApplication
);
router.patch(
  "/application/status",
  passport.authenticate("jwt", { session: false }),
  updateApplicationStatus
);
module.exports = router;
