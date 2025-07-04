import express from 'express';
import { getStyleAdvice } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/style-advice').post(protect, getStyleAdvice);

export default router;
