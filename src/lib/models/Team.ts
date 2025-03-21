import mongoose, { Schema, Document, model, Model } from 'mongoose';

// Define the schema for round details
interface RoundDetails {
  completed: boolean;
  score: number;
  attempts: number;
  timeSpent: number;
  hintUsed: boolean;
  completedAt: Date;
}

// Define the schema for completed rounds
interface CompletedRounds {
  round1: boolean;
  round2: boolean;
  round3: boolean;
}

// Define the interface for the Team document
export interface TeamDocument extends Document {
  name: string;
  members: string[];
  completedRounds: CompletedRounds;
  roundDetails?: {
    round1?: RoundDetails;
    round2?: RoundDetails;
    round3?: RoundDetails;
  };
  score: number;
  createdAt: Date;
  lastActive: Date;
}

// Define the team schema
const TeamSchema = new Schema<TeamDocument>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  members: {
    type: [String],
    required: true,
    validate: [(val: string[]) => val.length >= 1, 'Team must have at least one member']
  },
  completedRounds: {
    round1: {
      type: Boolean,
      default: false
    },
    round2: {
      type: Boolean,
      default: false
    },
    round3: {
      type: Boolean,
      default: false
    }
  },
  roundDetails: {
    round1: {
      completed: Boolean,
      score: Number,
      attempts: Number,
      timeSpent: Number,
      hintUsed: Boolean,
      completedAt: Date
    },
    round2: {
      completed: Boolean,
      score: Number,
      attempts: Number,
      timeSpent: Number,
      hintUsed: Boolean,
      completedAt: Date
    },
    round3: {
      completed: Boolean,
      score: Number,
      attempts: Number,
      timeSpent: Number,
      hintUsed: Boolean,
      completedAt: Date
    }
  },
  score: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Register the model
let Team: Model<TeamDocument>;

try {
  // Check if the model is already registered
  Team = mongoose.model<TeamDocument>('Team');
} catch {
  // If not, register it
  Team = mongoose.model<TeamDocument>('Team', TeamSchema);
}

export default Team; 