import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true },
  questions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    marksAssigned: { type: Number, required: true },
    selectedOptionIndices: { type: [Number], default: [] },
    isCorrect: { type: Boolean, default: null }
  }],
  totalMarks: { type: Number, required: true },
  startedAt: { type: Date, default: Date.now },
  durationMinutes: { type: Number, required: true },
  deadlineAt: { type: Date, required: true },
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'auto-submitted', 'abandoned'],
    default: 'in-progress'
  },
  submittedAt: Date,
  score: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false }
}, { timestamps: true });

attemptSchema.index({ userId: 1, status: 1 });
attemptSchema.index({ deadlineAt: 1, status: 1 });

export default mongoose.model('Attempt', attemptSchema);
