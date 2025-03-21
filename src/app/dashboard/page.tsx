'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUsers, FaLock, FaCode, FaArrowRight, FaTrophy } from 'react-icons/fa';

interface Team {
  id: string;
  name: string;
  members: string[];
  completedRounds: {
    round1: boolean;
    round2: boolean;
    round3: boolean;
  };
  score: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        // Get auth token from cookie
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
        
        if (!tokenCookie) {
          router.push('/');
          return;
        }
        
        const token = tokenCookie.split('=')[1];
        
        // Fetch team data
        const response = await fetch('/api/team', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch team data');
        }
        
        const data = await response.json();
        setTeam(data.team);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setError('Failed to load team data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamData();
  }, [router]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-red-900/50 border border-red-500 p-8 rounded-lg">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  // For development, if no API is working yet
  const mockTeam: Team = team || {
    id: 'mock-team-id',
    name: 'Team Placeholder',
    members: ['Member 1', 'Member 2'],
    completedRounds: {
      round1: false,
      round2: false,
      round3: false
    },
    score: 0
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Team Dashboard</h1>
          <p className="text-xl text-gray-300">
            Welcome, <span className="font-bold text-blue-400">{mockTeam.name}</span>!
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mb-8 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FaTrophy className="text-yellow-400 mr-2" /> Team Progress
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold flex items-center">
                  <FaUsers className="text-blue-400 mr-2" /> Round 1
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${mockTeam.completedRounds.round1 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                  {mockTeam.completedRounds.round1 ? 'WON' : 'IN PROGRESS'}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-3">Hidden Link Hunt</p>
              <button
                onClick={() => router.push('/rounds/round1')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center"
              >
                {mockTeam.completedRounds.round1 ? 'Review' : 'Continue'} <FaArrowRight className="ml-2" />
              </button>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold flex items-center">
                  <FaCode className="text-purple-400 mr-2" /> Round 2
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${mockTeam.completedRounds.round1 ? (mockTeam.completedRounds.round2 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300') : 'bg-gray-500/20 text-gray-300'}`}>
                  {!mockTeam.completedRounds.round1 ? 'LOCKED' : (mockTeam.completedRounds.round2 ? 'WON' : 'IN PROGRESS')}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-3">Code Rush</p>
              <button
                onClick={() => mockTeam.completedRounds.round1 ? router.push('/rounds/round2') : null}
                disabled={!mockTeam.completedRounds.round1}
                className={`w-full py-2 rounded flex items-center justify-center ${mockTeam.completedRounds.round1 ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
              >
                {mockTeam.completedRounds.round2 ? 'Review' : (mockTeam.completedRounds.round1 ? 'Start' : 'Locked')} {mockTeam.completedRounds.round1 && <FaArrowRight className="ml-2" />}
              </button>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold flex items-center">
                  <FaLock className="text-green-400 mr-2" /> Round 3
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${mockTeam.completedRounds.round2 ? (mockTeam.completedRounds.round3 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300') : 'bg-gray-500/20 text-gray-300'}`}>
                  {!mockTeam.completedRounds.round2 ? 'LOCKED' : (mockTeam.completedRounds.round3 ? 'WON' : 'IN PROGRESS')}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-3">Decryption Challenge</p>
              <button
                onClick={() => mockTeam.completedRounds.round2 ? router.push('/rounds/round3') : null}
                disabled={!mockTeam.completedRounds.round2}
                className={`w-full py-2 rounded flex items-center justify-center ${mockTeam.completedRounds.round2 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
              >
                {mockTeam.completedRounds.round3 ? 'Review' : (mockTeam.completedRounds.round2 ? 'Start' : 'Locked')} {mockTeam.completedRounds.round2 && <FaArrowRight className="ml-2" />}
              </button>
            </div>
          </div>
          
          <div className="text-center mt-6 text-gray-400">
            <p>Complete all rounds to maximize your team's score!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 