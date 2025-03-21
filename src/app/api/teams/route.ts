import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    console.log('Connected to database');
    
    // Get teams with all necessary details
    const teams = await db.collection('teams').find({}).toArray();
    
    console.log('Raw teams data:', JSON.stringify(teams, null, 2));
    
    // Transform the data to match the expected format
    const transformedTeams = teams.map(team => ({
      id: team._id.toString(),
      name: team.teamName || team.name,
      members: team.members || [],
      completedRounds: team.progress?.completedRounds || {
        round1: false,
        round2: false,
        round3: false
      },
      score: team.score || 0,
      createdAt: team.createdAt || new Date().toISOString()
    }));
    
    console.log('Transformed teams:', JSON.stringify(transformedTeams, null, 2));
    
    return NextResponse.json({ teams: transformedTeams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 