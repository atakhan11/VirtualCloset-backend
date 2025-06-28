import express from 'express';
import { 
    addWishlistItem, 
    getMyWishlist, 
    deleteWishlistItem,
    moveItemToWardrobe,
    updateWishlistItem
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Bütün arzu siyahısı route-ları qorunmalıdır
router.route('/')
    .get(protect, getMyWishlist)
    .post(protect, addWishlistItem);

// Daha spesifik olan "/:id/move" route-u yuxarıda gəlir.
router.post('/:id/move', protect, moveItemToWardrobe);

// Ümumi olan "/:id" route-u aşağıda qalır.
router.route('/:id')
    .delete(protect, deleteWishlistItem)
    .put(protect, updateWishlistItem);

export default router;
