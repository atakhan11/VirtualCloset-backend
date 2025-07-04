import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Məhsulun adını daxil etmək məcburidir'],
            trim: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'user', 
        },
        image: {
            type: String,
            required: true, 
        },
        category: {
            type: String,
            required: false,
        },
        price: {
            type: Number,
            required: false,
        },
        storeUrl: {
            type: String, 
            trim: true,
        },
        notes: {
            type: String,
        },
        isPurchased: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, 
    }
);

const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema);

export default WishlistItem;
