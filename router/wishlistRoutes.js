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

router.route('/')
    .get(protect, getMyWishlist)
    .post(protect, addWishlistItem);
router.post('/:id/move', protect, moveItemToWardrobe);
router.route('/:id')
    .delete(protect, deleteWishlistItem)
    .put(protect, updateWishlistItem);

export default router;
