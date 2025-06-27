import express from 'express';
import { fetchProductData } from '../controllers/scrapeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/fetch-url', protect, fetchProductData);

export default router;
