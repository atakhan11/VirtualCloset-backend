import express from 'express';
import { createOutfit, getMyOutfits, deleteOutfit, getOutfitById, updateOutfitPlan, unplanOutfit } from '../controllers/outfitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createOutfit)
    .get(protect, getMyOutfits);

router.route('/:id/plan').put(protect, updateOutfitPlan);

 router.route('/:id/unplan').put(protect, unplanOutfit);

router.route('/:id')
    .get(protect, getOutfitById) // <-- YENİ ROUTE
    .delete(protect, deleteOutfit);
    
export default router;
