import mongoose from 'mongoose';

const noteQuestionSchema = new mongoose.Schema({
  note_id: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
  questions: [{
    leetcode_link: { type: String, required: true },
    title: { type: String, default: "" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    order: { type: Number, default: 0 }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('NoteQuestion', noteQuestionSchema);
