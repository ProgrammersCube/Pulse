import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter, CoinbaseWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import axios from 'axios';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import { debounce } from 'lodash';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Constants
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const REFRESH_INTERVAL = parseInt(process.env.REACT_APP_REFRESH_INTERVAL || '300', 10) * 1000;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ================= SERVICES =================

// Wallet Service
const walletService = {
  fetchUserData: async (walletAddress) => {
    try {
      const response = await api.get(`/api/wallet/${walletAddress}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },

  updateUserTokens: async (walletAddress, tokens) => {
    try {
      const response = await api.put(`/api/wallet/${walletAddress}/tokens`, { tokens });
      return response.data.data;
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw error;
    }
  },

  applyReferralCode: async (walletAddress, referralCode) => {
    try {
      const response = await api.post(`/api/wallet/${walletAddress}/referral`, { referralCode });
      return response.data;
    } catch (error) {
      console.error('Error applying referral code:', error);
      throw error;
    }
  }
};

// Price Service
const priceService = {
  getBTCPrice: async () => {
    try {
      const response = await api.get('/api/price/current');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching BTC price:', error);
      throw error;
    }
  },

  getHistoricalPrices: async (timeframe = '1h') => {
    try {
      const response = await api.get('/api/price/historical', {
        params: {
          symbol: 'BTC',
          timeframe
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching historical prices:', error);
      throw error;
    }
  }
};

// ================= CONTEXT =================

// Create App Context
const AppContext = createContext({
  user: null,
  btcPrice: null,
  loading: false,
  error: null,
  refreshUserData: async () => {},
  updateTokens: async () => {}
});

const useAppContext = () => useContext(AppContext);

const AppContextProvider = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const [user, setUser] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const previousUser = useRef(null);

  // Function to refresh user data - using useCallback with debounce to avoid too frequent API calls
  const refreshUserData = useCallback(
    debounce(async () => {
      if (!connected || !publicKey) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const userData = await walletService.fetchUserData(publicKey.toString());
        setUser(userData);
        console.log('User data refreshed:', userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    }, 500), // 500ms debounce
    [connected, publicKey]
  );

  // Function to update token balances
  const updateTokens = useCallback(async (tokens) => {
    if (!connected || !publicKey || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await walletService.updateUserTokens(publicKey.toString(), tokens);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating tokens:', error);
      setError('Failed to update token balances');
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, user]);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(SOCKET_URL);
    
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Subscribe to BTC price updates
  useEffect(() => {
    if (!socket) return;
    
    socket.emit('subscribe:btc-price');
    
    socket.on('price:btc', (data) => {
      setBtcPrice({
        price: data.price,
        timestamp: data.timestamp
      });
    });
    
    return () => {
      socket.emit('unsubscribe:btc-price');
      socket.off('price:btc');
    };
  }, [socket]);

  // Fetch initial BTC price
  useEffect(() => {
    const fetchInitialPrice = async () => {
      try {
        const priceData = await priceService.getBTCPrice();
        setBtcPrice({
          price: priceData.price,
          timestamp: priceData.timestamp
        });
      } catch (error) {
        console.error('Error fetching BTC price:', error);
        setError('Failed to load BTC price data');
      }
    };
    
    fetchInitialPrice();
    
    const interval = setInterval(fetchInitialPrice, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  // FIXED: Fetch user data when wallet is connected - removed 'user' from dependencies to avoid infinite loop
  useEffect(() => {
    if (connected && publicKey) {
      refreshUserData();
      
      if (socket) {
        socket.emit('wallet:connect', { address: publicKey.toString() });
      }
    } else {
      setUser(null);
      
      if (socket && previousUser.current) {
        socket.emit('wallet:disconnect', { address: previousUser.current.walletAddress });
      }
    }
    
    // Update previous user ref after state changes are processed
    previousUser.current = user;
  }, [connected, publicKey, socket, refreshUserData]); // Removed 'user' from dependencies

  const value = {
    user,
    btcPrice,
    loading,
    error,
    refreshUserData,
    updateTokens
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// ================= COMPONENTS =================

// Token Badge Component
const TokenBadge = ({ symbol, amount, iconColor }) => {
  return (
    <div className="token-badge" style={{ 
      backgroundColor: 'rgba(0,0,0,0.4)', 
      border: `1px solid var(--neon-${iconColor || 'blue'})`,
      borderRadius: '15px',
      padding: '4px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: `0 0 8px rgba(var(--${iconColor || 'blue'}-rgb), 0.4)`,
      margin: '0 4px'
    }}>
      <span className="token-icon" style={{ 
        width: '18px', 
        height: '18px', 
        borderRadius: '50%', 
        backgroundColor: `rgba(var(--${iconColor || 'blue'}-rgb), 0.2)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: `var(--neon-${iconColor || 'blue'})`,
        textShadow: `0 0 3px rgba(var(--${iconColor || 'blue'}-rgb), 0.7)`
      }}>
        {symbol.charAt(0)}
      </span>
      <span style={{ 
        fontSize: '0.85rem', 
        fontWeight: '600',
        color: `var(--neon-${iconColor || 'blue'})`,
        textShadow: `0 0 3px rgba(var(--${iconColor || 'blue'}-rgb), 0.5)`
      }}>
        {parseFloat(amount).toFixed(2)}
      </span>
    </div>
  );
};

