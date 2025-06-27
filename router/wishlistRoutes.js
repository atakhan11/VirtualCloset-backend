import express from 'express';
import { 
    addWishlistItem, 
    getMyWishlist, 
    deleteWishlistItem,
    moveItemToWardrobe,
    updateWishlistItem
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // Şəkil yükləmək üçün multer

const router = express.Router();

// Bütün arzu siyahısı route-ları qorunmalıdır
router.route('/')
    .get(protect, getMyWishlist)
     .post(protect, addWishlistItem); // upload.single('image') silindi

router.route('/:id')
    .delete(protect, deleteWishlistItem)
    .put(protect, updateWishlistItem) // upload.single('image') silindi

// Bonus funksiya üçün xüsusi route
router.route('/:id/move').post(protect, moveItemToWardrobe);

export default router;
