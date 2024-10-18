const express = require('express');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');

// Complete a challenge
router.post('/complete', async (req, res) => {
  const { userId, challengeId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ msg: 'Challenge not found' });

    // Complete the challenge and update points
    await user.completeChallenge(challengeId, challenge.points);
    await user.updateLevel();  // Update the user's level after challenge completion

    res.json({ msg: 'Challenge completed, points and level updated', user });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create a new challenge
router.post('/create', authMiddleware, async (req, res) => {
  const { title, description, points, estimatedTime, dueDate } = req.body;
  try {
    const newChallenge = new Challenge({
      title,
      description,
      points,
      estimatedTime,
      dueDate,
    });
    await newChallenge.save();
    res.json(newChallenge);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update an existing challenge
router.put('/edit/:id', authMiddleware, async (req, res) => {
  const { title, description, points, dueDate } = req.body;
  try {
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { title, description, points, dueDate },
      { new: true }
    );
    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a challenge
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Challenge deleted' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Submit an activity
router.post('/submit', authMiddleware, upload.single('submissionFile'), async (req, res) => {
  const { challengeId, submissionLink } = req.body;
  const submissionFile = req.file ? req.file.path : null;
  const userId = req.user.id;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ msg: 'Challenge not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Check if the user has already submitted this challenge
    const alreadySubmitted = user.completedChallenges.some(
      (c) => c.challengeId.toString() === challengeId
    );
    if (alreadySubmitted) {
      return res.status(400).json({ msg: 'Challenge already submitted' });
    }

    // Add submission to challenge's submissions
    challenge.submissions.push({
      userId,
      submissionLink,
      submissionFile,
    });
    await challenge.save();

    // Add to user's completed challenges
    await user.completeChallenge(challengeId, challenge.points, challenge.estimatedTime);

    // Update user level after challenge completion
    await user.updateLevel();

    res.json({ msg: 'Activity submitted successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get current challenges
router.get('/', authMiddleware, async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user's completed activities
router.get('/completed', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('completedChallenges.challengeId');
    res.json(user.completedChallenges);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
