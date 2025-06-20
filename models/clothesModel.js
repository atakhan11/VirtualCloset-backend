// models/clothesModel.js

import mongoose from 'mongoose';

const clothesSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
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
        // --- DƏYİŞİKLİK BURADADIR ---
        category: {
            type: String,
            required: true,
            enum: [
                'Köynək (T-shirt)',
                'Köynək (Klassik)',
                'Polo',
                'Svitşot / Hudi',
                'Sviter / Cemper',
                'Gödəkçə / Palto',
                'Pencək / Blazer',
                'Şalvar / Cins',
                'Şort',
                'Ayaqqabı',
                'Aksesuar',
                'İdman Geyimi',
                'Kostyum',
                'Başqa'
            ]
        },
        colors: {
            type: [String],
            required: false
        },
        season: {
            type: String,
            required: false,
            enum: ['Yay', 'Qış', 'Payız', 'Yaz', 'Mövsümsüz']
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