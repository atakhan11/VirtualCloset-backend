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
    // Google-dan gələn məlumatlar "profile" obyektinin içindədir
    const email = profile.emails[0].value.toLowerCase().trim();
    const name = profile.displayName;
    const googleId = profile.id;

    try {
        // 1. Google ID ilə istifadəçini axtarırıq
        let user = await UserModel.findOne({ googleId: googleId });

        if (user) {
            // Əgər tapıldısa, həmin istifadəçini qaytarırıq (Login)
            return done(null, user);
        }

        // 2. Əgər Google ID ilə tapılmadısa, email ilə axtarırıq
        user = await UserModel.findOne({ email: email });

        if (user) {
            // Əgər email ilə tapıldısa, deməli bu istifadəçi əvvəl normal qeydiyyatdan keçib.
            // Onun hesabına googleId-ni əlavə edib, hesabları birləşdiririk.
            user.googleId = googleId;
            await user.save();
            return done(null, user);
        }

        // 3. Əgər nə Google ID, nə də email ilə tapılmadısa, yeni istifadəçi yaradırıq (Signup)
        const newUser = await UserModel.create({
            name,
            email,
            googleId,
            // Şifrəyə ehtiyac yoxdur, çünki Mongoose modelimizdə şərtli olaraq təyin etmişik
        });
        return done(null, newUser);
        
    } catch (error) {
        return done(error, false);
    }
}));

// Bu hissələr eyni qalır
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => done(err, user));
});