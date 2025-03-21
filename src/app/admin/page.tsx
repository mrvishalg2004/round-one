'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUsers, FaKey, FaChartLine, FaCog, FaSignOutAlt, FaLock } from 'react-icons/fa';

export default function AdminPanel() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Admin credentials (in a real app, this would be server-side validated)
  const ADMIN_PASSWORD = 'https-admin-2023';
  
  useEffect(() => {
    // Check if admin is already logged in
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('admin_auth');
      if (adminAuth === 'true') {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700"
        >
          <div className="text-center mb-6">
            <FaLock className="text-blue-400 text-4xl mx-auto mb-3" />
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-gray-400 mt-2">Enter your password to access the admin panel</p>
          </div>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white"
                placeholder="Enter admin password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold"
            >
              Login
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white"
            >
              Return to Homepage
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Admin dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold">HTTPS Find Admin</h1>
            <p className="text-gray-400">Manage your treasure hunt game</p>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-blue-500 cursor-pointer"
            onClick={() => router.push('/admin/teams')}
          >
            <div className="flex items-center mb-4">
              <FaUsers className="text-blue-400 text-3xl mr-4" />
              <h2 className="text-2xl font-bold">Teams</h2>
            </div>
            <p className="text-gray-300 mb-4">
              View and manage registered teams. Track their progress and scores.
            </p>
            <div className="text-sm text-gray-400">
              15 registered teams
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 cursor-pointer"
            onClick={() => router.push('/admin/challenges')}
          >
            <div className="flex items-center mb-4">
              <FaKey className="text-purple-400 text-3xl mr-4" />
              <h2 className="text-2xl font-bold">Challenges</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Configure and edit challenges for each round. Set difficulty levels.
            </p>
            <div className="text-sm text-gray-400">
              3 active challenges
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-green-500 cursor-pointer"
            onClick={() => router.push('/admin/stats')}
          >
            <div className="flex items-center mb-4">
              <FaChartLine className="text-green-400 text-3xl mr-4" />
              <h2 className="text-2xl font-bold">Statistics</h2>
            </div>
            <p className="text-gray-300 mb-4">
              View game analytics, completion rates, and team performance metrics.
            </p>
            <div className="text-sm text-gray-400">
              5 teams completed round 2
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-yellow-500 cursor-pointer"
            onClick={() => router.push('/admin/settings')}
          >
            <div className="flex items-center mb-4">
              <FaCog className="text-yellow-400 text-3xl mr-4" />
              <h2 className="text-2xl font-bold">Settings</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Configure game settings, timers, and global parameters.
            </p>
            <div className="text-sm text-gray-400">
              Game active: Round 3 unlocked
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded"
              onClick={() => router.push('/admin/teams/new')}
            >
              Add New Team
            </button>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded"
              onClick={() => router.push('/admin/leaderboard')}
            >
              View Leaderboard
            </button>
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded"
              onClick={() => router.push('/')}
            >
              View Game Site
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 