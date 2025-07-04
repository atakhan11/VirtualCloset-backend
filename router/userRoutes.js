import express from 'express';
import passport from 'passport';

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
    resetPassword,
    getChatUsers,
    deleteUserProfile
} from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js'; 
import generateToken from '../utils/generateToken.js';

const router = express.Router();
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile)
    .delete(protect, deleteUserProfile);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);


router.route('/')
    .get(protect, admin, getAllUsers);


router.route('/:id')
    .delete(protect, admin, deleteUser)
    .put(protect, admin, updateUser);


router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: 'http://localhost:5173/login', 
        session: false 
    }),
    (req, res) => {
        const token = generateToken(req.user._id); 
        res.redirect(`http://localhost:5173/auth-success?token=${token}`);
    }
);
router.route('/chatlist').get(protect, getChatUsers);

export default router;
