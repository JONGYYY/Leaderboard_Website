// leaderboard-backend/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 }, // Total accumulated time in minutes
    level: { type: String, default: 'Starter' },
    badges: { type: [String], default: [] },
    currentChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
    completedChallenges: [
      {
        challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
        pointsEarned: { type: Number, required: true },
        timeEarned: { type: Number, required: true, default: 0 }, // Time earned from the challenge
        dateCompleted: { type: Date, default: Date.now },
        submissionLink: { type: String },
        submissionFile: { type: String }, // File path or URL
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.completeChallenge = function (challengeId, points, time) {
  this.completedChallenges.push({
    challengeId,
    pointsEarned: points,
    timeEarned: time,
  });
  this.points += points; // Update user points
  this.totalTime += time; // Update total time
  return this.save();
};

userSchema.methods.updateLevel = function () {
  if (this.points >= 1000) {
    this.level = 'Platinum';
  } else if (this.points >= 500) {
    this.level = 'Gold';
  } else if (this.points >= 300) {
    this.level = 'Silver';
  } else if (this.points >= 100) {
    this.level = 'Bronze';
  } else {
    this.level = 'Starter';
  }
  return this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
