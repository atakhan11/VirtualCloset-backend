
import mongoose from 'mongoose';

const activitySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', 
    },
    actionType: {
      type: String,
      required: true,

    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;