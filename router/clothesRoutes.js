import express from 'express';
// Silindi: path və multer importları artıq lazım deyil
// import path from 'path';
// import multer from 'multer'; 
import { addCloth, getMyClothes, deleteCloth, getAllClothes_Admin, updateCloth } from '../controllers/clothesController.js';
import { protect } from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();

// --- Multer ilə bağlı bütün konfiqurasiya buradan tamamilə silindi ---

// --- Route Təyinləri ---

router.route('/all').get(protect, admin, getAllClothes_Admin);

// /api/clothes/
router.route('/')
    .get(protect, getMyClothes)
    // Dəyişiklik: upload.single('image') middleware-i buradan silindi
    .post(protect, addCloth); 

// /api/clothes/:id
router.route('/:id')
    // Dəyişiklik: upload.single('image') middleware-i buradan silindi
    .put(protect, updateCloth) 
    .delete(protect, deleteCloth);
    
export default router;
