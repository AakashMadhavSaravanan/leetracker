import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import { verifySubmission } from '../services/verificationService.js';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const getToken = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id.toString();
    
    // Generate unique 4-digit code
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const userIdPrefix = userId.substring(userId.length - 6).toUpperCase();
    const token = `USR${userIdPrefix}_${randomDigits}`;

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitSolution = async (req, res) => {
  try {
    const { problem_id, code, token_used } = req.body;
    let { screenshot_url } = req.body;
    const file = req.file;

    const problem = await Problem.findById(problem_id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Handle File Upload to Cloudinary if file provided
    if (file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'submissions' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });
        screenshot_url = result.secure_url;
      } catch (uploadErr) {
        return res.status(500).json({ message: 'Image upload failed', error: uploadErr.message });
      }
    }

    if (!screenshot_url) {
      return res.status(400).json({ message: 'Screenshot is required (file or URL)' });
    }

    // Prepare screenshot for verification service (must be base64)
    let screenshot_base64 = screenshot_url;
    if (file) {
      screenshot_base64 = file.buffer.toString('base64');
    }

    // Call Verification Service (Python)
    console.log(`[Verification] Request for User: ${req.user.leetcode_username}, Problem: ${problem.title}`);
    const verificationResult = await verifySubmission({
      code,
      screenshot_base64: screenshot_base64,
      token: token_used,
      username: req.user.leetcode_username,
      problem_title: problem.title,
      reference_solution: problem.reference_solution // Critical fix: pass reference solution
    });
    console.log(`[Verification] Result for ${problem.title}:`, JSON.stringify(verificationResult, null, 2));

    // Score calculation
    let difficultyWeight = 10;
    if (problem.difficulty === 'Medium') difficultyWeight = 20;
    if (problem.difficulty === 'Hard') difficultyWeight = 30;

    let verificationBonus = 0.2; // 1 layer passes (minimum basically, if none passed it's 0 usually but spec says 1 layer = 0.2)
    let passedLayers = 0;
    if (verificationResult.token_valid) passedLayers++;
    if (verificationResult.ocr_passed) passedLayers++;
    if (verificationResult.similarity_score >= 0.3) passedLayers++;

    if (passedLayers === 3) verificationBonus = 1.0;
    else if (passedLayers === 2) verificationBonus = 0.6;
    else if (passedLayers <= 1) verificationBonus = 0.2; // Treating 0 layers as 0.2 per spec

    const score = difficultyWeight * verificationBonus;

    const submission = new Submission({
      user_id: req.user._id,
      problem_id,
      leetcode_username: req.user.leetcode_username,
      code,
      screenshot_url,
      token_used,
      verification: {
        token_valid: verificationResult.token_valid,
        ocr_passed: verificationResult.ocr_passed,
        similarity_score: verificationResult.similarity_score,
        final_status: verificationResult.final_status
      },
      score
    });

    await submission.save();

    // Update streak if verified
    if (verificationResult.final_status === 'verified') {
      const user = await User.findById(req.user._id);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastActive = user.streak.lastActive ? new Date(user.streak.lastActive) : null;
      if (lastActive) lastActive.setHours(0, 0, 0, 0);

      if (!lastActive) {
        user.streak.current = 1;
        user.streak.longest = 1;
      } else {
        const diffTime = Math.abs(today - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          user.streak.current += 1;
          if (user.streak.current > user.streak.longest) {
            user.streak.longest = user.streak.current;
          }
        } else if (diffDays > 1) {
          user.streak.current = 1;
        }
      }
      user.streak.lastActive = new Date();
      await user.save();
    }

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user_id: req.user._id })
      .populate('problem_id', 'title difficulty')
      .sort({ submitted_at: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('user_id', 'name email leetcode_username')
      .populate('problem_id', 'title difficulty')
      .sort({ submitted_at: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
