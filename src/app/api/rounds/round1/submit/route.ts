import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/lib/models/Team';
import Game from '@/lib/models/Game';
import Clue from '@/lib/models/Clue';
import { getTeamFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Get authorization token
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get team from token
    const teamData = getTeamFromToken(token);
    if (!teamData) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // Get game state
    const game = await Game.findOne({ 'round1.active': true });
    if (!game) {
      return NextResponse.json(
        { error: 'Round 1 is not active' },
        { status: 400 }
      );
    }
    
    // Check if max qualified teams reached
    if (game.round1.qualifiedTeams >= game.round1.maxQualifyingTeams) {
      return NextResponse.json(
        { error: 'Maximum number of qualifying teams reached for Round 1' },
        { status: 400 }
      );
    }
    
    // Get team
    const team = await Team.findById(teamData.id);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Check if team already completed this round
    if (team.progress.round1Completed) {
      return NextResponse.json(
        { error: 'Team has already completed Round 1' },
        { status: 400 }
      );
    }
    
    // Parse submission
    const body = await req.json();
    const { linkId, score, attempts, timeSpent, hintUsed } = body;
    
    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }
    
    // Find clue by ID and check if it's the answer
    const clue = await Clue.findById(linkId);
    
    if (!clue || !clue.isAnswer) {
      // Wrong answer - Increment attempt count
      team.progress.attempts.round1 += 1;
      await team.save();
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Incorrect link. Try again!',
          attempts: team.progress.attempts.round1
        },
        { status: 400 }
      );
    }
    
    // Correct answer - Update team progress with completion details
    team.progress.round1Completed = true;
    team.progress.currentRound = 2;
    team.progress.roundCompletionTimes.round1 = new Date();
    team.progress.roundStartTimes.round2 = new Date();
    team.progress.attempts.round1 = attempts;
    team.progress.scores = team.progress.scores || {};
    team.progress.scores.round1 = score;
    team.progress.stats = team.progress.stats || {};
    team.progress.stats.round1 = {
      timeSpent,
      hintUsed,
      completedAt: new Date()
    };
    
    await team.save();
    
    // Increment qualified teams count
    game.round1.qualifiedTeams += 1;
    
    // If max teams reached, end the round
    if (game.round1.qualifiedTeams >= game.round1.maxQualifyingTeams) {
      game.round1.active = false;
      game.round1.endTime = new Date();
      game.round2.active = true;
      game.round2.startTime = new Date();
      game.currentRound = 2;
    }
    
    await game.save();
    
    return NextResponse.json({
      success: true,
      message: 'Congratulations! You have qualified for Round 2!',
      nextRound: 2,
      score,
      stats: {
        timeSpent,
        attempts,
        hintUsed
      }
    });
    
  } catch (error) {
    console.error('Error submitting Round 1 answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
} 