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
    .post(protect, upload.single('image'), addWishlistItem); // Yeni məhsul əlavə edərkən şəkil yükləmə imkanı

router.route('/:id')
    .delete(protect, deleteWishlistItem)
    .put(protect, upload.single('image'), updateWishlistItem);

// Bonus funksiya üçün xüsusi route
router.route('/:id/move').post(protect, moveItemToWardrobe);

export default router;
