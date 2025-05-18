import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { applyReferralCode } from '../services/wallet.service';

const WalletScreen: React.FC = () => {
  const { publicKey, connected, disconnect } = useWallet();
  const { user, refreshUserData, loading } = useAppContext();
  const [referralCode, setReferralCode] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  
  // Handle disconnect and redirect
  const handleDisconnect = async () => {
    await disconnect?.();
    navigate('/');
  };
  
  // Handle referral code submission
  const handleApplyReferral = async () => {
    if (!connected || !publicKey || !referralCode) return;
    
    try {
      await applyReferralCode(publicKey.toString(), referralCode);
      setMessage({ 
        text: 'Referral code applied successfully!', 
        type: 'success' 
      });
      await refreshUserData();
      setReferralCode('');
    } catch (error: any) {
      console.error('Error applying referral code:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to apply referral code', 
        type: 'error' 
      });
    }
  };
  
  if (!connected || !publicKey) {
    navigate('/');
    return null;
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="wallet-screen"
    >
      <div className="neon-card">
        <h2 className="neon-text">WALLET DETAILS</h2>
        
        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <>
            <div className="wallet-info" style={{ margin: '20px 0' }}>
              <div style={{ marginBottom: '15px' }}>
                <h4>Address:</h4>
                <p style={{ 
                  wordBreak: 'break-all', 
                  padding: '10px', 
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: '5px'
                }}>
                  {publicKey.toString()}
                </p>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <h4>Token Balances:</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '10px',
                  marginTop: '10px'
                }}>
                  {user && (
                    <>
                      <div className="token-balance" style={{ padding: '12px' }}>
                        <span className="token-icon">B</span>
                        <span>BeTyche: {user.tokens.BeTyche.toFixed(2)}</span>
                      </div>
                      
                      <div className="token-balance" style={{ padding: '12px' }}>
                        <span className="token-icon">S</span>
                        <span>SOL: {user.tokens.SOL.toFixed(2)}</span>
                      </div>
                      
                      <div className="token-balance" style={{ padding: '12px' }}>
                        <span className="token-icon">E</span>
                        <span>ETH: {user.tokens.ETH.toFixed(2)}</span>
                      </div>
                      
                      <div className="token-balance" style={{ padding: '12px' }}>
                        <span className="token-icon">R</span>
                        <span>RADBRO: {user.tokens.RADBRO.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {user && user.referralCode && (
                <div style={{ marginBottom: '15px' }}>
                  <h4>Your Referral Code:</h4>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '15px',
                    padding: '15px',
                    backgroundColor: 'rgba(0,255,212,0.1)',
                    border: '2px solid var(--neon-cyan)',
                    borderRadius: '5px',
                    boxShadow: '0 0 10px rgba(0, 255, 187, 0.4)',
                    margin: '10px 0'
                  }}>
                    <span style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      letterSpacing: '2px',
                      color: 'var(--neon-cyan)',
                      textShadow: '0 0 5px rgba(0, 255, 187, 0.7)'
                    }}>
                      {user.referralCode}
                    </span>
                    <button 
                      className="neon-button"
                      onClick={() => {
                        navigator.clipboard.writeText(user.referralCode);
                        setMessage({ text: 'Copied to clipboard!', type: 'success' });
                        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
                      }}
                      style={{ padding: '5px 12px', fontSize: '0.9rem' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
              
              {(!user?.referredBy) && (
                <div style={{ marginTop: '25px' }}>
                  <h4>Apply Referral Code:</h4>
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px',
                    marginTop: '10px'
                  }}>
                    <input 
                      type="text" 
                      className="neon-input"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Enter referral code"
                      style={{ flex: 1 }}
                    />
                    <button 
                      className="neon-button neon-button-purple" 
                      onClick={handleApplyReferral}
                      disabled={!referralCode}
                    >
                      Apply
                    </button>
                  </div>
                  
                  {message.text && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      borderRadius: '5px',
                      backgroundColor: message.type === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                      border: `1px solid ${message.type === 'success' ? '#00ff00' : '#ff0000'}`,
                      color: message.type === 'success' ? '#00ff00' : '#ff0000'
                    }}>
                      {message.text}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <button 
                className="neon-button neon-button-pink" 
                onClick={handleDisconnect}
              >
                Disconnect Wallet
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default WalletScreen;
