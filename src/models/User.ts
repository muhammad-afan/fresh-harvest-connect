import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String }, // only for credentials provider
  role: { type: String, enum: ['FARMER', 'CONSUMER', 'ADMIN'], default: 'CONSUMER' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
