import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 5;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="splash-screen" style={{
      background: 'var(--bg-color)',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="neon-text flicker-animation" style={{ 
          fontSize: '5rem', 
          marginBottom: '2rem',
          fontFamily: 'Orbitron, sans-serif'
        }}>
          PULSE
        </h1>
      </motion.div>
      
      <motion.div 
        className="neon-border"
        style={{
          width: '300px',
          height: '10px',
          borderRadius: '5px',
          overflow: 'hidden',
          marginBottom: '1.5rem'
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          style={{
            height: '100%',
            backgroundColor: 'var(--neon-blue)',
            boxShadow: 'var(--neon-glow)'
          }}
        />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="neon-text-purple"
        style={{ fontSize: '1.1rem' }}
      >
        Crypto Micro Prediction Game
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        style={{ marginTop: '3rem', maxWidth: '80%', textAlign: 'center' }}
      >
        <p style={{ 
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          lineHeight: '1.4'
        }}>
          DISCLAIMER: This platform involves financial risk. Digital assets are volatile.
          Only wager what you can afford to lose. Not available in all jurisdictions.
        </p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
