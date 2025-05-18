import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const HomeScreen: React.FC = () => {
  const { connected } = useWallet();
  const { btcPrice } = useAppContext();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };
  
  return (
    <motion.div 
      className="home-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div className="hero-section" variants={itemVariants}>
        <div className="neon-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h1 className="neon-text">PREDICT. WIN. REPEAT.</h1>
          <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
            Pulse is a crypto-based, mobile-first platform that allows you to
            wager tokens on real-time, short-duration Bitcoin price movements.
          </p>
          
          {btcPrice && (
            <div className="btc-price-container" style={{ margin: '30px 0' }}>
              <h2>LIVE BTC PRICE</h2>
              <div className="price-text btc-price-large">
                ${btcPrice.price.toLocaleString(undefined, { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
          )}
          
          <div className="action-buttons" style={{ marginTop: '30px' }}>
            {connected ? (
              <button className="neon-button neon-button-pink" style={{ fontSize: '1.2rem', padding: '12px 30px' }}>
                PLAY NOW
              </button>
            ) : (
              <WalletMultiButton className="neon-button" style={{ fontSize: '1.2rem', padding: '12px 30px' }} />
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Features Section */}
      <motion.div className="features-section" variants={itemVariants} style={{ marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="neon-card neon-card-purple">
            <h3 className="neon-text-purple">REAL-TIME PREDICTIONS</h3>
            <p>
              Make lightning-fast predictions on BTC price movements
              in as little as 5 seconds.
            </p>
          </div>
          
          <div className="neon-card neon-card-pink">
            <h3 className="neon-text-pink">MULTIPLE TOKENS</h3>
            <p>
              Stake with BeTyche, SOL, ETH, or RADBRO tokens
              and compete against other players.
            </p>
          </div>
          
          <div className="neon-card">
            <h3 className="neon-text">REFER & EARN</h3>
            <p>
              Invite friends to join and earn rewards when they play,
              with our robust referral system.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* How It Works Section */}
      <motion.div className="how-it-works" variants={itemVariants} style={{ marginTop: '40px' }}>
        <div className="neon-card">
          <h2 className="neon-text" style={{ textAlign: 'center', marginBottom: '30px' }}>HOW IT WORKS</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="neon-border" style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span className="neon-text">1</span>
              </div>
              <div>
                <h4>Connect Your Wallet</h4>
                <p>Link your Solana-compatible wallet to get started.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="neon-border neon-border-purple" style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span className="neon-text-purple">2</span>
              </div>
              <div>
                <h4>Choose Your Prediction</h4>
                <p>Select "UP" or "DOWN" for BTC's price movement.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="neon-border neon-border-pink" style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span className="neon-text-pink">3</span>
              </div>
              <div>
                <h4>Set Timer & Stake</h4>
                <p>Choose prediction duration (5-60s) and stake amount.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="neon-border" style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span className="neon-text">4</span>
              </div>
              <div>
                <h4>Collect Winnings</h4>
                <p>If your prediction is correct, winnings are instantly credited to your wallet.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HomeScreen;
