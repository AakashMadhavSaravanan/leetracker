import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  leetcode_link: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  reference_solution: { type: String, default: "" },
  assigned_to: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Problem', problemSchema);
