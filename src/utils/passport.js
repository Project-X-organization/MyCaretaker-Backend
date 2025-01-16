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

// Passport local strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: {email} });
        if (!user) {
          return done(null, false, { message: "incorrect Email" });
        }
        if (!user.isVerified) {
          return done(null, false, { message: "Email not verified!" });
        }
        const isMatch = await bcrypt.verifyData(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect Password" });
        }
        return done(null, user);
      } catch (error) {
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
      const user = await prisma.user.findUnique({
        where: { id: jwt_payload.id },
      });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
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
          const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Adjust expiration as needed
          );
          delete user.password;
          return done(null, { user, token });
        } else {
          const user = await prisma.user.update({
            where: { email: profile.emails[0].value },
            data: { googleId: profile.id },
          });
          // Generate a JWT token
          const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Adjust expiration as needed
          );
          delete user.password;
          done(null, { user, token });
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
