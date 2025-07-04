
import express from 'express';
import { getAllUsers, deleteUser, getDashboardStats, getRecentActivities, createAnnouncement, getAllAnnouncements, deleteAnnouncement } from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, isAdmin, getDashboardStats);
router.get('/users', protect, isAdmin, getAllUsers);
router.delete('/users/:id', protect, isAdmin, deleteUser);
router.get('/activities', protect, isAdmin, getRecentActivities);
router.post('/announcements', protect,isAdmin, createAnnouncement);
router.get('/announcements', protect,isAdmin, getAllAnnouncements);
router.delete('/announcements/:id', protect,isAdmin, deleteAnnouncement);

export default router;