import express from 'express';
import passport from 'passport';

// Controller funksiyalarını import edirik
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    deleteUser,
    updateUser,
    forgotPassword, 
    resetPassword
} from '../controllers/userController.js';

// Middleware-ləri import edirik
import { protect } from '../middleware/authMiddleware.js';
// === DÜZƏLİŞ 1: Düzgün admin middleware-i import edildi ===
import admin from '../middleware/adminMiddleware.js'; 

// Token yaratma funksiyasını import edirik
import generateToken from '../utils/generateToken.js';

const router = express.Router();

// --- Ümumi və Profil Route-ları ---
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// --- Şifrə Sıfırlama Route-ları ---
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

// --- Admin Route-ları ---
// Bütün istifadəçiləri yalnız admin gətirə bilər
router.route('/')
    .get(protect, admin, getAllUsers);

// Spesifik bir istifadəçini yalnız admin silə və ya redaktə edə bilər
router.route('/:id')
    .delete(protect, admin, deleteUser)
    .put(protect, admin, updateUser);

// --- Google ilə Autentifikasiya Route-ları ---
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: 'http://localhost:5173/login', // Frontend-in login səhifəsinə yönləndir
        session: false 
    }),
    (req, res) => {
        const token = generateToken(req.user._id); // Yalnız user ID ilə token yaradırıq
        // Uğurlu girişdən sonra istifadəçini token ilə birlikdə xüsusi bir səhifəyə yönləndiririk
        res.redirect(`http://localhost:5173/auth-success?token=${token}`);
    }
);

export default router;
