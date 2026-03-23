import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problem_id: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  leetcode_username: { type: String, required: true },
  code: { type: String, required: true },
  screenshot_url: { type: String, required: true },
  token_used: { type: String, required: true },
  verification: {
    token_valid: { type: Boolean, default: false },
    ocr_passed: { type: Boolean, default: false },
    similarity_score: { type: Number, default: 0 },
    final_status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    }
  },
  score: { type: Number, default: 0 },
  submitted_at: { type: Date, default: Date.now }
});

export default mongoose.model('Submission', submissionSchema);
