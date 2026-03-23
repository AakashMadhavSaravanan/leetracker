import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  file_url: { type: String, required: true },
  file_type: { type: String, enum: ["pdf", "docx"], required: true },
  content_text: {
    type: String,
    default: "",
    maxlength: 50000
  },
  assigned_to: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  is_published: { type: Boolean, default: false },
  completed_by: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  highlights: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    start_offset: Number,
    end_offset: Number,
    color: { type: String, default: "#FDE68A" }
  }],
  createdAt: { type: Date, default: Date.now }
});

noteSchema.index({ content_text: "text", title: "text" });

export default mongoose.model('Note', noteSchema);
