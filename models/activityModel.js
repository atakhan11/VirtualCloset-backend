// backend/models/activityModel.js

import mongoose from 'mongoose';

const activitySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // Hərəkəti edən istifadəçiyə istinad
    },
    actionType: {
      type: String,
      required: true,
      // Hərəkətin növünü müəyyən etmək üçün istifadə edəcəyik
      // Məsələn: 'USER_REGISTERED', 'CLOTH_ADDED', 'USER_DELETED'
    },
    message: {
      type: String,
      required: true,
      // İnsanların oxuya biləcəyi mesaj. Məsələn: "yeni bir geyim əlavə etdi"
    },
    // Gələcəkdə lazım olsa, hərəkətin aid olduğu elementə link verə bilərik
    // targetId: { type: mongoose.Schema.Types.ObjectId }
  },
  {
    timestamps: true, // `createdAt` və `updatedAt` sahələrini avtomatik əlavə edir
  }
);

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;