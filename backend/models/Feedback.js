import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String, required: true, trim: true }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
