import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["trainer", "student"], required: true },
  leetcode_username: { type: String, default: "" },
  assigned_problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActive: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
