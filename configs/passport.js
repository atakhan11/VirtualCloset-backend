// config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserModel from '../models/userModel.js';



passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/users/auth/google/callback' // Google Console-da yazdığımız Redirect URI
    },
    async (accessToken, refreshToken, profile, done) => {
        // Google-dan uğurlu cavab gəldikdən sonra bu funksiya işə düşür
        try {
            // 1. Google profil ID-si ilə istifadəçinin bizim bazada olub-olmadığını yoxlayırıq
            let user = await UserModel.findOne({ googleId: profile.id });

            if (user) {
                // Əgər istifadəçi varsa, heç bir şey etmədən onu qaytarırıq (login prosesi)
                return done(null, user);
            } else {
                // Əgər istifadəçi yoxdursa, email ilə yoxlayaq, bəlkə əvvəl normal qeydiyyatdan keçib
                user = await UserModel.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Email varsa, sadəcə googleId-ni həmin istifadəçiyə əlavə edib yeniləyə bilərik
                    user.googleId = profile.id;
                    await user.save();
                    return done(null, user);
                } else {
                    // Əgər heç tapılmadısa, yeni istifadəçi yaradırıq (signup prosesi)
                    const newUser = await UserModel.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                    });
                    return done(null, newUser);
                }
            }
        } catch (error) {
            return done(error, false);
        }
    })
);

// Bu funksiyalar Passport-a istifadəçini sessiyaya necə yazıb-oxuyacağını deyir
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => done(err, user));
});