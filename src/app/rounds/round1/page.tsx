'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
import { FaArrowRight, FaLightbulb, FaSearch, FaEye, FaQuestionCircle, FaClock } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import styles from './Round1.module.css';
import { getTeamInfo } from '@/lib/teamUtils';
import Link from 'next/link';

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
  const [links, setLinks] = useState<Array<{ id: string; text: string; isReal: boolean }>>([]);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentHoverLink, setCurrentHoverLink] = useState<string | null>(null);
  const roundRef = useRef<HTMLDivElement>(null);
  const [isFinding, setIsFinding] = useState(false);
  const [confirmNeeded, setConfirmNeeded] = useState(false);
  const [linkClicked, setLinkClicked] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Pattern detection (removed - simplified)
  const [pattern, setPattern] = useState<string[]>([]);
  
  // Timer logic
  useEffect(() => {
    setStartTime(new Date());
  }, []);
  
  // Generate links
  useEffect(() => {
    const fakeLinks = [
      'View Next Task',
      'Continue Game',
      'Next Stage',
      'Proceed to Round 2',
      'Begin Next Challenge',
      'Go to Round 2',
      'Start Round 2',
      'Advance to Next Level',
      'Move Forward',
      'Continue to Next Page'
    ];
    
    // Create an array of links with unique IDs
    const linkObjects = fakeLinks.map((text) => ({
      id: Math.random().toString(36).substring(2, 15),
      text,
      isReal: false
    }));
    
    // Add the real link - make it obvious by styling it differently
    const realLink = {
      id: 'real-link-' + Math.random().toString(36).substring(2, 8),
      text: '✨ NEXT ROUND ✨',
      isReal: true
    };
    
    // Insert the real link at a random position
    const position = Math.floor(Math.random() * (linkObjects.length + 1));
    linkObjects.splice(position, 0, realLink);
    
    setLinks(linkObjects);
  }, []);
  
  // Handle mouse movement for real link visibility
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!roundRef.current) return;
    
    const rect = roundRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  };
  
  // Calculate visibility based on mouse position (simplified - real link is always visible)
  const getLinkVisibility = (link: { id: string; isReal: boolean }) => {
    return link.isReal ? 1 : 1; // Both real and fake links fully visible
  };
  
  // Handle link click
  const handleLinkClick = (link: { id: string; text: string; isReal: boolean }) => {
    if (loading) return;
    
    setAttempts(attempts + 1);
    
    if (link.isReal) {
      if (confirmNeeded) {
        submitRound();
      } else {
        setConfirmNeeded(true);
        setLinkClicked(link.id);
        setTimeout(() => {
          setConfirmNeeded(false);
          setLinkClicked(null);
        }, 2000);
      }
    } else {
      setErrorMessage("That's not the right link. Try looking for the link that says 'NEXT ROUND'.");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };
  
  // Submit round completion
  const submitRound = async () => {
    if (!startTime) return;
    
    setLoading(true);
    
    try {
      // Calculate time spent in seconds
      const endTime = new Date();
      const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      
      // Get team info
      const team = getTeamInfo();
      
      if (!team || !team.token) {
        // Handle no team info - redirect to login
        router.push('/');
        return;
      }
      
      // Calculate score based on attempts and time
      let score = 100;
      score -= Math.min(50, (attempts - 1) * 5); // -5 points per attempt after the first
      score -= Math.min(30, Math.floor(timeSpent / 10)); // -1 point per 10 seconds
      if (hintUsed) score -= 10; // -10 points if hint was used
      
      score = Math.max(10, score); // Minimum score is 10
      
      // Submit completion to API
      const response = await fetch('/api/rounds/round1/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${team.token}`
        },
        body: JSON.stringify({
          score,
          attempts,
          timeSpent,
          hintUsed
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowSuccessMessage(true);
        // Redirect to dashboard after showing success message
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setErrorMessage(data.error || 'Failed to submit round completion');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error submitting round:', error);
      setErrorMessage('An error occurred. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.container} ref={roundRef} onMouseMove={handleMouseMove}>
      <h1 className={styles.title}>Round 1: Find the Hidden Link</h1>
      
      <div className={styles.instructionsWrapper}>
        <div className={styles.instructions}>
          <p>In this round, you need to find and click on the correct link to advance to the next round.</p>
          <p>Look carefully! The real link is clearly marked as "NEXT ROUND" with special formatting.</p>
          {!hintUsed && (
            <button 
              className={styles.hintButton} 
              onClick={() => { setHintUsed(true); setShowHint(true); }}
            >
              Use Hint (-10 points)
            </button>
          )}
          {showHint && (
            <div className={styles.hint}>
              <p>Hint: The real link has special formatting - it's clearly marked with "NEXT ROUND" and sparkle emojis (✨).</p>
            </div>
          )}
        </div>
      </div>
      
      {errorMessage && (
        <div className={styles.errorMessage}>
          {errorMessage}
        </div>
      )}
      
      {confirmNeeded && (
        <div className={styles.confirmMessage}>
          Click again to confirm and complete Round 1!
        </div>
      )}
      
      {showSuccessMessage && (
        <div className={styles.successMessage}>
          Congratulations! You've completed Round 1!
          Redirecting to dashboard...
        </div>
      )}
      
      <div className={styles.linksContainer}>
        {links.map((link) => (
          <div 
            key={link.id}
            className={`${styles.linkWrapper} ${link.isReal ? styles.realLink : ''} ${linkClicked === link.id ? styles.clicked : ''}`}
            style={{ 
              opacity: getLinkVisibility(link),
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={() => setCurrentHoverLink(link.id)}
            onMouseLeave={() => setCurrentHoverLink(null)}
            onClick={() => handleLinkClick(link)}
          >
            <span className={link.isReal ? styles.realLinkText : ''}>
              {link.text}
            </span>
          </div>
        ))}
      </div>
      
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>Completing Round 1...</p>
        </div>
      )}
    </div>
  );
} 