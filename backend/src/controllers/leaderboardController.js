import User from '../models/User.js';
import Submission from '../models/Submission.js';

export const getLeaderboard = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name leetcode_username streak');
    
    // Aggregate scores from submissions
    const validStatuses = ['verified']; // Assuming rank is calculated based on verified solutions

    const leaderboardData = await Promise.all(students.map(async (student) => {
      const submissions = await Submission.find({ 
        user_id: student._id, 
        'verification.final_status': 'verified' 
      });

      const totalScore = submissions.reduce((acc, curr) => acc + curr.score, 0);
      const solvedCount = submissions.length; // 1 problem = 1 submission verified

      return {
        id: student._id,
        name: student.name,
        score: totalScore,
        solved: solvedCount,
        streak: student.streak.current
      };
    }));

    // Sort by score descending
    leaderboardData.sort((a, b) => b.score - a.score);

    // Add rank
    const rankedData = leaderboardData.map((data, index) => ({
      rank: index + 1,
      ...data
    }));

    res.json(rankedData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
