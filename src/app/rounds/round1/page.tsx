'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
import { FaArrowRight, FaLightbulb, FaSearch, FaEye, FaQuestionCircle, FaClock } from 'react-icons/fa';
import confetti from 'canvas-confetti';

interface Clue {
  id: string;
  type: 'real' | 'fake';
  content: string;
  hint?: string;
}

interface LinkPosition {
  x: number;
  y: number;
}

export default function Round1() {
  const router = useRouter();
  const [clues, setClues] = useState<Clue[]>([]);
  const [fakeLinks, setFakeLinks] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [linkOrder, setLinkOrder] = useState<number[]>([]);
  const [clickedLinks, setClickedLinks] = useState<Set<number>>(new Set());
  const [realLinkMoving, setRealLinkMoving] = useState(false);
  const [confirmClicks, setConfirmClicks] = useState(0);
  const [mouseMoveCount, setMouseMoveCount] = useState(0);
  const [linkSensitivity, setLinkSensitivity] = useState(0);
  const [pageBlurLevel, setPageBlurLevel] = useState(0);
  const [visibilityLevel, setVisibilityLevel] = useState(100);
  const [clueTextVisible, setClueTextVisible] = useState(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showChallengeInfo, setShowChallengeInfo] = useState(true);
  const [decoyClicked, setDecoyClicked] = useState(false);
  const [linkPositions, setLinkPositions] = useState<LinkPosition[]>([]);
  const [mousePosition, setMousePosition] = useState<LinkPosition>({ x: 0, y: 0 });
  const [patternProgress, setPatternProgress] = useState<number[]>([]);
  const [timeWindow, setTimeWindow] = useState<boolean>(true);
  const [environmentEffects, setEnvironmentEffects] = useState({
    fog: false,
    invert: false,
    mirror: false,
    shake: false
  });
  const [realLinkVisible, setRealLinkVisible] = useState(true);
  const [lastClickTime, setLastClickTime] = useState(Date.now());
  const [clickPattern, setClickPattern] = useState<string[]>([]);
  const correctPattern = ['top', 'right', 'bottom', 'left'];
  const [patternHintShown, setPatternHintShown] = useState(false);
  const [linkOpacity, setLinkOpacity] = useState(1);

  // Timer to track time spent on the challenge
  useEffect(() => {
    if (!loading && !success) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, success]);

  // Generate distraction elements and fake links
  useEffect(() => {
    const fakeLinkPhrases = [
      'Continue to next round',
      'This is the path forward',
      'Click to proceed',
      'Secret entrance ahead',
      'Gateway to next challenge',
      'Hidden path revealed',
      'Unlock next level',
      'Follow this link',
      'Journey continues here',
      'Access next stage',
      'The way forward',
      'Enter here to continue',
      'Proceed to next round',
      'Advance to next stage',
      'Click for next challenge',
      'Begin the next test',
      'Unlock the next puzzle',
      'Next stage awaits',
      'Continue your journey',
      'Pass to level two'
    ];
    
    // Generate random fake links
    const randomFakeLinks = [];
    const usedIndexes = new Set();
    
    while (randomFakeLinks.length < 19) {
      const randomIndex = Math.floor(Math.random() * fakeLinkPhrases.length);
      if (!usedIndexes.has(randomIndex)) {
        usedIndexes.add(randomIndex);
        randomFakeLinks.push(fakeLinkPhrases[randomIndex]);
      }
    }
    
    setFakeLinks(randomFakeLinks);
    
    // Create random order for displaying links
    const randomOrder = Array.from({ length: 20 }, (_, i) => i);
    for (let i = randomOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomOrder[i], randomOrder[j]] = [randomOrder[j], randomOrder[i]];
    }
    setLinkOrder(randomOrder);
    
    const fetchClues = async () => {
      try {
        // Get auth token from cookie
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
        
        if (!tokenCookie) {
          router.push('/');
          return;
        }
        
        const token = tokenCookie.split('=')[1];
        
        // In a production app, we would fetch clues from an API
        // For now, we'll simulate it with a mock clue
        setTimeout(() => {
          // Real link content should blend in with the fake links
          const mockClue: Clue = {
            id: nanoid(),
            content: 'This way to continue',
            type: 'real',
            hint: 'The true path reveals itself to those who observe carefully. Notice subtle differences in behavior when your cursor approaches.'
          };
          
          setClues([mockClue]);
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching clues:', error);
        setError('Failed to load challenge. Please try again.');
        setLoading(false);
      }
    };
    
    fetchClues();
  }, [router]);

  // Enhanced mouse movement tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!success && !loading) {
        const newPosition = { x: e.clientX, y: e.clientY };
        setMousePosition(newPosition);
        setMouseMoveCount(prev => prev + 1);
        
        // Update real link visibility based on mouse position
        if (linkPositions.length > 0) {
          const realLinkPos = linkPositions[19]; // Real link is at index 19
          const distance = Math.sqrt(
            Math.pow(newPosition.x - realLinkPos.x, 2) + 
            Math.pow(newPosition.y - realLinkPos.y, 2)
          );
          
          // Link becomes less visible as mouse gets closer
          const opacity = Math.min(1, distance / 300);
          setLinkOpacity(opacity);
          
          // Link teleports if mouse gets too close
          if (distance < 100 && !realLinkMoving) {
            teleportRealLink();
          }
        }
        
        // Every 50 mouse movements, trigger a random environmental effect
        if (mouseMoveCount > 0 && mouseMoveCount % 50 === 0) {
          triggerRandomEffect();
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseMoveCount, success, loading, linkPositions, realLinkMoving]);

  // Time window effect
  useEffect(() => {
    const toggleTimeWindow = () => {
      setTimeWindow(prev => !prev);
    };
    
    const interval = setInterval(toggleTimeWindow, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerRandomEffect = () => {
    const effects = ['fog', 'invert', 'mirror', 'shake'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    
    setEnvironmentEffects(prev => ({
      ...prev,
      [randomEffect]: true
    }));
    
    // Clear effect after a delay
    setTimeout(() => {
      setEnvironmentEffects(prev => ({
        ...prev,
        [randomEffect]: false
      }));
    }, 2000);
  };

  const teleportRealLink = () => {
    const newPositions = [...linkPositions];
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Generate new random position for real link
    newPositions[19] = {
      x: Math.random() * (viewportWidth - 100),
      y: Math.random() * (viewportHeight - 100)
    };
    
    setLinkPositions(newPositions);
    setRealLinkMoving(true);
    setTimeout(() => setRealLinkMoving(false), 500);
  };

  const handlePatternClick = (direction: string) => {
    const newPattern = [...clickPattern, direction];
    setClickPattern(newPattern);
    
    // Check if pattern matches so far
    const isCorrectSoFar = newPattern.every(
      (dir, index) => dir === correctPattern[index]
    );
    
    if (!isCorrectSoFar) {
      setClickPattern([]);
      setError('Pattern incorrect. Start over.');
      setAttempts(prev => prev + 1);
    } else if (newPattern.length === correctPattern.length) {
      // Pattern complete - make real link more visible
      setRealLinkVisible(true);
      setLinkOpacity(1);
      setPatternHintShown(true);
    }
  };

  const handleFakeClick = (index: number) => {
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClickTime;
    setLastClickTime(currentTime);
    
    // Add clicked link to set
    const newClickedLinks = new Set(clickedLinks);
    newClickedLinks.add(index);
    setClickedLinks(newClickedLinks);
    setDecoyClicked(true);
    
    setAttempts(prev => prev + 1);
    
    // Different error messages based on attempts and time between clicks
    const errorMessages = [
      'That\'s not the right link. Try again!',
      'Incorrect. The real link is hiding somewhere else.',
      'Nice try, but that\'s a decoy. Keep looking!',
      'That link leads nowhere. The true path is still hidden.',
      'Not quite right. The correct link has a unique quality.',
      'Too fast! The true path requires patience.',
      'The pattern is key. Watch carefully.',
      'Time your clicks wisely.'
    ];
    
    const messageIndex = timeSinceLastClick < 1000 ? 5 : 
                        attempts > 10 ? 6 :
                        Math.floor(Math.random() * 5);
    
    setError(errorMessages[messageIndex]);
    
    // After several attempts, show pattern hint
    if (attempts === 5 && !patternHintShown) {
      setError('The cardinal directions hold the key...');
    }
    
    // Randomly move the real link and trigger effects
    if (newClickedLinks.size > 0 && !realLinkMoving) {
      teleportRealLink();
      triggerRandomEffect();
    }
  };
  
  const handleRealClick = async () => {
    // Make it harder to click the real link - it requires multiple precise clicks
    if (confirmClicks < 2) {
      // First clicks - require confirmation
      setConfirmClicks(prev => prev + 1);
      
      if (confirmClicks === 0) {
        setError('You found something interesting. Click again to confirm.');
      } else {
        setError('One more click to continue...');
      }
      
      // 50% chance the link will try to "escape" the cursor
      if (Math.random() > 0.5) {
        const currentOrder = [...linkOrder];
        const realLinkIndex = currentOrder.findIndex(i => i === 19);
        
        // Swap with a random position
        const randomPos = Math.floor(Math.random() * currentOrder.length);
        if (randomPos !== realLinkIndex) {
          [currentOrder[realLinkIndex], currentOrder[randomPos]] = [currentOrder[randomPos], currentOrder[realLinkIndex]];
          
          setRealLinkMoving(true);
          setLinkOrder(currentOrder);
          setTimeout(() => {
            setRealLinkMoving(false);
          }, 300);
        }
      }
      
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Get auth token from cookie
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
      
      if (!tokenCookie) {
        router.push('/');
        return;
      }
      
      const token = tokenCookie.split('=')[1];
      
      // Submit completion to API
      const response = await fetch('/api/rounds/round1/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          linkId: clues[0]?.id,
          score: calculateScore(),
          attempts,
          timeSpent,
          hintUsed
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit completion. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting completion:', error);
      setError('Failed to submit your completion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleClueTextHover = () => {
    // Only show text when specifically requested
    setClueTextVisible(true);
  };
  
  const handleClueTextLeave = () => {
    setClueTextVisible(false);
  };
  
  const useHint = () => {
    setHintUsed(true);
  };
  
  // Calculate score based on attempts and time
  const calculateScore = () => {
    const baseScore = 300;
    const attemptPenalty = Math.min(attempts * 10, 150);
    const timePenalty = Math.min(Math.floor(timeSpent / 10) * 5, 100);
    const hintPenalty = hintUsed ? 50 : 0;
    
    const finalScore = Math.max(baseScore - attemptPenalty - timePenalty - hintPenalty, 50);
    return finalScore;
  };
  
  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Success view after completing the round
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <canvas 
          ref={confettiCanvasRef} 
          className="fixed inset-0 w-full h-full z-10 pointer-events-none"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-b from-green-500/20 to-green-600/20 border border-green-500 rounded-lg p-8 max-w-md text-center relative z-20"
        >
          <h1 className="text-3xl font-bold mb-4">Round 1 Completed! 🎉</h1>
          <p className="text-xl mb-6">Congratulations! You've found the hidden link and completed the first challenge.</p>
          
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-y-2 text-left">
              <div className="text-gray-300">Time:</div>
              <div className="text-right font-mono">{formatTime(timeSpent)}</div>
              
              <div className="text-gray-300">Attempts:</div>
              <div className="text-right font-mono">{attempts}</div>
              
              <div className="text-gray-300">Hint used:</div>
              <div className="text-right font-mono">{hintUsed ? 'Yes (-50 pts)' : 'No'}</div>
              
              <div className="border-t border-gray-600 col-span-2 my-2"></div>
              
              <div className="text-lg text-green-300">Score:</div>
              <div className="text-right font-mono text-lg text-green-300">{calculateScore()} pts</div>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center mx-auto"
          >
            Continue to Dashboard <FaArrowRight className="ml-2" />
          </button>
        </motion.div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading challenge...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen p-8 relative ${
      environmentEffects.fog ? 'backdrop-blur-sm' : ''
    } ${
      environmentEffects.invert ? 'invert' : ''
    } ${
      environmentEffects.mirror ? 'scale-x-[-1]' : ''
    } ${
      environmentEffects.shake ? 'animate-shake' : ''
    }`}>
      <div className="container mx-auto px-4 py-12">
        {/* Challenge Info Modal */}
        <AnimatePresence>
          {showChallengeInfo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/70"
            >
              <div className="bg-gray-800 border border-blue-500 rounded-lg p-6 max-w-xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Round 1: Hidden Link Hunt</h2>
                <p className="mb-4">
                  Welcome to your first challenge! In this round, you need to find the authentic link among many decoys.
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>One link is real, all others are decoys</li>
                  <li>The real link may try to hide or move when approached</li>
                  <li>Be observant - subtle differences reveal the true path</li>
                  <li>The challenge becomes harder as time passes</li>
                  <li>Fewer attempts mean higher scores</li>
                </ul>
                <p className="mb-4 text-yellow-300">
                  <FaQuestionCircle className="inline mr-2" />
                  Hint: Pay close attention to how links react to your cursor
                </p>
                <button
                  onClick={() => setShowChallengeInfo(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold mt-2"
                >
                  Begin Challenge
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Round 1: Hidden Link Hunt</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            One of these links is genuine and will lead you to the next round.
            The rest are decoys. Choose wisely!
          </p>
          
          <div className="mt-4 text-gray-400 text-sm flex justify-center space-x-4">
            <div>
              <FaClock className="inline mr-1" /> Time: {formatTime(timeSpent)}
            </div>
            <div>
              <FaSearch className="inline mr-1" /> Attempts: {attempts}
            </div>
          </div>
        </motion.div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6 max-w-xl mx-auto"
          >
            {error}
          </motion.div>
        )}
        
        {showHint && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 max-w-xl mx-auto mb-6"
          >
            <div className="flex items-start">
              <FaLightbulb className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                {!hintUsed ? (
                  <>
                    <p className="mb-2">Need a hint? Using it will reduce your score.</p>
                    <button
                      onClick={useHint}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Show Hint (-50 points)
                    </button>
                  </>
                ) : (
                  <p>
                    {clues[0]?.hint || 'The real link behaves differently when your cursor approaches it. Pay attention to subtle changes.'}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Pattern detection arrows */}
        {attempts > 5 && !patternHintShown && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handlePatternClick('top')}
                className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                ↑
              </button>
              <button
                onClick={() => handlePatternClick('right')}
                className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                →
              </button>
              <button
                onClick={() => handlePatternClick('bottom')}
                className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                ↓
              </button>
              <button
                onClick={() => handlePatternClick('left')}
                className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                ←
              </button>
            </div>
          </div>
        )}
        
        {/* Links with enhanced styling and behavior */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {linkOrder.map((index) => {
            const isRealLink = index === 19;
            const isClicked = clickedLinks.has(index);
            
            return (
              <motion.button
                key={index}
                className={`p-4 rounded-lg transition-all duration-300 ${
                  isClicked ? 'bg-red-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
                } ${
                  isRealLink && !timeWindow ? 'opacity-0' : ''
                }`}
                style={{
                  opacity: isRealLink ? linkOpacity : 1,
                  filter: `blur(${isRealLink ? pageBlurLevel : 0}px)`,
                  transform: isRealLink && realLinkMoving ? 'scale(0.8)' : 'scale(1)',
                }}
                onClick={() => isRealLink ? handleRealClick() : handleFakeClick(index)}
                animate={isRealLink && realLinkMoving ? {
                  x: [0, -10, 10, -5, 5, 0],
                  y: [0, -5, 5, -10, 10, 0],
                } : {}}
                transition={{ duration: 0.5 }}
                whileHover={!isClicked ? { scale: 1.05 } : {}}
              >
                <span className={`text-lg ${isClicked ? 'text-gray-400' : 'text-gray-800'}`}>
                  {isRealLink ? clues[0]?.content : fakeLinks[index]}
                </span>
              </motion.button>
            );
          })}
        </div>
        
        {/* Decoy text for additional distraction */}
        {decoyClicked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className="mt-8 text-center text-gray-500 text-sm max-w-2xl mx-auto"
          >
            <p>Analyzing your selection pattern...</p>
            <div className="h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: '0%' }}
                animate={{ width: '66%' }}
                transition={{ duration: 2 }}
              />
            </div>
            <p className="mt-2">The true path often lies where you least expect it. Continue searching.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 