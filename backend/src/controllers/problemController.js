import Problem from '../models/Problem.js';
import User from '../models/User.js';

export const createProblem = async (req, res) => {
  try {
    const { title, leetcode_link, difficulty, reference_solution } = req.body;

    const problem = new Problem({
      title,
      leetcode_link,
      difficulty,
      reference_solution: reference_solution || "",
      assigned_by: req.user._id
    });

    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProblems = async (req, res) => {
  try {
    let problems;
    if (req.user.role === 'trainer') {
      problems = await Problem.find().populate('assigned_to', 'name email');
    } else {
      problems = await Problem.find({ assigned_to: req.user._id }).populate('assigned_by', 'name');
    }
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const assignProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body; // Array of user ObjectIds

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Add students to problem's assigned_to without duplicates
    const currentAssigned = problem.assigned_to.map(id => id.toString());
    studentIds.forEach(studentId => {
      if (!currentAssigned.includes(studentId)) {
        problem.assigned_to.push(studentId);
      }
    });

    await problem.save();

    // Add problem to students' assigned_problems
    await User.updateMany(
      { _id: { $in: studentIds } },
      { $addToSet: { assigned_problems: item._id } }
    );

    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
