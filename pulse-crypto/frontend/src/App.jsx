import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter, CoinbaseWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import { debounce } from 'lodash';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Constants
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

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
  },

  // Price locking functionality
  lockPrice: async (symbol, userId, betId) => {
    try {
      const response = await api.post('/api/price/lock', {
        symbol,
        userId,
        betId
      });
      return response.data.data;
    } catch (error) {
      console.error('Error locking price:', error);
      throw error;
    }
  },

  getLockedPrice: async (betId) => {
    try {
      const response = await api.get(`/api/price/lock/${betId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting locked price:', error);
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
  updateTokens: async () => {},
  lockPrice: async () => {},
  getLockedPrice: async () => {}
});

const useAppContext = () => useContext(AppContext);

const AppContextProvider = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const [user, setUser] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const previousUser = useRef(null);
  const priceUpdateRef = useRef(null);

  // Function to refresh user data
  const refreshUserData = useCallback(async () => {
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
      // Retry after 2 seconds
      setTimeout(() => refreshUserData(), 2000);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey]);

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

  // Price locking functions
  const lockPrice = useCallback(async (symbol, betId) => {
    if (!connected || !publicKey) return null;
    
    try {
      const lockedPrice = await priceService.lockPrice(
        symbol, 
        publicKey.toString(), 
        betId
      );
      return lockedPrice;
    } catch (error) {
      console.error('Error locking price:', error);
      throw error;
    }
  }, [connected, publicKey]);

  const getLockedPrice = useCallback(async (betId) => {
    try {
      const lockedPrice = await priceService.getLockedPrice(betId);
      return lockedPrice;
    } catch (error) {
      console.error('Error getting locked price:', error);
      throw error;
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionDelay: 100,
      reconnectionAttempts: Infinity
    });
    
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

  // Subscribe to real-time BTC price updates
  useEffect(() => {
    if (!socket) return;
    
    socket.emit('subscribe:btc-price');
    
    socket.on('price:btc', (data) => {
      const newPrice = {
        price: data.price,
        timestamp: data.timestamp
      };
      
      // Update price immediately without delay
      setBtcPrice(newPrice);
      
      // Update price ref for smoother updates
      priceUpdateRef.current = newPrice;
      
      // Keep price history for chart (last 100 points)
      setPriceHistory(prev => {
        const newHistory = [...prev, newPrice];
        return newHistory.slice(-100);
      });
    });
    
    return () => {
      socket.emit('unsubscribe:btc-price');
      socket.off('price:btc');
    };
  }, [socket]);

  // Fetch initial BTC price and start aggressive polling
  useEffect(() => {
    const fetchInitialPrice = async () => {
      try {
        const priceData = await priceService.getBTCPrice();
        const newPrice = {
          price: priceData.price,
          timestamp: priceData.timestamp
        };
        setBtcPrice(newPrice);
        priceUpdateRef.current = newPrice;
      } catch (error) {
        console.error('Error fetching BTC price:', error);
        setError('Failed to load BTC price data');
      }
    };
    
    fetchInitialPrice();
    
    // Aggressive polling every 250ms for real-time updates
    const interval = setInterval(fetchInitialPrice, 250);
    
    return () => clearInterval(interval);
  }, []);

  // Handle wallet connection
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
    
    previousUser.current = user;
  }, [connected, publicKey, socket, refreshUserData]);

  const value = {
    user,
    btcPrice,
    priceHistory,
    loading,
    error,
    refreshUserData,
    updateTokens,
    lockPrice,
    getLockedPrice
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// ================= COMPONENTS =================

// Price Lock Demo Component
const PriceLockDemo = () => {
  const { connected, publicKey } = useWallet();
  const { btcPrice, lockPrice, getLockedPrice } = useAppContext();
  const [lockedPrice, setLockedPrice] = useState(null);
  const [betId, setBetId] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleLockPrice = async () => {
    if (!connected || !publicKey || !btcPrice) return;
    
    const newBetId = `demo_${Date.now()}`;
    setBetId(newBetId);
    
    try {
      const locked = await lockPrice('BTC', newBetId);
      setLockedPrice(locked);
      setIsLocked(true);
      setTimeLeft(10); // 10 second demo
      
      console.log('Price locked:', locked);
    } catch (error) {
      console.error('Error locking price:', error);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && isLocked) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isLocked) {
      setIsLocked(false);
    }
  }, [timeLeft, isLocked]);

  const handleCheckLockedPrice = async () => {
    if (!betId) return;
    
    try {
      const locked = await getLockedPrice(betId);
      console.log('Retrieved locked price:', locked);
      alert(`Locked Price: $${locked?.price || 'Not found'}`);
    } catch (error) {
      console.error('Error getting locked price:', error);
    }
  };

  const reset = () => {
    setLockedPrice(null);
    setBetId(null);
    setIsLocked(false);
    setTimeLeft(0);
  };

  if (!connected) {
    return (
      <div className="neon-card" style={{ textAlign: 'center', padding: '30px' }}>
        <h3 className="neon-text">🔒 PRICE LOCK DEMO</h3>
        <p style={{ marginBottom: '20px', opacity: 0.8 }}>
          Connect your wallet to test the price locking mechanism
        </p>
        <WalletMultiButton className="neon-button" />
      </div>
    );
  }

  return (
    <motion.div 
      className="neon-card" 
      style={{ padding: '30px' }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="neon-text" style={{ textAlign: 'center', marginBottom: '25px' }}>
        🔒 PRICE LOCK DEMO
      </h3>
      
      {btcPrice && (
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Current BTC Price:</div>
          <motion.div 
            className="price-text" 
            style={{ fontSize: '2rem', fontWeight: 'bold' }}
            key={btcPrice.timestamp}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.2 }}
          >
            ${btcPrice.price.toFixed(2)}
          </motion.div>
        </div>
      )}

      {!isLocked && !lockedPrice && (
        <div style={{ textAlign: 'center' }}>
          <motion.button 
            className="neon-button neon-button-cyan" 
            onClick={handleLockPrice}
            style={{ fontSize: '1.1rem', padding: '12px 30px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            LOCK CURRENT PRICE
          </motion.button>
          <p style={{ marginTop: '15px', fontSize: '0.9rem', opacity: 0.7 }}>
            Click to capture and lock the current BTC price
          </p>
        </div>
      )}

      {isLocked && lockedPrice && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ 
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(0, 255, 187, 0.1) 0%, rgba(0, 242, 255, 0.1) 100%)',
            borderRadius: '12px',
            border: '1px solid var(--neon-cyan)',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Price Locked Successfully!</div>
            <div className="neon-text-cyan" style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '10px 0' }}>
              ${lockedPrice.price.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Bet ID: {betId}
            </div>
            <div style={{ marginTop: '15px' }}>
              <motion.div 
                style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold',
                  color: timeLeft <= 3 ? 'var(--neon-pink)' : 'var(--neon-blue)'
                }}
                animate={{ scale: timeLeft <= 3 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.5, repeat: timeLeft <= 3 ? Infinity : 0 }}
              >
                {timeLeft}s
              </motion.div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Demo timer</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <motion.button 
              className="neon-button neon-button-purple" 
              onClick={handleCheckLockedPrice}
              style={{ padding: '10px 20px' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Verify Locked Price
            </motion.button>
          </div>
        </motion.div>
      )}

      {!isLocked && lockedPrice && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ 
            padding: '20px',
            background: 'rgba(0, 255, 0, 0.1)',
            borderRadius: '12px',
            border: '1px solid #00ff00',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '1.2rem', color: '#00ff00', marginBottom: '10px' }}>
              ✓ Price Lock Test Complete!
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Locked Price: ${lockedPrice.price.toFixed(2)}
            </div>
            {btcPrice && (
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Current Price: ${btcPrice.price.toFixed(2)}
              </div>
            )}
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '5px' }}>
              Difference: ${Math.abs(btcPrice.price - lockedPrice.price).toFixed(2)}
            </div>
          </div>
          
          <motion.button 
            className="neon-button" 
            onClick={reset}
            style={{ padding: '10px 25px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

// Price Chart Component
const PriceChart = ({ history, currentPrice, lockedPrice }) => {
  if (!history || history.length < 2) return null;

  const maxPrice = Math.max(...history.map(p => p.price));
  const minPrice = Math.min(...history.map(p => p.price));
  const priceRange = maxPrice - minPrice || 1;
  
  const points = history.map((point, index) => {
    const x = (index / (history.length - 1)) * 300;
    const y = 50 - ((point.price - minPrice) / priceRange) * 40;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ 
      height: '60px', 
      position: 'relative',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '5px',
      overflow: 'hidden'
    }}>
      <svg width="100%" height="60" style={{ position: 'absolute', top: 0, left: 0 }}>
        <polyline
          fill="none"
          stroke="var(--neon-blue)"
          strokeWidth="2"
          points={points}
          style={{
            filter: 'drop-shadow(0 0 3px rgba(0, 242, 255, 0.5))'
          }}
        />
        {lockedPrice && (
          <line
            x1="0"
            y1={50 - ((lockedPrice.price - minPrice) / priceRange) * 40}
            x2="300"
            y2={50 - ((lockedPrice.price - minPrice) / priceRange) * 40}
            stroke="var(--neon-pink)"
            strokeWidth="2"
            strokeDasharray="5,5"
            style={{
              filter: 'drop-shadow(0 0 3px rgba(255, 0, 212, 0.5))'
            }}
          />
        )}
      </svg>
    </div>
  );
};

// Header Component
const Header = () => {
  const { publicKey, connected } = useWallet();
  const { user, btcPrice, refreshUserData } = useAppContext();
  const [tokensVisible, setTokensVisible] = useState(false);
  const lastPriceRef = useRef(btcPrice?.price);
  
  // Force refresh user data when token dropdown opens
  useEffect(() => {
    if (tokensVisible && connected) {
      refreshUserData();
    }
  }, [tokensVisible, connected, refreshUserData]);
  
  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/">
          <motion.h1 
            className="neon-text pulse-animation" 
            style={{ 
              fontSize: '2.2rem',
              margin: 0,
              letterSpacing: '3px'
            }}
            whileHover={{ scale: 1.05 }}
          >
            PULSE
          </motion.h1>
        </Link>
      </div>
      
      <motion.div 
        className="btc-price-container" 
        style={{
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '10px',
          padding: '8px 15px',
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(255, 62, 62, 0.1)',
          border: '1px solid rgba(255, 62, 62, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: '140px'
        }}
        animate={{ 
          boxShadow: btcPrice 
            ? `0 0 15px rgba(255, 62, 62, ${0.3 + Math.sin(Date.now() / 2000) * 0.1})` 
            : '0 0 15px rgba(0, 0, 0, 0.6)'
        }}
      >
        {btcPrice ? (
          <>
            <div style={{ fontSize: '0.8rem', marginBottom: '2px', opacity: 0.8 }}>BTC/USD</div>
            <motion.div 
              className="price-text btc-price" 
              style={{ 
                fontSize: '1.2rem', 
                fontWeight: 'bold',
                textAlign: 'center',
                color: btcPrice.price > (lastPriceRef.current || 0) ? '#00ff00' : 
                       btcPrice.price < (lastPriceRef.current || 0) ? '#ff0000' : 'inherit'
              }}
              key={btcPrice.timestamp}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.2 }}
              onAnimationComplete={() => {
                lastPriceRef.current = btcPrice.price;
              }}
            >
              ${btcPrice.price.toLocaleString(undefined, { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </motion.div>
            <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>LIVE</div>
          </>
        ) : (
          <div className="loading-price">Loading...</div>
        )}
      </motion.div>
      
      <div className="wallet-container">
        {connected && publicKey ? (
          <div className="connected-wallet">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px' 
            }}>
              <Link to="/wallet" className="wallet-link">
                <motion.div 
                  className="wallet-display" 
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    border: '1px solid var(--neon-blue)',
                    boxShadow: '0 0 10px rgba(0, 242, 255, 0.3), inset 0 0 8px rgba(0, 242, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={{ scale: 1.02 }}
                >
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
                </motion.div>
              </Link>
              
              {/* Token Balance Button - Always show when connected */}
              {connected && (
                <div style={{ position: 'relative' }}>
                  <motion.button 
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
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
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
                  </motion.button>
                  
                  <AnimatePresence>
                    {tokensVisible && (
                      <motion.div 
                        className="token-dropdown" 
                        style={{
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
                          width: '200px'
                        }}
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div style={{ textAlign: 'center', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--neon-cyan)', textShadow: '0 0 5px rgba(0, 255, 187, 0.5)' }}>
                          Your Balance
                        </div>
                        {user && user.tokens ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                              { symbol: 'BeTyche', short: 'B', amount: user.tokens.BeTyche || 0, color: 'cyan' },
                              { symbol: 'SOL', short: 'S', amount: user.tokens.SOL || 0, color: 'blue' },
                              { symbol: 'ETH', short: 'E', amount: user.tokens.ETH || 0, color: 'purple' },
                              { symbol: 'RADBRO', short: 'R', amount: user.tokens.RADBRO || 0, color: 'pink' }
                            ].map((token, index) => (
                              <motion.div 
                                key={token.symbol}
                                className="token-row" 
                                style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center', 
                                  padding: '6px 10px', 
                                  backgroundColor: `rgba(var(--${token.color}-rgb), 0.05)`, 
                                  borderRadius: '8px' 
                                }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '50%', 
                                    backgroundColor: `rgba(var(--${token.color}-rgb), 0.2)`, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    color: `var(--neon-${token.color})`, 
                                    fontWeight: 'bold', 
                                    fontSize: '0.8rem', 
                                    textShadow: `0 0 3px rgba(var(--${token.color}-rgb), 0.5)` 
                                  }}>
                                    {token.short}
                                  </span>
                                  <span style={{ fontSize: '0.9rem' }}>{token.symbol}</span>
                                </div>
                                <span style={{ 
                                  fontSize: '0.9rem', 
                                  fontWeight: 'bold', 
                                  color: `var(--neon-${token.color})` 
                                }}>
                                  {token.amount.toFixed(2)}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto 10px' }} />
                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Loading balances...</div>
                          </div>
                        )}
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                          <Link to="/wallet" style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--text-secondary)', 
                            textDecoration: 'none', 
                            display: 'inline-block', 
                            padding: '4px 10px', 
                            borderRadius: '4px', 
                            transition: 'all 0.3s ease' 
                          }}>
                            View Wallet Details
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
          <motion.a 
            href="#" 
            className="footer-link" 
            style={{ color: 'var(--neon-blue)', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.3s ease' }}
            whileHover={{ scale: 1.05, textShadow: '0 0 8px var(--neon-blue)' }}
          >
            Terms of Service
          </motion.a>
          <motion.a 
            href="#" 
            className="footer-link" 
            style={{ color: 'var(--neon-pink)', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.3s ease' }}
            whileHover={{ scale: 1.05, textShadow: '0 0 8px var(--neon-pink)' }}
          >
            Privacy Policy
          </motion.a>
          <motion.a 
            href="#" 
            className="footer-link" 
            style={{ color: 'var(--neon-purple)', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.3s ease' }}
            whileHover={{ scale: 1.05, textShadow: '0 0 8px var(--neon-purple)' }}
          >
            FAQ
          </motion.a>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          {[
            'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z',
            'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
            'M2 2 L20 2 L20 20 L2 20 Z M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5 L17.51 6.5',
            'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9 L6 9 L6 21 L2 21 Z M4 4 A2 2 0 0 1 4 8 A2 2 0 0 1 4 4'
          ].map((path, index) => (
            <motion.a 
              key={index}
              href="#" 
              style={{ color: 'var(--text-secondary)', transition: 'all 0.3s ease' }}
              whileHover={{ 
                scale: 1.2, 
                color: 'var(--neon-blue)',
                filter: 'drop-shadow(0 0 5px var(--neon-blue))'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={path} />
              </svg>
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
};

// Splash Screen
const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 3 + 2;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <motion.div 
      className="splash-screen" 
      style={{
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
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        <motion.h1 
          className="neon-text flicker-animation" 
          style={{ 
            fontSize: '6rem', 
            marginBottom: '2rem',
            fontFamily: 'Orbitron, sans-serif',
            letterSpacing: '8px'
          }}
          animate={{ 
            textShadow: [
              '0 0 10px rgba(0, 242, 255, 0.7)',
              '0 0 20px rgba(0, 242, 255, 0.9)',
              '0 0 10px rgba(0, 242, 255, 0.7)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          PULSE
        </motion.h1>
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--neon-blue) 0%, var(--neon-cyan) 100%)',
            boxShadow: 'var(--neon-glow)',
            width: `${progress}%`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="neon-text-purple"
        style={{ 
          fontSize: '1.2rem',
          letterSpacing: '3px',
          textAlign: 'center'
        }}
      >
        CRYPTO MICRO PREDICTION GAME
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
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
    </motion.div>
  );
};

// ================= SCREENS =================

// Home Screen
const HomeScreen = () => {
  const { connected } = useWallet();
  const { btcPrice } = useAppContext();
  
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
          <motion.h1 
            className="neon-text"
            animate={{ 
              textShadow: [
                '0 0 10px rgba(0, 242, 255, 0.7)',
                '0 0 20px rgba(0, 242, 255, 0.9)',
                '0 0 10px rgba(0, 242, 255, 0.7)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            PREDICT. WIN. REPEAT.
          </motion.h1>
          <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
            Experience the future of crypto prediction gaming with real-time price feeds
            and instant price locking technology.
          </p>
          
          {btcPrice && (
            <motion.div 
              className="btc-price-container" 
              style={{ 
                margin: '30px 0',
                padding: '25px',
                background: 'linear-gradient(135deg, rgba(255, 62, 62, 0.1) 0%, rgba(255, 62, 62, 0.05) 100%)',
                borderRadius: '15px',
                boxShadow: 'inset 0 0 20px rgba(255, 62, 62, 0.1)',
                border: '1px solid rgba(255, 62, 62, 0.3)',
                position: 'relative'
              }}
              animate={{ 
                boxShadow: `inset 0 0 20px rgba(255, 62, 62, ${0.1 + Math.sin(Date.now() / 2000) * 0.05})`
              }}
            >
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>
                ⚡ LIVE BTC PRICE
              </h2>
              <motion.div 
                className="price-text btc-price-large"
                key={btcPrice.timestamp}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.2 }}
              >
                ${btcPrice.price.toLocaleString(undefined, { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </motion.div>
              <div style={{ 
                fontSize: '0.9rem', 
                opacity: 0.7,
                marginTop: '5px'
              }}>
                Real-time updates every 250ms
              </div>
            </motion.div>
          )}
          
          <div className="action-buttons" style={{ marginTop: '30px' }}>
            {connected ? (
              <motion.div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <Link to="/wallet">
                  <motion.button
                    className="neon-button neon-button-cyan"
                    style={{ fontSize: '1.2rem', padding: '12px 30px' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    VIEW WALLET
                  </motion.button>
                </Link>
                <a href="#price-lock-demo">
                  <motion.button
                    className="neon-button neon-button-purple"
                    style={{ fontSize: '1.2rem', padding: '12px 30px' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    TEST PRICE LOCK
                  </motion.button>
                </a>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <WalletMultiButton className="neon-button" style={{ fontSize: '1.2rem', padding: '12px 30px' }} />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Price Lock Demo Section */}
      <motion.div 
        id="price-lock-demo" 
        variants={itemVariants} 
        style={{ marginTop: '40px' }}
      >
        <PriceLockDemo />
      </motion.div>
      
      {/* Features Section */}
      <motion.div className="features-section" variants={itemVariants} style={{ marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <motion.div 
            className="neon-card neon-card-purple"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h3 className="neon-text-purple">⚡ REAL-TIME PRICE FEEDS</h3>
            <p>
              Lightning-fast BTC price updates with 250ms refresh rate from 
              institutional-grade price oracles.
            </p>
          </motion.div>
          
          <motion.div 
            className="neon-card neon-card-pink"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h3 className="neon-text-pink">🔒 INSTANT PRICE LOCKING</h3>
            <p>
              Revolutionary price locking technology captures exact BTC prices
              at prediction start for fair, transparent results.
            </p>
          </motion.div>
          
          <motion.div 
            className="neon-card"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h3 className="neon-text">💎 MULTI-TOKEN SUPPORT</h3>
            <p>
              Connect your wallet and manage multiple tokens including
              BeTyche, SOL, ETH, and RADBRO with seamless blockchain integration.
            </p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Token Links Section */}
      <motion.div variants={itemVariants} style={{ marginTop: '40px' }}>
        <div className="neon-card" style={{ textAlign: 'center' }}>
          <h3 className="neon-text" style={{ marginBottom: '20px' }}>💎 SUPPORTED TOKENS</h3>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.a 
              href="https://dexscreener.com/solana/3NmCUUtLkrCb5LaHtZjYApX21L6w6WnrQojNgSR9i2KP"
              target="_blank"
              rel="noopener noreferrer"
              className="neon-button neon-button-cyan"
              style={{ padding: '10px 25px' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              BeTyche on DEXScreener
            </motion.a>
            <motion.a 
              href="https://dexscreener.com/solana/GCAc7Rvcy4xbPXskHCsuhskLLE3R1C41CYufMFHVU5Pv"
              target="_blank"
              rel="noopener noreferrer"
              className="neon-button neon-button-pink"
              style={{ padding: '10px 25px' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              RADBRO on DEXScreener
            </motion.a>
          </div>
        </div>
      </motion.div>
      
      {/* How It Works Section */}
      <motion.div className="how-it-works" variants={itemVariants} style={{ marginTop: '40px' }}>
        <div className="neon-card">
          <h2 className="neon-text" style={{ textAlign: 'center', marginBottom: '30px' }}>HOW IT WORKS</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              {
                step: '1',
                title: 'Connect Your Wallet',
                description: 'Link your Solana-compatible wallet (Phantom, Solflare, Coinbase) to get started.',
                color: 'blue'
              },
              {
                step: '2', 
                title: 'View Live BTC Price',
                description: 'Watch real-time Bitcoin price updates with our ultra-fast 250ms refresh rate.',
                color: 'purple'
              },
              {
                step: '3',
                title: 'Price Lock Technology',
                description: 'Our system locks the exact BTC price at the moment you start your prediction.',
                color: 'pink'
              },
              {
                step: '4',
                title: 'Coming Soon: Predictions',
                description: 'Make predictions on BTC price movements and win instantly with our P2P system.',
                color: 'cyan'
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`neon-border neon-border-${item.color}`} style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span className={`neon-text-${item.color}`} style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {item.step}
                  </span>
                </div>
                <div>
                  <h4 style={{ marginBottom: '5px' }}>{item.title}</h4>
                  <p style={{ opacity: 0.8, margin: 0 }}>{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Wallet Screen
const WalletScreen = () => {
  const { publicKey, connected, disconnect } = useWallet();
  const { user, refreshUserData, loading } = useAppContext();
  const [referralCode, setReferralCode] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  
  const handleDisconnect = async () => {
    await disconnect?.();
    navigate('/');
  };
  
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
  
  useEffect(() => {
    if (!connected || !publicKey) {
      navigate('/');
    } else {
      // Force refresh user data when wallet screen loads
      refreshUserData();
    }
  }, [connected, publicKey, navigate, refreshUserData]);
  
  if (!connected || !publicKey) {
    return null;
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="wallet-screen"
    >
      <div className="neon-card">
        <h2 className="neon-text">💎 WALLET DETAILS</h2>
        
        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <>
            <div className="wallet-info" style={{ margin: '20px 0' }}>
              <div style={{ marginBottom: '25px' }}>
                <h4>Wallet Address:</h4>
                <motion.div 
                  style={{ 
                    wordBreak: 'break-all', 
                    padding: '15px', 
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                  {publicKey.toString()}
                </motion.div>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <h4>Token Balances:</h4>
                <div className="token-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                  gap: '20px',
                  marginTop: '15px'
                }}>
                  {user && user.tokens ? (
                    <>
                      {[
                        { name: 'BeTyche', short: 'B', amount: user.tokens.BeTyche || 0, color: 'cyan' },
                        { name: 'SOL', short: 'S', amount: user.tokens.SOL || 0, color: 'blue' },
                        { name: 'ETH', short: 'E', amount: user.tokens.ETH || 0, color: 'purple' },
                        { name: 'RADBRO', short: 'R', amount: user.tokens.RADBRO || 0, color: 'pink' }
                      ].map((token, index) => (
                        <motion.div 
                          key={token.name}
                          className="token-balance-card" 
                          style={{ 
                            padding: '20px', 
                            backgroundColor: `rgba(var(--${token.color}-rgb), 0.05)`,
                            borderRadius: '12px',
                            border: `1px solid var(--neon-${token.color})`,
                            boxShadow: `0 0 15px rgba(var(--${token.color}-rgb), 0.2)`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ 
                            scale: 1.05,
                            boxShadow: `0 0 25px rgba(var(--${token.color}-rgb), 0.4)`
                          }}
                        >
                          <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '50%', 
                            backgroundColor: `rgba(var(--${token.color}-rgb), 0.15)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '12px'
                          }}>
                            <span style={{ 
                              fontSize: '1.5rem', 
                              fontWeight: 'bold',
                              color: `var(--neon-${token.color})`,
                              textShadow: `0 0 8px rgba(var(--${token.color}-rgb), 0.7)`
                            }}>
                              {token.short}
                            </span>
                          </div>
                          <div style={{ fontSize: '1rem', marginBottom: '8px', opacity: 0.9 }}>
                            {token.name}
                          </div>
                          <div style={{ 
                            fontSize: '1.6rem', 
                            fontWeight: 'bold',
                            color: `var(--neon-${token.color})`,
                            textShadow: `0 0 8px rgba(var(--${token.color}-rgb), 0.7)`
                          }}>
                            {token.amount.toFixed(2)}
                          </div>
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                      <div className="loading-spinner" style={{ margin: '0 auto 20px' }} />
                      <p style={{ opacity: 0.7 }}>Loading token balances...</p>
                      <motion.button 
                        className="neon-button neon-button-cyan" 
                        onClick={() => refreshUserData()}
                        style={{ marginTop: '15px', padding: '8px 20px', fontSize: '0.9rem' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Refresh Balances
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
              
              {user && user.referralCode && (
                <motion.div 
                  style={{ marginBottom: '25px', marginTop: '25px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h4>Your Referral Code:</h4>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '15px',
                    padding: '25px',
                    backgroundColor: 'rgba(0,255,212,0.1)',
                    border: '2px solid var(--neon-cyan)',
                    borderRadius: '12px',
                    boxShadow: '0 0 20px rgba(0, 255, 187, 0.3), inset 0 0 20px rgba(0, 255, 187, 0.1)',
                    margin: '15px 0'
                  }}>
                    <span style={{ 
                      fontSize: '2.2rem', 
                      fontWeight: 'bold',
                      letterSpacing: '6px',
                      color: 'var(--neon-cyan)',
                      textShadow: '0 0 15px rgba(0, 255, 187, 0.8)',
                      fontFamily: 'Orbitron, sans-serif'
                    }}>
                      {user.referralCode}
                    </span>
                    <motion.button 
                      className="neon-button neon-button-cyan"
                      onClick={() => {
                        navigator.clipboard.writeText(user.referralCode);
                        setMessage({ text: 'Copied to clipboard!', type: 'success' });
                        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
                      }}
                      style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📋 Copy
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              {(!user?.referredBy) && (
                <motion.div 
                  style={{ marginTop: '25px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h4>Apply Referral Code:</h4>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px',
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
                    <motion.button 
                      className="neon-button neon-button-purple" 
                      onClick={handleApplyReferral}
                      disabled={!referralCode}
                      whileHover={{ scale: referralCode ? 1.05 : 1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Apply
                    </motion.button>
                  </div>
                  
                  <AnimatePresence>
                    {message.text && (
                      <motion.div 
                        style={{
                          marginTop: '15px',
                          padding: '15px',
                          borderRadius: '8px',
                          backgroundColor: message.type === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                          border: `1px solid ${message.type === 'success' ? '#00ff00' : '#ff0000'}`,
                          color: message.type === 'success' ? '#00ff00' : '#ff0000',
                          textShadow: message.type === 'success' ? '0 0 5px rgba(0, 255, 0, 0.5)' : '0 0 5px rgba(255, 0, 0, 0.5)'
                        }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
            
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <motion.button 
                className="neon-button neon-button-pink" 
                onClick={handleDisconnect}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔌 Disconnect Wallet
              </motion.button>
            </div>
          </>
        )}
      </div>
    </motion.div> 
  );
};

// ================= WALLET CONFIGURATION =================
const WalletConfig = ({ children }) => {
  // CHANGED TO MAINNET-BETA
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = clusterApiUrl(network);
  
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter({
      // Enable mobile app detection
      appName: 'Pulse',
      url: 'https://www.thepulse.bet',
    })
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
function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <WalletConfig>
      <AppContextProvider>
        <AnimatePresence mode="wait">
          {loading ? (
            <SplashScreen key="splash" />
          ) : (
            <motion.div 
              key="app"
              className="app-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Header />
              <main className="main-container">
                <Routes>
                  <Route path="/" element={<HomeScreen />} />
                  <Route path="/wallet" element={<WalletScreen />} />
                </Routes>
              </main>
              <Footer />
            </motion.div>
          )}
        </AnimatePresence>
      </AppContextProvider>
    </WalletConfig>
  );
}

export default App;