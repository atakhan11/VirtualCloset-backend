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
            ref: 'user', // Bu məhsulun hansı istifadəçiyə aid olduğunu göstərir
        },
        image: {
            type: String,
            required: false, // Şəkil məcburi deyil
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
            type: String, // Məhsulun satıldığı mağazanın linki
            trim: true,
        },
        notes: {
            type: String,
        },
        isPurchased: { // Məhsulun alınıb-alınmadığını göstərir
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // `createdAt` və `updatedAt` sahələrini avtomatik əlavə edir
    }
);

const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema);

export default WishlistItem;
