import express from 'express';
// Silindi: path və multer importları artıq lazım deyil
// import path from 'path';
// import multer from 'multer'; 
import { addCloth, getMyClothes, deleteCloth, getAllClothes_Admin, updateCloth } from '../controllers/clothesController.js';
import { protect } from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();
router.route('/all').get(protect, admin, getAllClothes_Admin);

router.route('/')
    .get(protect, getMyClothes)
    .post(protect, addCloth); 
router.route('/:id')
    .put(protect, updateCloth) 
    .delete(protect, deleteCloth);
    
export default router;
