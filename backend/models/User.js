import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  plainPassword: { type: String },
  college: { type: String, required: true, trim: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
