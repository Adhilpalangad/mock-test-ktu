import mongoose from 'mongoose';

const mockTestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  totalMarks: { type: Number, default: 100 },
  durationMinutes: { type: Number, default: 60 },
  categoryRules: {
    type: [{ category: String, minQuestions: { type: Number, default: 0 }, maxQuestions: Number }],
    default: []
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('MockTest', mockTestSchema);
