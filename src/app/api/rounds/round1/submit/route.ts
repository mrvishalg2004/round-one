import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Team from '@/lib/models/Team';
import { getTeamFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Get team from token
    const team = getTeamFromRequest(req);
    
    if (!team) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();
    
    // Get data from request
    const data = await req.json();
    const { score, attempts, timeSpent, hintUsed } = data;
    
    // Find a real team from the database instead of using mock ID
    // For testing, we'll just get the first team in the database
    const teams = await Team.find({}).limit(1);
    
    if (!teams || teams.length === 0) {
      return NextResponse.json({ success: false, error: 'No teams found' }, { status: 404 });
    }
    
    const teamDoc = teams[0];
    
    // Update team to mark round 1 as completed with score
    teamDoc.completedRounds.round1 = true;
    teamDoc.score += score || 100; // Default score if not provided
    teamDoc.lastActive = new Date();
    
    // Add round completion details if needed
    if (!teamDoc.roundDetails) {
      teamDoc.roundDetails = {};
    }
    
    teamDoc.roundDetails.round1 = {
      completed: true,
      score: score || 100,
      attempts: attempts || 1,
      timeSpent: timeSpent || 60,
      hintUsed: hintUsed || false,
      completedAt: new Date()
    };
    
    await teamDoc.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Round 1 completed successfully!',
      team: {
        id: teamDoc._id,
        name: teamDoc.name,
        score: teamDoc.score,
        completedRounds: teamDoc.completedRounds
      }
    });
    
  } catch (error) {
    console.error('Error completing round:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to complete round. Please try again.' 
    }, { 
      status: 500 
    });
  }
} 