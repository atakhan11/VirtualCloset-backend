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
            ref: 'user', 
        },
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Cloth', 
            },
        ],
        isPlanned: {
            type: Boolean,
            default: false, 
        },
        plannedDate: {
            type: Date, 
        },
    },
    
    {
        timestamps: true, 
    }
);

const Outfit = mongoose.model('Outfit', outfitSchema);

export default Outfit;