// Header Component
const Header = () => {
  const { publicKey, connected } = useWallet();
  const { user, btcPrice } = useAppContext();
  const [tokensVisible, setTokensVisible] = useState(false);
  
  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/">
          <h1 className="neon-text pulse-animation" style={{ 
            fontSize: '2.2rem',
            margin: 0,
            letterSpacing: '3px'
          }}>PULSE</h1>
        </Link>
      </div>
      
      <div className="btc-price-container" style={{
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '10px',
        padding: '8px 15px',
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(255, 62, 62, 0.1)',
        border: '1px solid rgba(255, 62, 62, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {btcPrice ? (
          <>
            <div style={{ fontSize: '0.8rem', marginBottom: '2px', opacity: 0.8 }}>BTC/USD</div>
            <div className="price-text btc-price" style={{ 
              fontSize: '1.3rem', 
              fontWeight: 'bold' 
            }}>
              ${btcPrice.price.toLocaleString(undefined, { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </>
        ) : (
          <div className="loading-price">Loading price...</div>
        )}
      </div>
      
      <div className="wallet-container">
        {connected && publicKey ? (
          <div className="connected-wallet">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px' 
            }}>
              <Link to="/wallet" className="wallet-link">
                <div className="wallet-display" style={{
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  border: '1px solid var(--neon-blue)',
                  boxShadow: '0 0 10px rgba(0, 242, 255, 0.3), inset 0 0 8px rgba(0, 242, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}>
                  <span style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(0, 242, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neon-blue)' }}>
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <path d="M12 12h.01" />
                    </svg>
                  </span>
                  <span className="wallet-address" style={{
                    fontSize: '0.9rem',
                    color: 'var(--neon-blue)',
                    textShadow: '0 0 3px rgba(0, 242, 255, 0.5)'
                  }}>
                    {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                  </span>
                </div>
              </Link>
              
              {user && user.tokens && (
                <div style={{ position: 'relative' }}>
                  <button 
                    className="token-toggle-button" 
                    onClick={() => setTokensVisible(!tokensVisible)}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      border: '1px solid var(--neon-cyan)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 0 10px rgba(0, 255, 187, 0.3), inset 0 0 8px rgba(0, 255, 187, 0.1)',
                      position: 'relative'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neon-cyan)' }}>
                      <circle cx="12" cy="12" r="8" />
                      <line x1="12" y1="16" x2="12" y2="16" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      backgroundColor: 'var(--neon-cyan)',
                      color: 'black',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      boxShadow: '0 0 5px rgba(0, 255, 187, 0.7)'
                    }}>
                      4
                    </div>
                  </button>
                  
                  {tokensVisible && (
                    <div className="token-dropdown" style={{
                      position: 'absolute',
                      top: '40px',
                      right: '0',
                      backgroundColor: 'rgba(12, 23, 42, 0.95)',
                      borderRadius: '10px',
                      padding: '10px',
                      boxShadow: '0 0 15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 255, 187, 0.3)',
                      border: '1px solid var(--neon-cyan)',
                      zIndex: 100,
                      backdropFilter: 'blur(5px)',
                      width: '200px',
                      animation: 'fadeIn 0.2s ease-out'
                    }}>
                      <div style={{ textAlign: 'center', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--neon-cyan)', textShadow: '0 0 5px rgba(0, 255, 187, 0.5)' }}>
                        Your Balance
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className="token-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: 'rgba(0, 255, 187, 0.05)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0, 255, 187, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '0.8rem', textShadow: '0 0 3px rgba(0, 255, 187, 0.5)' }}>B</span>
                            <span style={{ fontSize: '0.9rem' }}>BeTyche</span>
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--neon-cyan)' }}>{user.tokens.BeTyche.toFixed(2)}</span>
                        </div>
                        <div className="token-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: 'rgba(0, 242, 255, 0.05)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0, 242, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-blue)', fontWeight: 'bold', fontSize: '0.8rem', textShadow: '0 0 3px rgba(0, 242, 255, 0.5)' }}>S</span>
                            <span style={{ fontSize: '0.9rem' }}>SOL</span>
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--neon-blue)' }}>{user.tokens.SOL.toFixed(2)}</span>
                        </div>
                        <div className="token-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: 'rgba(180, 0, 255, 0.05)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(180, 0, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-purple)', fontWeight: 'bold', fontSize: '0.8rem', textShadow: '0 0 3px rgba(180, 0, 255, 0.5)' }}>E</span>
                            <span style={{ fontSize: '0.9rem' }}>ETH</span>
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--neon-purple)' }}>{user.tokens.ETH.toFixed(2)}</span>
                        </div>
                        <div className="token-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: 'rgba(255, 0, 212, 0.05)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(255, 0, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-pink)', fontWeight: 'bold', fontSize: '0.8rem', textShadow: '0 0 3px rgba(255, 0, 212, 0.5)' }}>R</span>
                            <span style={{ fontSize: '0.9rem' }}>RADBRO</span>
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--neon-pink)' }}>{user.tokens.RADBRO.toFixed(2)}</span>
                        </div>
                      </div>
                      <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <Link to="/wallet" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-block', padding: '4px 10px', borderRadius: '4px', transition: 'all 0.3s ease' }}>
                          View Wallet Details
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <WalletMultiButton className="neon-button" style={{ fontSize: '0.9rem', padding: '8px 14px' }} />
        )}
      </div>
    </header>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="footer">
      <div>
        <p style={{ marginBottom: '8px' }}>© 2025 Pulse - Crypto Micro Prediction Game. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
          <a href="#" className="footer-link" style={{ color: 'var(--neon-blue)', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.3s ease' }}>Terms of Service</a>
          <a href="#" className="footer-link" style={{ color: 'var(--neon-pink)', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.3s ease' }}>Privacy Policy</a>
          <a href="#" className="footer-link" style={{ color: 'var(--neon-purple)', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.3s ease' }}>FAQ</a>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <a href="#" style={{ color: 'var(--text-secondary)', transition: 'all 0.3s ease' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
          </a>
          <a href="#" style={{ color: 'var(--text-secondary)', transition: 'all 0.3s ease' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a href="#" style={{ color: 'var(--text-secondary)', transition: 'all 0.3s ease' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="#" style={{ color: 'var(--text-secondary)', transition: 'all 0.3s ease' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

// Splash Screen Component
const SplashScreen = () => {
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
      background: 'radial-gradient(circle at center, rgba(14, 30, 64, 0.9) 0%, rgba(2, 8, 23, 1) 100%)',
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
          fontSize: '6rem', 
          marginBottom: '2rem',
          fontFamily: 'Orbitron, sans-serif',
          letterSpacing: '8px'
        }}>
          PULSE
        </h1>
      </motion.div>
      
      <motion.div 
        className="neon-border"
        style={{
          width: '300px',
          height: '8px',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          backgroundColor: 'rgba(0, 242, 255, 0.1)'
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--neon-blue) 0%, var(--neon-cyan) 100%)',
            boxShadow: 'var(--neon-glow)'
          }}
        />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="neon-text-purple"
        style={{ 
          fontSize: '1.2rem',
          letterSpacing: '3px'
        }}
      >
        CRYPTO MICRO PREDICTION GAME
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
          lineHeight: '1.4',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          DISCLAIMER: This platform involves financial risk. Digital assets are volatile.
          Only wager what you can afford to lose. Not available in all jurisdictions.
        </p>
      </motion.div>
    </div>
  );
};

// ================= SCREENS =================

// Home Screen Component
const HomeScreen = () => {
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
            <div className="btc-price-container" style={{ 
              margin: '30px 0',
              padding: '20px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              boxShadow: 'inset 0 0 20px rgba(255, 62, 62, 0.1)',
              border: '1px solid rgba(255, 62, 62, 0.2)'
            }}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>LIVE BTC PRICE</h2>
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

// Wallet Screen Component
const WalletScreen = () => {
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
      await walletService.applyReferralCode(publicKey.toString(), referralCode);
      setMessage({ 
        text: 'Referral code applied successfully!', 
        type: 'success' 
      });
      await refreshUserData();
      setReferralCode('');
    } catch (error) {
      console.error('Error applying referral code:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to apply referral code', 
        type: 'error' 
      });
    }
  };
  
  // Redirect if wallet not connected
  useEffect(() => {
    if (!connected || !publicKey) {
      navigate('/');
    }
  }, [connected, publicKey, navigate]);
  
  if (!connected || !publicKey) {
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
                <div className="token-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '15px',
                  marginTop: '15px'
                }}>
                  {user && user.tokens && (
                    <>
                      <div className="token-balance-card" style={{ 
                        padding: '15px', 
                        backgroundColor: 'rgba(0, 255, 187, 0.05)',
                        borderRadius: '10px',
                        border: '1px solid var(--neon-cyan)',
                        boxShadow: '0 0 10px rgba(0, 255, 187, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          backgroundColor: 'rgba(0, 255, 187, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: 'bold',
                            color: 'var(--neon-cyan)',
                            textShadow: '0 0 5px rgba(0, 255, 187, 0.7)'
                          }}>B</span>
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>BeTyche</div>
                        <div style={{ 
                          fontSize: '1.4rem', 
                          fontWeight: 'bold',
                          color: 'var(--neon-cyan)',
                          textShadow: '0 0 5px rgba(0, 255, 187, 0.7)',
                          marginTop: '5px'
                        }}>{user.tokens.BeTyche.toFixed(2)}</div>
                      </div>
                      
                      <div className="token-balance-card" style={{ 
                        padding: '15px', 
                        backgroundColor: 'rgba(0, 242, 255, 0.05)',
                        borderRadius: '10px',
                        border: '1px solid var(--neon-blue)',
                        boxShadow: '0 0 10px rgba(0, 242, 255, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          backgroundColor: 'rgba(0, 242, 255, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: 'bold',
                            color: 'var(--neon-blue)',
                            textShadow: '0 0 5px rgba(0, 242, 255, 0.7)'
                          }}>S</span>
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>SOL</div>
                        <div style={{ 
                          fontSize: '1.4rem', 
                          fontWeight: 'bold',
                          color: 'var(--neon-blue)',
                          textShadow: '0 0 5px rgba(0, 242, 255, 0.7)',
                          marginTop: '5px'
                        }}>{user.tokens.SOL.toFixed(2)}</div>
                      </div>
                      
                      <div className="token-balance-card" style={{ 
                        padding: '15px', 
                        backgroundColor: 'rgba(180, 0, 255, 0.05)',
                        borderRadius: '10px',
                        border: '1px solid var(--neon-purple)',
                        boxShadow: '0 0 10px rgba(180, 0, 255, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          backgroundColor: 'rgba(180, 0, 255, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: 'bold',
                            color: 'var(--neon-purple)',
                            textShadow: '0 0 5px rgba(180, 0, 255, 0.7)'
                          }}>E</span>
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>ETH</div>
                        <div style={{ 
                          fontSize: '1.4rem', 
                          fontWeight: 'bold',
                          color: 'var(--neon-purple)',
                          textShadow: '0 0 5px rgba(180, 0, 255, 0.7)',
                          marginTop: '5px'
                        }}>{user.tokens.ETH.toFixed(2)}</div>
                      </div>
                      
                      <div className="token-balance-card" style={{ 
                        padding: '15px', 
                        backgroundColor: 'rgba(255, 0, 212, 0.05)',
                        borderRadius: '10px',
                        border: '1px solid var(--neon-pink)',
                        boxShadow: '0 0 10px rgba(255, 0, 212, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          backgroundColor: 'rgba(255, 0, 212, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: 'bold',
                            color: 'var(--neon-pink)',
                            textShadow: '0 0 5px rgba(255, 0, 212, 0.7)'
                          }}>R</span>
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>RADBRO</div>
                        <div style={{ 
                          fontSize: '1.4rem', 
                          fontWeight: 'bold',
                          color: 'var(--neon-pink)',
                          textShadow: '0 0 5px rgba(255, 0, 212, 0.7)',
                          marginTop: '5px'
                        }}>{user.tokens.RADBRO.toFixed(2)}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {user && user.referralCode && (
                <div style={{ marginBottom: '25px', marginTop: '25px' }}>
                  <h4>Your Referral Code:</h4>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '15px',
                    padding: '20px',
                    backgroundColor: 'rgba(0,255,212,0.1)',
                    border: '2px solid var(--neon-cyan)',
                    borderRadius: '10px',
                    boxShadow: '0 0 15px rgba(0, 255, 187, 0.3), inset 0 0 15px rgba(0, 255, 187, 0.1)',
                    margin: '15px 0'
                  }}>
                    <span style={{ 
                      fontSize: '2rem', 
                      fontWeight: 'bold',
                      letterSpacing: '4px',
                      color: 'var(--neon-cyan)',
                      textShadow: '0 0 10px rgba(0, 255, 187, 0.7)',
                      fontFamily: 'Orbitron, sans-serif'
                    }}>
                      {user.referralCode}
                    </span>
                    <button 
                      className="neon-button neon-button-cyan"
                      onClick={() => {
                        navigator.clipboard.writeText(user.referralCode);
                        setMessage({ text: 'Copied to clipboard!', type: 'success' });
                        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
                      }}
                      style={{ padding: '8px 15px', fontSize: '0.9rem' }}
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
                    marginTop: '15px'
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
                      marginTop: '15px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: message.type === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                      border: `1px solid ${message.type === 'success' ? '#00ff00' : '#ff0000'}`,
                      color: message.type === 'success' ? '#00ff00' : '#ff0000',
                      textShadow: message.type === 'success' ? '0 0 5px rgba(0, 255, 0, 0.5)' : '0 0 5px rgba(255, 0, 0, 0.5)'
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

// ================= WALLET CONFIGURATION =================
// Solana wallet configuration
const WalletConfig = ({ children }) => {
  // Configure Solana connection
  const network = WalletAdapterNetwork.Devnet; // Or Mainnet depending on your needs
  const endpoint = clusterApiUrl(network);
  
  // Configure wallet adapters
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter()
  ];
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// ================= MAIN APP =================

// Main App Component
function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading of app resources
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return <SplashScreen />;
  }
  
  return (
    <WalletConfig>
      <AppContextProvider>
        <div className="app-container">
          <Header />
          <main className="main-container">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/wallet" element={<WalletScreen />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AppContextProvider>
    </WalletConfig>
  );
}

export default App;