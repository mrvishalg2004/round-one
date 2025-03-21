import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getTeamFromToken } from '@/utils/auth';

export async function GET(request: Request) {
  try {
    // Get team from token
    const team = getTeamFromToken(request);
    
    if (!team) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get team data
    const teamData = await db.collection('teams').findOne({ _id: team.teamId });
    
    if (!teamData) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    // For development, we'll return mock data if there's an issue with the database
    const mockTeam = {
      id: team.teamId,
      name: team.teamName,
      members: ['Team Member 1', 'Team Member 2'],
      completedRounds: {
        round1: false,
        round2: false,
        round3: false
      },
      score: 0
    };
    
    return NextResponse.json({
      success: true,
      team: teamData ? {
        id: teamData._id,
        name: teamData.name,
        members: teamData.members,
        completedRounds: teamData.completedRounds,
        score: teamData.score
      } : mockTeam
    });
  } catch (error) {
    console.error('Team data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    );
  }
} 