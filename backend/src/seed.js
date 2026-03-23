import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';
import Problem from './models/Problem.js';
import Note from './models/Note.js';
import NoteQuestion from './models/NoteQuestion.js';
import Submission from './models/Submission.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for seeding...');

    // Clear existing
    await User.deleteMany({});
    await Problem.deleteMany({});
    await Note.deleteMany({});
    await NoteQuestion.deleteMany({});
    await Submission.deleteMany({});

    // Hash passwords
    const trainerPass = await bcrypt.hash('Trainer@123', 10);
    const studentPass = await bcrypt.hash('Student@123', 10);

    // Create Users
    const trainer = await User.create({
      name: 'Trainer',
      email: 'trainer@test.com',
      password: trainerPass,
      role: 'trainer'
    });

    const student1 = await User.create({
      name: 'Student 1',
      email: 'student1@test.com',
      password: studentPass,
      role: 'student',
      leetcode_username: 'student1_lc'
    });

    const student2 = await User.create({
      name: 'Student 2',
      email: 'student2@test.com',
      password: studentPass,
      role: 'student',
      leetcode_username: 'student2_lc'
    });

    const student3 = await User.create({
      name: 'Student 3',
      email: 'student3@test.com',
      password: studentPass,
      role: 'student',
      leetcode_username: 'student3_lc'
    });

    // Create Problems
    const p1 = await Problem.create({
      title: 'Two Sum',
      leetcode_link: 'https://leetcode.com/problems/two-sum',
      difficulty: 'Easy',
      assigned_by: trainer._id,
      assigned_to: [student1._id, student2._id, student3._id]
    });

    const p2 = await Problem.create({
      title: 'Valid Parentheses',
      leetcode_link: 'https://leetcode.com/problems/valid-parentheses',
      difficulty: 'Easy',
      assigned_by: trainer._id,
      assigned_to: [student1._id, student2._id, student3._id]
    });

    const p3 = await Problem.create({
      title: 'Best Time to Buy Stock',
      leetcode_link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock',
      difficulty: 'Medium',
      assigned_by: trainer._id,
      assigned_to: [student1._id, student2._id, student3._id]
    });

    const p4 = await Problem.create({
      title: 'LRU Cache',
      leetcode_link: 'https://leetcode.com/problems/lru-cache',
      difficulty: 'Medium', // Specs say medium, leetcode is medium usually
      assigned_by: trainer._id,
      assigned_to: [student1._id, student2._id, student3._id]
    });

    const p5 = await Problem.create({
      title: 'Merge K Lists',
      leetcode_link: 'https://leetcode.com/problems/merge-k-sorted-lists',
      difficulty: 'Hard',
      assigned_by: trainer._id,
      assigned_to: [student1._id, student2._id, student3._id]
    });

    // Add problems to users assigned_problems array
    const allStudents = [student1, student2, student3];
    const allProblems = [p1, p2, p3, p4, p5];
    
    for (const student of allStudents) {
      student.assigned_problems = allProblems.map(p => p._id);
      await student.save();
    }

    // Create Notes
    const n1 = await Note.create({
      title: 'Two Pointers Technique',
      description: 'Understanding the two pointers technique',
      file_url: 'https://res.cloudinary.com/demo/image/upload/v1/dummy.pdf',
      file_type: 'pdf',
      content_text: 'This is a 400-word explanation of two pointers...',
      created_by: trainer._id,
      assigned_to: [student1._id, student2._id],
      is_published: true
    });

    await NoteQuestion.create({
      note_id: n1._id,
      questions: [
        { leetcode_link: 'https://leetcode.com/problems/two-sum', title: 'Two Sum', difficulty: 'Easy', order: 1 },
        { leetcode_link: 'https://leetcode.com/problems/container-with-most-water', title: 'Container With Most Water', difficulty: 'Medium', order: 2 }
      ]
    });

    const n2 = await Note.create({
      title: 'Dynamic Programming Fundamentals',
      description: 'Intro to DP',
      file_url: 'https://res.cloudinary.com/demo/image/upload/v1/dummy.docx',
      file_type: 'docx',
      content_text: 'This is a 500-word explanation of dynamic programming...',
      created_by: trainer._id,
      assigned_to: [student2._id, student3._id],
      is_published: true
    });

    await NoteQuestion.create({
      note_id: n2._id,
      questions: [
        { leetcode_link: 'https://leetcode.com/problems/climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', order: 1 },
        { leetcode_link: 'https://leetcode.com/problems/longest-common-subsequence', title: 'Longest Common Subsequence', difficulty: 'Medium', order: 2 }
      ]
    });

    // Create Submissions
    await Submission.create({
      user_id: student1._id,
      problem_id: p1._id,
      leetcode_username: student1.leetcode_username,
      code: 'def twoSum(nums, target): return [0, 1]',
      screenshot_url: 'https://res.cloudinary.com/demo/image/upload/v1/dummy.png',
      token_used: 'USRX_1234',
      verification: {
        token_valid: true,
        ocr_passed: true,
        similarity_score: 0.9,
        final_status: 'verified'
      },
      score: 10 * 1.0 // Easy * 3 layers
    });

    await Submission.create({
      user_id: student2._id,
      problem_id: p2._id,
      leetcode_username: student2.leetcode_username,
      code: 'def isValid(s): return True',
      screenshot_url: 'https://res.cloudinary.com/demo/image/upload/v1/dummy.png',
      token_used: 'USRY_5678',
      verification: {
        token_valid: true,
        ocr_passed: false,
        similarity_score: 0.4,
        final_status: 'rejected'
      },
      score: 10 * 0.6 // Easy * 2 layers
    });

    await Submission.create({
      user_id: student3._id,
      problem_id: p4._id,
      leetcode_username: student3.leetcode_username,
      code: 'class LRUCache: pass',
      screenshot_url: 'https://res.cloudinary.com/demo/image/upload/v1/dummy.png',
      token_used: 'USRZ_9101',
      verification: {
        token_valid: false,
        ocr_passed: false,
        similarity_score: 0,
        final_status: 'pending'
      },
      score: 0
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
