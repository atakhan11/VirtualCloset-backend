// routes/adminRoutes.js
import express from 'express';
import { getAllUsers, deleteUser, getDashboardStats, getRecentActivities } from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// DİQQƏT: Bu route-lara əvvəlcə "protect", sonra "isAdmin" middleware-i tətbiq olunur.
// Yəni, sorğu əvvəlcə tokeni yoxlayır, sonra da admin rolunu.
router.get('/stats', protect, isAdmin, getDashboardStats);
router.get('/users', protect, isAdmin, getAllUsers);
router.delete('/users/:id', protect, isAdmin, deleteUser);
router.get('/activities', protect, isAdmin, getRecentActivities);

export default router;