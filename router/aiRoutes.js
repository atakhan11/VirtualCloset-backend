import express from 'express';
import { getStyleAdvice } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Bu route qorunmalıdır, çünki istifadəçinin şəxsi qarderob məlumatı ilə işləyir
router.route('/style-advice').post(protect, getStyleAdvice);

export default router;
