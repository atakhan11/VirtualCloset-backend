// models/clothesModel.js

import mongoose from 'mongoose';

const clothesSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'user'
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true,
            enum: [
                'T-shirt',
    'Classic Shirt',
    'Polo',
    'Sweatshirt / Hoodie',
    'Sweater / Jumper',
    'Jacket / Coat',
    'Blazer / Suit Jacket',
    'Trousers / Jeans',
    'Shorts',
    'Shoes',
    'Accessory',
    'Sportswear',
    'Suit',
    'Other'
            ]
        },
        colors: {
            type: [String],
            required: false
        },
        season: {
            type: String,
            required: false,
            enum: ['Summer', 'Winter', 'Autumn', 'Spring', 'All-season']
        },
        brand: {
            type: String,
            required: false,
            trim: true
        },
        notes: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

const ClothesModel = mongoose.model('Cloth', clothesSchema);

export default ClothesModel;