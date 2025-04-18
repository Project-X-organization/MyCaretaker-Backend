const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const bcrypt = require("../utils/bcrypt");
const { prisma } = require("./prismaUtill");
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  CALLBACK_ENDPOINT,
  CALLBACK_ENDPOINT_PROD,
} = process.env;


passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        console.log("Login attempt:", { email, role: req.user.role });

        // Validate if role is provided
        if (!req.user.role) {
          console.log("Role not provided.");
          return done(null, false, { messages: "Role is required" });
        }

        let user;
        // instead of this i should probably a diff method
        switch (req.user.role) {
          case "admin":
            user = await prisma.admin.findUnique({ where: { email } });
            break;
          case "user":
            user = await prisma.user.findUnique({ where: { email } });
            break;
          case "agent":
            user = await prisma.agent.findUnique({ where: { email } });
            break;
          default:
            console.log("Invalid role:", req.user.role);
            return done(null, false, { messages: "Invalid role" });
        }

        // Check if user exists
        if (!user) {
          console.log("User not found:", email);
          return done(null, false, { messages: "User not found or Incorrect Email" });
        }

        // Check if email is verified
        if (!user.isVerified) {
          console.log("Email not verified:", email);
          return done(null, false, { messages: "Email not verified!" });
        }

        // Check password
        const isMatch = await bcrypt.verifyData(password, user.password);
        if (!isMatch) {
          console.log("Incorrect password:", email);
          return done(null, false, { messages: "Incorrect Password" });
        }

        // Add role to user object
        user.role = req.user.role;

        console.log("Login successful:", user);
        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    }
  )
);


// jwt options
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      let user;

      // Try finding the user in different roles
      user = await prisma.user.findUnique({ where: { id: jwt_payload.id } });
      if (!user) {
        user = await prisma.admin.findUnique({ where: { id: jwt_payload.id } });
      }
      if (!user) {
        user = await prisma.agent.findUnique({ where: { id: jwt_payload.id } });
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: "User not found" });
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_ENDPOINT,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log(profile);

        const verifyUser = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
        });
        if (!verifyUser) {
          const user = await prisma.user.create({
            data: {
              username: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              password: "set-default-password-for-new-users",
              phoneNumber: "set-default-phonenumber",
            },
          });

          delete user.password;
          return done(null, { user });
        } else {
          const user = await prisma.user.update({
            where: { email: profile.emails[0].value },
            data: { googleId: profile.id },
          });

          delete user.password;
          done(null, { user });
        }
      } catch (error) {
        console.error(error);
        done(error, null);
      }
    }
  )
);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  const err = new Error("Error is here");
  done(err, null);
});

module.exports = passport;
