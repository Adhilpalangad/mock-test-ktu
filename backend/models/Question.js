import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true, trim: true },
  options: {
    type: [{
      text: { type: String, required: true },
      isCorrect: { type: Boolean, required: true }
    }],
    validate: {
      validator: (v) => v.length >= 2 && v.filter(o => o.isCorrect).length >= 1,
      message: 'Must have at least one correct answer.'
    }
  },
  marks: { type: Number, required: true, min: 1 },
  category: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ['basic', 'intermediate', 'application'], required: true },
  explanation: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

questionSchema.index({ category: 1, isActive: 1 });

export default mongoose.model('Question', questionSchema);
