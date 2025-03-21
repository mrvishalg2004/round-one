import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  members: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      }
    }
  ],
  progress: {
    currentRound: {
      type: Number,
      default: 1,
    },
    round1Completed: {
      type: Boolean,
      default: false,
    },
    round2Completed: {
      type: Boolean,
      default: false,
    },
    round3Completed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      round1: {
        type: Number,
        default: 0
      },
      round2: {
        type: Number,
        default: 0
      },
      round3: {
        type: Number,
        default: 0
      }
    },
    scores: {
      round1: {
        type: Number,
        default: 0
      },
      round2: {
        type: Number,
        default: 0
      },
      round3: {
        type: Number,
        default: 0
      }
    },
    stats: {
      round1: {
        timeSpent: Number,
        hintUsed: Boolean,
        completedAt: Date
      },
      round2: {
        timeSpent: Number,
        hintUsed: Boolean,
        completedAt: Date
      },
      round3: {
        timeSpent: Number,
        hintUsed: Boolean,
        completedAt: Date
      }
    },
    roundStartTimes: {
      round1: {
        type: Date,
      },
      round2: {
        type: Date,
      },
      round3: {
        type: Date,
      }
    },
    roundCompletionTimes: {
      round1: {
        type: Date,
      },
      round2: {
        type: Date,
      },
      round3: {
        type: Date,
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for total score
TeamSchema.virtual('totalScore').get(function() {
  const scores = this.progress.scores || {};
  return (scores.round1 || 0) + (scores.round2 || 0) + (scores.round3 || 0);
});

export default mongoose.models.Team || mongoose.model('Team', TeamSchema); 