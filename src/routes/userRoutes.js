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
const api_key = require("../middlewares/checkApiKey");


router.use(api_key.check_api_key)

router.post("/register", validateRegistation,api_key.check_api_key, registerUser);
router.patch("/", updateUser);
router.post("/verify-email", verifyEmail);

router.post("/resend-otp", resendOtp);

router.post(
  "/login",
  validateLogin,
  api_key.check_api_key,
  (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        
        return res.status(401).json({ message: info?.messages || "Unauthorized" });
      }
      req.user = user; 
      next();
    })(req, res, next);
  },
  loginUser
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  api_key.check_api_key,
  passport.authenticate("google", { session: false }),
  socialLogin
);

router.get(
  "/profile",
  api_key.USER_KEY,
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
  api_key.ADMIN_KEY,
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
