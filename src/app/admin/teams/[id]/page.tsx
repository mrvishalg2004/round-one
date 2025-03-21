'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaUserPlus, FaTrash, FaSave } from 'react-icons/fa';

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
  createdAt: string;
}

interface PageProps {
  params: { id: string };
}

export default function EditTeam({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [completedRounds, setCompletedRounds] = useState({
    round1: false,
    round2: false,
    round3: false,
  });
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem('admin_auth');
    if (adminAuth !== 'true') {
      router.push('/admin');
      return;
    }

    // Fetch team data
    const fetchTeam = () => {
      // Mock data - in a real app, this would be an API call
      const mockTeams: Team[] = [
        {
          id: '1',
          name: 'Code Ninjas',
          members: ['John Doe', 'Jane Smith'],
          completedRounds: {
            round1: true,
            round2: true,
            round3: false
          },
          score: 720,
          createdAt: '2023-06-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Cyber Wizards',
          members: ['Alice Johnson', 'Bob Brown'],
          completedRounds: {
            round1: true,
            round2: true,
            round3: true
          },
          score: 850,
          createdAt: '2023-06-15T09:45:00Z'
        },
        {
          id: '3',
          name: 'Security Squad',
          members: ['Carol White', 'Dave Green'],
          completedRounds: {
            round1: true,
            round2: false,
            round3: false
          },
          score: 350,
          createdAt: '2023-06-15T11:15:00Z'
        }
      ];
      
      const foundTeam = mockTeams.find(t => t.id === id);
      
      if (foundTeam) {
        setTeam(foundTeam);
        setTeamName(foundTeam.name);
        setMembers([...foundTeam.members]);
        setCompletedRounds({...foundTeam.completedRounds});
        setScore(foundTeam.score);
      } else {
        setError('Team not found');
      }
      
      setLoading(false);
    };
    
    fetchTeam();
  }, [id, router]);

  const addMember = () => {
    setMembers([...members, '']);
  };

  const removeMember = (index: number) => {
    if (members.length <= 2) {
      setError('A team must have at least 2 members');
      return;
    }
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };

  const updateMember = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const validateForm = () => {
    if (!teamName.trim()) {
      setError('Team name is required');
      return false;
    }

    if (members.length < 2) {
      setError('A team must have at least 2 members');
      return false;
    }

    for (let i = 0; i < members.length; i++) {
      if (!members[i].trim()) {
        setError(`Member ${i + 1} name is required`);
        return false;
      }
    }

    // Check for duplicate members
    const uniqueMembers = new Set(members.map(m => m.trim().toLowerCase()));
    if (uniqueMembers.size !== members.length) {
      setError('Each team member must have a unique name');
      return false;
    }

    return true;
  };

  const handleToggleRound = (round: 'round1' | 'round2' | 'round3') => {
    // Ensure rounds are completed in order
    if (round === 'round2' && !completedRounds.round1) {
      setError('Round 1 must be completed before Round 2');
      return;
    }
    if (round === 'round3' && (!completedRounds.round1 || !completedRounds.round2)) {
      setError('Round 1 and 2 must be completed before Round 3');
      return;
    }

    setCompletedRounds(prev => ({
      ...prev,
      [round]: !prev[round]
    }));

    // If turning off a round, also turn off subsequent rounds
    if (round === 'round1' && completedRounds.round1) {
      setCompletedRounds(prev => ({
        ...prev,
        round1: false,
        round2: false,
        round3: false
      }));
    } else if (round === 'round2' && completedRounds.round2) {
      setCompletedRounds(prev => ({
        ...prev,
        round2: false,
        round3: false
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    // In a real app, this would make an API call to update the team
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success
      console.log('Updated team:', {
        id,
        name: teamName,
        members: members.filter(m => m.trim()),
        completedRounds,
        score
      });
      
      // Redirect to teams page
      router.push('/admin/teams');
    } catch (err) {
      setError('Failed to update team. Please try again.');
      console.error('Error updating team:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
            <h2 className="text-xl mb-2">Error</h2>
            <p>{error || 'Team not found'}</p>
            <button
              onClick={() => router.push('/admin/teams')}
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Teams
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push('/admin/teams')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-3xl font-bold">Edit Team</h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6 flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="teamName" className="block text-gray-300 mb-2 font-medium">
                Team Name
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-4 py-2 w-full text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter team name"
                required
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-300 font-medium">
                  Team Members
                </label>
                <button
                  type="button"
                  onClick={addMember}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center text-sm"
                >
                  <FaUserPlus className="mr-2" /> Add Member
                </button>
              </div>
              
              {members.map((member, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => updateMember(index, e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-l px-4 py-2 w-full text-white focus:outline-none focus:border-blue-500"
                    placeholder={`Member ${index + 1} name`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-r flex items-center"
                    title="Remove member"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <p className="text-sm text-gray-400 mt-2">
                Each team must have at least 2 members
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">
                Progress
              </label>
              <div className="flex flex-col space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={completedRounds.round1}
                    onChange={() => handleToggleRound('round1')}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <span className="ml-2">Round 1 Completed</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={completedRounds.round2}
                    onChange={() => handleToggleRound('round2')}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <span className="ml-2">Round 2 Completed</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={completedRounds.round3}
                    onChange={() => handleToggleRound('round3')}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <span className="ml-2">Round 3 Completed</span>
                </label>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="score" className="block text-gray-300 mb-2 font-medium">
                Score
              </label>
              <input
                type="number"
                id="score"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                min="0"
                className="bg-gray-700 border border-gray-600 rounded px-4 py-2 w-full text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin/teams')}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 