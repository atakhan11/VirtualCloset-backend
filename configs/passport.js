// config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserModel from '../models/userModel.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/users/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {

    const email = profile.emails[0].value.toLowerCase().trim();
    const name = profile.displayName;
    const googleId = profile.id;

    try {
        let user = await UserModel.findOne({ googleId: googleId });
        if (user) {
            return done(null, user);
        }

        user = await UserModel.findOne({ email: email });

        if (user) {
            user.googleId = googleId;
            await user.save();
            return done(null, user);
        }
        const newUser = await UserModel.create({
            name,
            email,
            googleId,
        });
        return done(null, newUser);
        
    } catch (error) {
        return done(error, false);
    }
}));


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => done(err, user));
});