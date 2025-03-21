import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { generateToken } from '@/utils/auth';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teamName, members } = body;
    
    // Validate request
    if (!teamName || !members || !Array.isArray(members) || members.length !== 2) {
      return NextResponse.json(
        { error: 'Team name and exactly two members are required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Check if team name already exists
    const existingTeam = await db.collection('teams').findOne({ name: teamName });
    if (existingTeam) {
      return NextResponse.json(
        { error: 'Team name already exists' },
        { status: 400 }
      );
    }
    
    // Create team
    const teamId = nanoid();
    const team = {
      _id: teamId,
      name: teamName,
      members,
      createdAt: new Date(),
      completedRounds: {
        round1: false,
        round2: false,
        round3: false
      },
      score: 0,
      lastActive: new Date()
    };
    
    await db.collection('teams').insertOne(team);
    
    // Create game state for the team
    const gameState = {
      teamId,
      round1Attempts: 0,
      round2Attempts: 0,
      round3Attempts: 0,
      hintsUsed: 0,
      startTime: new Date(),
      endTime: null
    };
    
    await db.collection('games').insertOne(gameState);
    
    // Generate JWT
    const token = generateToken({ teamId, teamName });
    
    return NextResponse.json({ 
      success: true, 
      token,
      team: {
        id: teamId,
        name: teamName,
        members,
        completedRounds: team.completedRounds,
        score: team.score
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register team' },
      { status: 500 }
    );
  }
} 