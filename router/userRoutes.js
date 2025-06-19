// routes/userRoutes.js

import express from 'express';
import passport from 'passport';

// DÜZƏLİŞ BURADADIR: "generateToken" indi mötərizəsiz import edilir.
import generateToken from '../utils/generateToken.js';

// Controller funksiyalarını import edirik
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUserProfile 
} from '../controllers/userController.js';

// Middleware-i import edirik
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Public Routes ---
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// --- Private Route ---
router.get('/profile', protect, getUserProfile);

// --- Google Authentication Routes ---
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: 'http://localhost:5173/login',
        session: false 
    }),
    (req, res) => {
        // Uğurlu girişdən sonra Passport istifadəçini req.user-ə yerləşdirir.
        // İndi generateToken düzgün işləyəcək.
        const token = generateToken(req.user._id);

        // İstifadəçini token ilə birlikdə frontend-ə yönləndiririk
        res.redirect(`http://localhost:5173/auth-success?token=${token}`);
    }
);

export default router;