// leaderboard-backend/models/Challenge.js

const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    points: { type: Number, required: true },
    estimatedTime: { type: Number, required: true }, // Time in minutes
    dueDate: { type: Date, required: true },
    submissions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        submissionLink: { type: String },
        submissionFile: { type: String }, // File path or URL
        dateSubmitted: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Challenge = mongoose.model('Challenge', challengeSchema);
module.exports = Challenge;
