import mongoose from 'mongoose';

const outfitSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Kombinə ad vermək məcburidir'],
            trim: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'user', // Bu kombinin hansı istifadəçiyə aid olduğunu göstərir
        },
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Cloth', // Kombinə daxil olan geyimlərin ID-ləri
            },
        ],
        isPlanned: {
            type: Boolean,
            default: false, // Standard olaraq heç bir kombin planlanmayıb
        },
        plannedDate: {
            type: Date, // Planlandığı tarix
        },
    },
    
    {
        timestamps: true, // `createdAt` və `updatedAt` sahələrini avtomatik əlavə edir
    }
);

const Outfit = mongoose.model('Outfit', outfitSchema);

export default Outfit;
