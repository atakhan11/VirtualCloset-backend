import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    isActive: { 
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const AnnouncementModel = mongoose.model('Announcement', announcementSchema);

export default AnnouncementModel;