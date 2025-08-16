import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import appKit from './components/reown'
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import { debounce } from 'lodash';
import { createTransferToHouseTransaction } from './components/Solana';
import AdminDashboard from './components/AdminDashboard';
import ReferallDashboard from './components/ReferallDashboard.jsx';
import gameService from './services/game.service.ts';
import '@solana/wallet-adapter-react-ui/styles.css';
import { useAppKitProvider, useAppKitAccount } from '@reown/appkit/react';
import { SOUNDS } from './utils/sound.js';
import walletService from './services/wallet.service.ts';
import Ambassador from './components/Ambassadar.jsx';
import PulseAccount from './components/Pulse.jsx';
// Toast component
const Toast = ({ message, type, onClose }) => (
  <>
    <style>
      {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}
    </style>
    <div style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(34,197,94,0.95)',
      color: '#fff',
      padding: '16px 32px',
      borderRadius: '12px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      fontWeight: 600,
      fontSize: '1.1rem',
      letterSpacing: '1px',
      minWidth: 220,
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      animation: 'fadeIn 0.3s',
    }} onClick={onClose}>
      {type === 'error' ? '⚠️' : '✅'} {message}
    </div>
  </>
);



const useWallet = () => {
  const { address, isConnected } = useAppKitAccount()
  
  return {
    publicKey: address ? { toString: () => address } : null,
    connected: isConnected,
    disconnect: () => appKit.disconnect(),
    connect: () => appKit.open()
  }
}
// Constants
const API_URL = process.env.REACT_APP_API_URL || 'https://creative-communication-production.up.railway.app/';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://creative-communication-production.up.railway.app/';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ================= SERVICES =================
//created a new component to test it game.service.ts


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

// Complete AppContextProvider updated for Reown AppKit
// Replace your existing AppContextProvider with this complete version

const AppContextProvider = ({ children }) => {
  const { address, isConnected,embeddedWalletInfo} = useAppKitAccount(); // Changed from useWallet
  const [user, setUser] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const previousUser = useRef(null);
  const priceUpdateRef = useRef(null);
  // Add state for house fee percentage
  const [houseFee, setHouseFee] = useState(5); // Default to 5, will be updated from backend

  // Function to refresh user data
  const refreshUserData = useCallback(async () => {
    if (!isConnected || !address) return; // Changed from connected, publicKey
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(embeddedWalletInfo?.authProvider)
      const userData = await walletService.fetchUserData(address,embeddedWalletInfo?.authProvider?"registered":"guest"); // Changed from publicKey.toString()
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
  }, [isConnected, address]); // Changed from connected, publicKey

  // Function to update token balances
  const updateTokens = useCallback(async (tokens) => {
    if (!isConnected || !address || !user) return; // Changed from connected, publicKey
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await walletService.updateUserTokens(address, tokens); // Changed from publicKey.toString()
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating tokens:', error);
      setError('Failed to update token balances');
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, user]); // Changed from connected, publicKey

  // Price locking functions
  const lockPrice = useCallback(async (symbol, betId) => {
    if (!isConnected || !address) return null; // Changed from connected, publicKey
    
    try {
      const lockedPrice = await priceService.lockPrice(
        symbol, 
        address, // Changed from publicKey.toString()
        betId
      );
      return lockedPrice;
    } catch (error) {
      console.error('Error locking price:', error);
      throw error;
    }
  }, [isConnected, address]); // Changed from connected, publicKey

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
    const interval = setInterval(fetchInitialPrice, 2500);
    
    return () => clearInterval(interval);
  }, []);

  // Handle wallet connection
  useEffect(() => {
    if (isConnected && address) { // Changed from connected, publicKey
      refreshUserData();
      
      if (socket) {
        socket.emit('wallet:connect', { address: address }); // Changed from publicKey.toString()
      }
    } else {
      setUser(null);
      
      if (socket && previousUser.current) {
        socket.emit('wallet:disconnect', { address: previousUser.current.walletAddress });
      }
    }
    
    previousUser.current = user;
  }, [isConnected, address, socket, refreshUserData]); // Changed from connected, publicKey

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
  // const { connected, publicKey } = useWallet();
  const { address, isConnected } = useAppKitAccount();

  const { btcPrice, lockPrice, getLockedPrice } = useAppContext();
  const [lockedPrice, setLockedPrice] = useState(null);
  const [betId, setBetId] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleLockPrice = async () => {
    if (!isConnected || !address || !btcPrice) return;
    
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

  if (!isConnected) {
    return (
      <div className="neon-card" style={{ textAlign: 'center', padding: '30px' }}>
        <h3 className="neon-text">🔒 PRICE LOCK DEMO</h3>
        <p style={{ marginBottom: '20px', opacity: 0.8 }}>
          Connect your wallet to test the price locking mechanism
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
  <button 
    onClick={() => appKit.open()}
    style={{
      position: 'relative',
      background: 'linear-gradient(135deg, #00d4ff 0%, #00b4d8 50%, #0077b6 100%)',
      border: 'none',
      padding: '18px 40px',
      borderRadius: '50px',
      fontSize: '18px',
      fontWeight: '700',
      color: '#000',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)';
    }}
  >
    Connect Wallet
  </button>
</div>
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
  // const { publicKey, connected } = useWallet();
  const { address, isConnected } = useAppKitAccount()

  const { user, btcPrice, refreshUserData } = useAppContext();
  const [tokensVisible, setTokensVisible] = useState(false);
  const lastPriceRef = useRef(btcPrice?.price);
  
  // Force refresh user data when token dropdown opens
  useEffect(() => {
    if (tokensVisible && isConnected) {
      refreshUserData();
    }
  }, [tokensVisible, isConnected, refreshUserData]);
  
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
  {/* Always visible Admin and Ambassador buttons */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    {/* Admin Button */}
    <Link to="/admin" className="admin-link">
      <motion.div 
        className="admin-button" 
        style={{
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '20px',
          padding: '6px 12px',
          border: '1px solid var(--neon-red)',
          boxShadow: '0 0 10px rgba(255, 62, 62, 0.3), inset 0 0 8px rgba(255, 62, 62, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        whileHover={{ scale: 1.02 }}
      >
        <span style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(255, 62, 62, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neon-red)' }}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6"/>
            <path d="M21 12h-6m-6 0H3"/>
          </svg>
        </span>
        <span className="admin-text" style={{
          fontSize: '0.9rem',
          color: 'var(--neon-red)',
          textShadow: '0 0 3px rgba(255, 62, 62, 0.5)',
          fontWeight: 'bold'
        }}>
          ADMIN
        </span>
      </motion.div>
    </Link>

    {/* Ambassador Button */}
    <Link to="/ambassador" className="admin-link">
      <motion.div 
        className="admin-button" 
        style={{
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '20px',
          padding: '6px 12px',
          border: '1px solid var(--neon-red)',
          boxShadow: '0 0 10px rgba(255, 62, 62, 0.3), inset 0 0 8px rgba(255, 62, 62, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        whileHover={{ scale: 1.02 }}
      >
        <span style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(255, 62, 62, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neon-red)' }}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6"/>
            <path d="M21 12h-6m-6 0H3"/>
          </svg>
        </span>
        <span className="admin-text" style={{
          fontSize: '0.9rem',
          color: 'var(--neon-red)',
          textShadow: '0 0 3px rgba(255, 62, 62, 0.5)',
          fontWeight: 'bold'
        }}>
          AMBASSADOR
        </span>
      </motion.div>
    </Link>
     {/* Ambassador Button */}
    <Link to="/pulse-auth" className="admin-link">
      <motion.div 
        className="admin-button" 
        style={{
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '20px',
          padding: '6px 12px',
          border: '1px solid var(--neon-red)',
          boxShadow: '0 0 10px rgba(255, 62, 62, 0.3), inset 0 0 8px rgba(255, 62, 62, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        whileHover={{ scale: 1.02 }}
      >
        <span style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(255, 62, 62, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neon-red)' }}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6"/>
            <path d="M21 12h-6m-6 0H3"/>
          </svg>
        </span>
        <span className="admin-text" style={{
          fontSize: '0.9rem',
          color: 'var(--neon-red)',
          textShadow: '0 0 3px rgba(255, 62, 62, 0.5)',
          fontWeight: 'bold'
        }}>
          PULSE ACCOUNT
        </span>
      </motion.div>
    </Link>
  </div>

  {/* Conditionally rendered wallet section */}
  {isConnected && address ? (
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
              {address.slice(0, 4)}...{address.slice(-4)}
            </span>
          </motion.div>
        </Link>
        
        {/* Token Balance Button */}
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
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <button 
        onClick={() => appKit.open()}
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #00d4ff 0%, #00b4d8 50%, #0077b6 100%)',
          border: 'none',
          padding: '18px 40px',
          borderRadius: '50px',
          fontSize: '18px',
          fontWeight: '700',
          color: '#000',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)';
        }}
      >
        Connect Wallet
      </button>
    </div>
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

const GameSetupScreen = ({ showToast }) => {
  const navigate = useNavigate();
  const [systemStatus, setSystemStatus] = useState({
    loading: true,
    canBet: true,
    message: ''
  });
  const { walletProvider } = useAppKitProvider('solana');
  const { address, isConnected } = useAppKitAccount();

  const { user, btcPrice, socket,refreshUserData } = useAppContext();
  
  // Game state
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [selectedToken, setSelectedToken] = useState('BeTyche');
  const [betAmount, setBetAmount] = useState('');
  const [duration, setDuration] = useState(30); // Default 30 seconds
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isCreatingBet, setIsCreatingBet] = useState(false);
  const [error, setError] = useState('');
  
  // Token status for wallet display
  const [tokenStatus, setTokenStatus] = useState({
    BeTyche: { enabled: true },
    SOL: { enabled: true },
    ETH: { enabled: true },
    RADBRO: { enabled: true }
  });
  
  // Dynamic token limits - will be fetched from admin settings
  const [tokenLimits, setTokenLimits] = useState({
    BeTyche: { min: 100, max: 1000000, enabled: true },
    SOL: { min: 0.00001, max: 100, enabled: true },
    ETH: { min: 0.001, max: 10, enabled: true },
    RADBRO: { min: 100, max: 10000000, enabled: true }
  });
  
  // House fee percentage state
  const [houseFee, setHouseFee] = useState(5); // Default to 5, will be updated from backend
  
  // Fetch admin settings for token limits
  const fetchAdminSettings = async () => {
    try {
      // Use the validation endpoint to get current limits for each token
      const tokens = ['BeTyche', 'SOL', 'ETH', 'RADBRO'];
      const dynamicLimits = {};
      const newTokenStatus = {};
      
      // Define appropriate test amounts for each token
      const testAmounts = {
        'BeTyche': 1000,
        'SOL': 0.00001,
        'ETH': 0.001,
        'RADBRO': 1000
      };
      
      for (const token of tokens) {
        try {
          // Test with appropriate amount for each token
          const response = await api.post('/api/game/bet/validate', {
            token: token,
            amount: testAmounts[token]
          });
          
          if (response.data.success) {
            dynamicLimits[token] = {
              ...response.data.data.limits,
              enabled: true
            };
            newTokenStatus[token] = { enabled: true };
            console.log(`✅ Token ${token} is enabled with limits:`, response.data.data.limits);
          }
        } catch (error) {
          // Check if the error is due to insufficient house balance (token is enabled but house can't cover)
          const errorMessage = error.response?.data?.message || error.message;
          const isInsufficientBalance = errorMessage.includes('Insufficient house balance') || 
                                       errorMessage.includes('House has insufficient balance');
          
          if (isInsufficientBalance) {
            // Token is enabled but house balance is insufficient
            dynamicLimits[token] = {
              min: 0,
              max: 0,
              enabled: true // Still enabled, just can't bet due to house balance
            };
            newTokenStatus[token] = { enabled: true };
            console.log(`⚠️ Token ${token} is enabled but house balance insufficient:`, errorMessage);
          } else {
            // Token is actually disabled
            dynamicLimits[token] = {
              min: 0,
              max: 0,
              enabled: false
            };
            newTokenStatus[token] = { enabled: false };
            console.log(`❌ Token ${token} is disabled:`, errorMessage);
          }
        }
      }
      
      setTokenLimits(dynamicLimits);
      setTokenStatus(newTokenStatus);
      console.log('✅ Updated token limits from validation endpoint:', dynamicLimits);
      // Fetch admin settings for fee
      const settingsRes = await api.get('/api/admin/settings');
      if (settingsRes.data && settingsRes.data.data && typeof settingsRes.data.data.houseFeePercentage === 'number') {
        setHouseFee(settingsRes.data.data.houseFeePercentage);
      }
    } catch (error) {
      console.error('❌ Error fetching admin settings:', error);
      // Keep default limits if fetch fails
    }
  };

  useEffect(() => {
    if (!isConnected || !address) {
      navigate('/');
    } else {
      // Fetch admin settings when user connects
      fetchAdminSettings();
    }
  }, [isConnected, address, navigate]);

  // Update selected token if current token gets disabled
  useEffect(() => {
    if (Object.keys(tokenLimits).length > 0 && (!tokenLimits[selectedToken] || !tokenLimits[selectedToken].enabled)) {
      // Current token is disabled or doesn't exist, switch to first available enabled token
      const firstAvailableToken = Object.keys(tokenLimits).find(token => tokenLimits[token]?.enabled);
      if (firstAvailableToken) {
        setSelectedToken(firstAvailableToken);
        console.log(`🔄 Switched to available token: ${firstAvailableToken}`);
      }
    }
  }, [tokenLimits, selectedToken]);

  // Periodically refresh admin settings to keep in sync
  useEffect(() => {
    if (isConnected && address) {
      const interval = setInterval(() => {
        fetchAdminSettings();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isConnected, address]);
 


  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Use the new status endpoint instead of creating a test bet
        const response = await api.get('/api/game/system/status');
        
        if (response.data.success) {
          setSystemStatus({
            loading: false,
            canBet: response.data.canBet,
            message: response.data.canBet ? '' : 'House has insufficient balance'
          });
        }
      } catch (error) {
        setSystemStatus({
          loading: false,
          canBet: true, // Allow betting by default if check fails
          message: ''
        });
      }
    };
    
    if (isConnected && address) {
      checkSystemStatus();
    }
  }, [isConnected, address]);

  const handleDirectionSelect = (direction) => {
    setSelectedDirection(direction);
    setError('');
  };
  
  const validateBet = () => {
    if (!selectedDirection) {
      setError('Please select UP or DOWN');
      return false;
    }
    
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bet amount');
      return false;
    }
    
    // Check if token exists and is enabled
    if (!tokenLimits[selectedToken]) {
      setError(`${selectedToken} is not available for betting`);
      return false;
    }
    
    const limits = tokenLimits[selectedToken];
    
    // Check if token is enabled
    if (!limits.enabled) {
      setError(`${selectedToken} is currently disabled by admin`);
      return false;
    }
    
    if (amount < limits.min) {
      setError(`Minimum bet for ${selectedToken} is ${limits.min}`);
      return false;
    }
    
    if (amount > limits.max) {
      setError(`Maximum bet for ${selectedToken} is ${limits.max}`);
      return false;
    }
    
    if (user && user.tokens[selectedToken] < amount) {
      setError(`Insufficient ${selectedToken} balance`);
      return false;
    }
    
    return true;
  };
  
  const handleProceed = () => {
    if (validateBet()) {
      setShowConfirmation(true);
    }
  };
  
  const handleConfirmBet = async () => {
    if (!isConnected || !address || !user) return;
    
    setIsCreatingBet(true);
    setError('');
    
    try {
      // Step 0: PRE-VALIDATE BET BEFORE SENDING TRANSACTION
      console.log('🔍 Pre-validating bet before transaction...');
      
      const validationResponse = await gameService.validateBet(selectedToken, parseFloat(betAmount));
      
      if (!validationResponse.success) {
        throw new Error(validationResponse.message);
      }
      
      console.log('✅ Bet validation passed:', validationResponse.data);
      
      // Step 1: Create the transaction
      console.log('🔐 Creating blockchain transaction...');
      
      const { transaction, connection } = await createTransferToHouseTransaction(
        address,
        parseFloat(betAmount),
        selectedToken
      );
      
      console.log('📝 Requesting wallet signature...');
      
      // Step 2: Get the wallet provider correctly
      if (!walletProvider) {
        throw new Error('Wallet provider not available');
      }
      
      // Sign and send the transaction using the provider
      let signature;
      
      try {
        // Method 1: Try using sendTransaction
        if (walletProvider.sendTransaction) {
          signature = await walletProvider.sendTransaction(transaction, connection);
        } 
        // Method 2: Try using signAndSendTransaction
        else if (walletProvider.signAndSendTransaction) {
          const result = await walletProvider.signAndSendTransaction(transaction);
          signature = result.signature;
        }
        // Method 3: Sign then send separately
        else if (walletProvider.signTransaction) {
          const signedTx = await walletProvider.signTransaction(transaction);
          signature = await connection.sendRawTransaction(signedTx.serialize());
        }
        else {
          throw new Error('Wallet does not support any transaction methods');
        }
      } catch (walletError) {
        console.error('Wallet error:', walletError);
        throw new Error('Failed to sign transaction. Make sure your wallet is unlocked.');
      }
      
      // Wait for confirmation
      console.log('⏳ Waiting for confirmation...');
      const latestBlockhash = await connection.getLatestBlockhash();
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      });
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }
      
      console.log('✅ Transaction confirmed:', signature);
      
      // Step 3: Create bet with transaction signature
      const betData = {
        userId: address.toString(),
        direction: selectedDirection,
        amount: parseFloat(betAmount),
        token: selectedToken,
        duration: duration,
        transactionSignature: signature
      };
    

console.log('📤 Sending bet data to backend:', betData);
      
      const betResponse = await gameService.createBet(betData);
      
      if (betResponse.success) {
        const bet = betResponse.data;
        
        // Refresh user data after successful bet
        setTimeout(() => refreshUserData(), 2000);
        
        navigate('/game/play', { 
          state: { 
            betId: bet.betId,
            bet: bet
          }
        });
      }
    } catch (error) {
      console.error('Error creating bet:', error);
      // Show backend error as toast
      const backendMsg = error?.response?.data?.message || error.message || 'Failed to create bet';
      showToast(backendMsg, 'error');
      setShowConfirmation(false);
    } finally {
      setIsCreatingBet(false);
    }
  };
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };
  
  if (!isConnected) return null;
  
  return (

    
    <motion.div 
      className="game-setup-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="neon-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="neon-text" style={{ textAlign: 'center', marginBottom: '30px' }}>
          🎮 SETUP YOUR PREDICTION
        </h2>

        {!systemStatus.loading && !systemStatus.canBet && (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 9999
    }}
  >
    <div style={{
      maxWidth: '600px',
      padding: '40px',
      background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.2) 0%, rgba(255, 0, 0, 0.1) 100%)',
      borderRadius: '20px',
      border: '3px solid #ff0000',
      textAlign: 'center',
      boxShadow: '0 0 40px rgba(255, 0, 0, 0.5)'
    }}>
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ fontSize: '4rem', marginBottom: '20px' }}
      >
        ⚠️
      </motion.div>
      <h2 style={{ color: '#ff0000', marginBottom: '20px' }}>
        BETTING TEMPORARILY UNAVAILABLE
      </h2>
      <pre style={{
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        color: '#ff0000',
        marginBottom: '20px',
        textAlign: 'left',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '20px',
        borderRadius: '10px'
      }}>
        {systemStatus.message}
      </pre>
      <motion.button
        className="neon-button"
        onClick={() => navigate('/')}
        style={{ marginTop: '20px' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Back to Home
      </motion.button>
    </div>
  </motion.div>
)}


        
        {!showConfirmation ? (
          <>
            {/* Direction Selection */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px' }}>1. Select BTC Direction</h4>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <motion.button
                  className={`direction-button ${selectedDirection === 'UP' ? 'selected' : ''}`}
                  onClick={() => handleDirectionSelect('UP')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '150px',
                    height: '100px',
                    border: `3px solid ${selectedDirection === 'UP' ? 'var(--neon-cyan)' : 'var(--neon-blue)'}`,
                    borderRadius: '12px',
                    background: selectedDirection === 'UP' 
                      ? 'linear-gradient(135deg, rgba(0, 255, 187, 0.2) 0%, rgba(0, 255, 187, 0.1) 100%)'
                      : 'rgba(0, 0, 0, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: selectedDirection === 'UP' ? 'var(--neon-glow-cyan)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <motion.div
                    animate={{ y: selectedDirection === 'UP' ? [-5, 0, -5] : 0 }}
                    transition={{ duration: 1.5, repeat: selectedDirection === 'UP' ? Infinity : 0 }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M7 14l5-5 5 5" stroke={selectedDirection === 'UP' ? 'var(--neon-cyan)' : 'var(--neon-blue)'} />
                    </svg>
                  </motion.div>
                  <span className={selectedDirection === 'UP' ? 'neon-text-cyan' : 'neon-text'} 
                    style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    UP
                  </span>
                </motion.button>
                
                <motion.button
                  className={`direction-button ${selectedDirection === 'DOWN' ? 'selected' : ''}`}
                  onClick={() => handleDirectionSelect('DOWN')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '150px',
                    height: '100px',
                    border: `3px solid ${selectedDirection === 'DOWN' ? 'var(--neon-pink)' : 'var(--neon-blue)'}`,
                    borderRadius: '12px',
                    background: selectedDirection === 'DOWN' 
                      ? 'linear-gradient(135deg, rgba(255, 0, 212, 0.2) 0%, rgba(255, 0, 212, 0.1) 100%)'
                      : 'rgba(0, 0, 0, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: selectedDirection === 'DOWN' ? 'var(--neon-glow-pink)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <motion.div
                    animate={{ y: selectedDirection === 'DOWN' ? [5, 0, 5] : 0 }}
                    transition={{ duration: 1.5, repeat: selectedDirection === 'DOWN' ? Infinity : 0 }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M7 10l5 5 5-5" stroke={selectedDirection === 'DOWN' ? 'var(--neon-pink)' : 'var(--neon-blue)'} />
                    </svg>
                  </motion.div>
                  <span className={selectedDirection === 'DOWN' ? 'neon-text-pink' : 'neon-text'} 
                    style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    DOWN
                  </span>
                </motion.button>
              </div>
            </div>
            
            {/* Timer Selection */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px' }}>2. Set Timer Duration</h4>
              <div style={{ padding: '0 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Duration:</span>
                  <span className="neon-text-purple" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {duration} seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="neon-slider"
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: `linear-gradient(to right, var(--neon-purple) 0%, var(--neon-purple) ${((duration - 5) / 55) * 100}%, rgba(255, 255, 255, 0.1) ${((duration - 5) / 55) * 100}%, rgba(255, 255, 255, 0.1) 100%)`,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.8rem', opacity: 0.7 }}>
                  <span>10s</span>
                  <span>30s</span>
                  <span>60s</span>
                </div>
              </div>
            </div>
            
            {/* Token & Amount Selection */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px' }}>3. Choose Token & Amount</h4>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                {Object.keys(tokenLimits).length > 0 ? (
                  Object.keys(tokenLimits).map((token) => {
                    const isEnabled = tokenLimits[token]?.enabled;
                    const isSelected = selectedToken === token;
                    
                    return (
                      <motion.button
                        key={token}
                        className={`token-select-button ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedToken(token)}
                        whileHover={{ scale: isEnabled ? 1.05 : 1 }}
                        whileTap={{ scale: isEnabled ? 0.95 : 1 }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: `2px solid ${isSelected ? 'var(--neon-cyan)' : isEnabled ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 0, 0, 0.5)'}`,
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(0, 255, 187, 0.1)' : isEnabled ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 0, 0, 0.1)',
                          cursor: isEnabled ? 'pointer' : 'not-allowed',
                          transition: 'all 0.3s ease',
                          boxShadow: isSelected ? '0 0 10px rgba(0, 255, 187, 0.5)' : 'none',
                          opacity: isEnabled ? 1 : 0.6,
                          position: 'relative'
                        }}
                      >
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{token}</span>
                          {!isEnabled && (
                            <span style={{ 
                              fontSize: '0.7rem', 
                              color: '#ff0000', 
                              fontWeight: 'bold',
                              background: 'rgba(255, 0, 0, 0.2)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              DISABLED
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                          {user && user.tokens[token] ? user.tokens[token].toFixed(2) : '0.00'}
                        </div>
                        {!isEnabled && (
                          <div style={{ 
                            fontSize: '0.7rem', 
                            color: '#ff0000', 
                            marginTop: '5px',
                            fontStyle: 'italic'
                          }}>
                            Not available for betting
                          </div>
                        )}
                      </motion.button>
                    );
                  })
                ) : (
                  <div style={{
                    flex: 1,
                    padding: '20px',
                    textAlign: 'center',
                    background: 'rgba(255, 0, 0, 0.1)',
                    border: '2px solid rgba(255, 0, 0, 0.5)',
                    borderRadius: '8px',
                    color: '#ff0000'
                  }}>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px' }}>
                      ⚠️ No Tokens Available
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      All tokens are currently disabled by admin
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  className="neon-input"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  disabled={Object.keys(tokenLimits).length === 0 || !tokenLimits[selectedToken]?.enabled}
                  placeholder={
                    Object.keys(tokenLimits).length === 0 
                      ? 'No tokens available' 
                      : !tokenLimits[selectedToken]?.enabled 
                        ? `${selectedToken} is disabled` 
                        : `Enter amount (min: ${tokenLimits[selectedToken]?.min || '---'})`
                  }
                  style={{ 
                    paddingRight: '80px', 
                    opacity: Object.keys(tokenLimits).length === 0 || !tokenLimits[selectedToken]?.enabled ? 0.5 : 1 
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: tokenLimits[selectedToken]?.enabled ? 'var(--text-secondary)' : '#ff0000',
                  fontSize: '0.9rem'
                }}>
                  {selectedToken}
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '10px',
                fontSize: '0.85rem',
                opacity: 0.7
              }}>
                <span>Min: {tokenLimits[selectedToken]?.enabled ? tokenLimits[selectedToken]?.min || '---' : 'DISABLED'}</span>
                <span>Max: {tokenLimits[selectedToken]?.enabled ? tokenLimits[selectedToken]?.max || '---' : 'DISABLED'}</span>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '10px',
                  marginBottom: '20px',
                  borderRadius: '8px',
                  background: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid #ff0000',
                  color: '#ff0000',
                  textAlign: 'center'
                }}
              >
                {error}
              </motion.div>
            )}

<motion.div
  style={{
    position: 'fixed',
    top: '80px',
    right: '20px',
    background: 'rgba(0, 0, 0, 0.9)',
    borderRadius: '12px',
    padding: '15px 20px',
    border: '2px solid var(--neon-cyan)',
    boxShadow: '0 0 20px rgba(0, 255, 187, 0.5)',
    zIndex: 100
  }}
  initial={{ opacity: 0, x: 100 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5 }}
>
  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '5px' }}>
    LIVE BTC PRICE
  </div>
  {btcPrice ? (
    <motion.div
      key={btcPrice.timestamp}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 0.3 }}
      style={{
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: 'var(--neon-cyan)',
        textShadow: '0 0 10px rgba(0, 255, 187, 0.8)'
      }}
    >
      ${btcPrice.price.toFixed(2)}
    </motion.div>
  ) : (
    <div className="loading-spinner" style={{ width: '30px', height: '30px' }} />
  )}
  <div style={{ 
    fontSize: '0.7rem', 
    opacity: 0.6, 
    marginTop: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  }}>
    <span style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: 'var(--neon-cyan)',
      display: 'inline-block',
      animation: 'pulse 1s infinite'
    }} />
    Updating every 250ms
  </div>
</motion.div>
            
            {/* Current BTC Price */}
            {btcPrice && (
  <motion.div style={{
    textAlign: 'center',
    marginBottom: '20px',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(255, 62, 62, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
    borderRadius: '12px',
    border: '2px solid rgba(255, 62, 62, 0.5)',
    position: 'relative',
    overflow: 'hidden'
  }}
  animate={{
    borderColor: ['rgba(255, 62, 62, 0.5)', 'rgba(255, 62, 62, 0.8)', 'rgba(255, 62, 62, 0.5)']
  }}
  transition={{ duration: 2, repeat: Infinity }}
  >
    <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '10px', fontWeight: 'bold' }}>
      🔒 This price will be locked when you confirm
    </div>
    <motion.div 
      className="price-text" 
      style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold',
        background: 'linear-gradient(90deg, #fff, var(--neon-cyan))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: 'none'
      }}
      key={btcPrice.timestamp}
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ duration: 0.5 }}
    >
      ${btcPrice.price.toFixed(2)}
    </motion.div>
    <div style={{ 
      fontSize: '0.85rem', 
      opacity: 0.7, 
      marginTop: '10px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px'
    }}>
      <span>Real-time Pyth + Binance Hybrid Price</span>
      <span style={{
        padding: '2px 8px',
        background: 'rgba(0, 255, 0, 0.2)',
        borderRadius: '4px',
        border: '1px solid rgba(0, 255, 0, 0.5)',
        fontSize: '0.75rem'
      }}>
        LIVE
      </span>
    </div>
  </motion.div>
)}
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <motion.button
                className="neon-button"
                onClick={() => navigate('/')}
                style={{ flex: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="neon-button neon-button-cyan"
                onClick={handleProceed}
                disabled={Object.keys(tokenLimits).length === 0 || !tokenLimits[selectedToken]?.enabled}
                style={{ 
                  flex: 2, 
                  opacity: Object.keys(tokenLimits).length === 0 || !tokenLimits[selectedToken]?.enabled ? 0.5 : 1 
                }}
                whileHover={{ 
                  scale: Object.keys(tokenLimits).length === 0 || !tokenLimits[selectedToken]?.enabled ? 1 : 1.02 
                }}
                whileTap={{ 
                  scale: Object.keys(tokenLimits).length === 0 || !tokenLimits[selectedToken]?.enabled ? 1 : 0.98 
                }}
              >
                {Object.keys(tokenLimits).length === 0 
                  ? 'NO TOKENS AVAILABLE' 
                  : !tokenLimits[selectedToken]?.enabled 
                    ? `${selectedToken} IS DISABLED` 
                    : 'Proceed to Confirm'
                }
              </motion.button>
            </div>
          </>
        ) : (
          /* Confirmation Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>
              CONFIRM YOUR PREDICTION
            </h3>
            <motion.div
      style={{
        background: 'rgba(0, 255, 187, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        border: '2px solid var(--neon-cyan)',
        textAlign: 'center'
      }}
      animate={{
        boxShadow: ['0 0 20px rgba(0, 255, 187, 0.3)', '0 0 30px rgba(0, 255, 187, 0.5)', '0 0 20px rgba(0, 255, 187, 0.3)']
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '10px' }}>
        🔒 PRICE WILL BE LOCKED AT
      </div>
      <div style={{ 
        fontSize: '2.8rem', 
        fontWeight: 'bold',
        color: 'var(--neon-cyan)',
        textShadow: '0 0 15px rgba(0, 255, 187, 0.8)'
      }}>
        ${btcPrice ? btcPrice.price.toFixed(2) : '---'}
      </div>
      <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '10px' }}>
        This is the price your prediction will be based on
      </div>
    </motion.div>
 
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '12px',
              padding: '25px',
              marginBottom: '30px'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Direction</div>
                <div className={selectedDirection === 'UP' ? 'neon-text-cyan' : 'neon-text-pink'} 
                  style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {selectedDirection}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Amount</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                    {betAmount} {selectedToken}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Duration</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                    {duration} seconds
                  </div>
                </div>
              </div>
              
              <div style={{
                padding: '15px',
                background: 'rgba(255, 204, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 204, 0, 0.3)'
              }}>
                <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
                  ⚡ Potential Win (minus {houseFee}% fee)
                </div>
                <div className="neon-text-gold" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {(parseFloat(betAmount) * 2 * (1 - houseFee / 100)).toFixed(2)} {selectedToken}
                </div>
              </div>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '20px',
              fontSize: '0.9rem',
              opacity: 0.8
            }}>
              By confirming, you agree to lock your prediction at the current BTC price
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <motion.button
                className="neon-button"
                onClick={handleCancelConfirmation}
                disabled={isCreatingBet}
                style={{ flex: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              <motion.button
                className="neon-button neon-button-pink"
                onClick={handleConfirmBet}
                disabled={isCreatingBet || Object.keys(tokenLimits).length === 0 || !tokenLimits[selectedToken]?.enabled}
                style={{ 
                  flex: 2, 
                  opacity: Object.keys(tokenLimits).length === 0 || !tokenLimits[selectedToken]?.enabled ? 0.5 : 1 
                }}
                whileHover={{ 
                  scale: Object.keys(tokenLimits).length === 0 || !tokenLimits[selectedToken]?.enabled ? 1 : 1.02 
                }}
                whileTap={{ 
                  scale: Object.keys(tokenLimits).length === 0 || !tokenLimits[selectedToken]?.enabled ? 1 : 0.98 
                }}
              >
                {isCreatingBet ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <div className="loading-spinner" style={{ width: '20px', height: '20px', margin: 0 }} />
                    Creating Bet...
                  </div>
                ) : Object.keys(tokenLimits).length === 0 ? (
                  'NO TOKENS AVAILABLE'
                ) : !tokenLimits[selectedToken]?.enabled ? (
                  `${selectedToken} IS DISABLED`
                ) : (
                  'CONFIRM BET'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
// Game Play Screen Component
// Game Play Screen Component
// Game Play Screen Component
const GamePlayScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { socket, refreshUserData } = useAppContext();

  const { socket, refreshUserData, btcPrice } = useAppContext();
  
  // Get bet data from navigation state
  const { betId, bet } = location.state || {};
  
  // Game states
  const [gamePhase, setGamePhase] = useState('COUNTDOWN'); // COUNTDOWN, MATCHING, PLAYING, COMPLETED
  const [countdown, setCountdown] = useState(3);
  const [matchingStatus, setMatchingStatus] = useState('Searching for opponent...');
  const [opponent, setOpponent] = useState(null);
  const [gameTimer, setGameTimer] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [finalPrice, setFinalPrice] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  
  // Redirect if no bet data
  useEffect(() => {
    if (!betId || !bet) {
      navigate('/game/setup');
    }
  }, [betId, bet, navigate]);
  
  // Join game room and listen for updates
  // Join game room and listen for updates
useEffect(() => {
  if (!socket ) return;
  
  console.log('🔌 Setting up socket listeners for bet:', betId);
  
  // Ensure we're in the correct room
  socket.emit('user:join', { userId: bet.userId });
  
  // Re-emit join every 5 seconds during game to ensure connection
  const rejoinInterval = setInterval(() => {
    if (gamePhase === 'PLAYING' || gamePhase === 'MATCHING') {
      console.log('🔄 Re-joining room to ensure connection');
      socket.emit('user:join', { userId: bet.userId });
    }
  }, 5000);
  
  // Listen for match found
  socket.on('match:found', (data) => {
    if (data.betId === betId) {
      console.log('Match found:', data);
      setOpponent(data.opponent);
      setMatchingStatus(data.isHouseBot ? 'Matched with House Bot' : 'Opponent found!');
      
      setTimeout(() => {
        startGame();
      }, 2000);
    }
  });
  
  // Listen for game start
  socket.on('game:started', (data) => {
    if (data.betId === betId) {
      console.log('Game started:', data);
      setGamePhase('PLAYING');
      setGameTimer(data.duration || bet.duration);
    }
  });
  
  // Listen for game countdown
  socket.on('game:countdown', (data) => {
    if (data.betId === betId) {
      console.log('Game countdown:', data.remaining);
      setGameTimer(data.remaining);
    }
  });
  
  // Listen for game completion - ENHANCED
  socket.on('game:completed', (data) => {
    console.log('🎮 Received game:completed event:', data);
    if (data.betId === betId) {
      console.log('✅ Game completed for our bet:', data);
      setFinalPrice(data.finalPrice);
      setGameResult(data);
      setGamePhase('COMPLETED');
      
      // Refresh user balance
      setTimeout(() => {
        refreshUserData();
      }, 1000);
    }
  });
  
  // Listen for balance updates as a backup signal
  socket.on('balance:updated', (data) => {
    console.log('💰 Balance updated:', data);
    if (gamePhase === 'PLAYING') {
      console.log('Balance updated while game in progress - checking completion');
      // This might indicate game completed
      checkGameCompletion();
    }
  });
  
  // Listen for price updates
  socket.on('price:btc', (data) => {
    setCurrentPrice(data.price);
  });
  
  // Listen for bet cancellation
  socket.on('bet:cancelled', (data) => {
    if (data.betId === betId) {
      console.log('Bet cancelled:', data);
      navigate('/', { 
        state: { 
          message: `Bet cancelled. ${data.refunded} ${data.token} refunded to your balance.` 
        }
      });
    }
  });
  
  // Cleanup
  return () => {
    clearInterval(rejoinInterval);
    socket.off('match:found');
    socket.off('match:searching');
    socket.off('game:started');
    socket.off('game:countdown');
    socket.off('game:completed');
    socket.off('balance:updated');
    socket.off('price:btc');
    socket.off('bet:cancelled');
  };
}, [socket, betId, bet, navigate, refreshUserData, gamePhase]);

// Function to check game completion status
const checkGameCompletion = async (forceCheck = false) => {
  console.log('🔍 Checking game completion status...',gamePhase);
  if (gamePhase === 'COMPLETED') {
    console.log('Game already completed, skipping API call');
    return false;
  }
  if (!betId) return false;
  
  try {
    console.log('🔄 Checking game completion status...');
    
    // First try to complete the game via the API
    const completeResponse = await gameService.completeGame(betId);
    
    if (completeResponse.success) {
      console.log('✅ Game completed via API:', completeResponse.data);
      
      // Update UI with the completed game data
      const gameResult = {
        betId: completeResponse.data.betId,
        result: completeResponse.data.result,
        finalPrice: completeResponse.data.finalPrice || bet.lockedPrice,
        payout: completeResponse.data.payout || 0,
        balanceChange: completeResponse.data.balanceChange || 0,
        priceChange: {
          amount: (completeResponse.data.finalPrice || bet.lockedPrice) - bet.lockedPrice,
          percentage: (((completeResponse.data.finalPrice || bet.lockedPrice) - bet.lockedPrice) / bet.lockedPrice * 100).toFixed(2)
        },
        realWalletUpdate: true
      };
      
      setFinalPrice(completeResponse.data.finalPrice);
      setGameResult(gameResult);
      setGamePhase('COMPLETED');
      refreshUserData();
      return true;
    }
    
    // If forceCheck is true, also check the user's recent bets
    if (forceCheck) {
      console.log('🔍 Force checking user bets for completion...');
      const response = await gameService.getUserBets(bet.userId, 5);
      
      if (response.success && response.data) {
        const currentBet = response.data.find(b => b.betId === betId);
        
        if (currentBet && currentBet.status === 'COMPLETED') {
          console.log('✅ Found completed bet in user history:', currentBet);
          
          const gameResult = {
            betId: currentBet.betId,
            result: currentBet.result,
            finalPrice: currentBet.finalPrice,
            payout: currentBet.payout,
            balanceChange: currentBet.result === 'WIN' ? 
              currentBet.payout - currentBet.amount :
              currentBet.result === 'DRAW' ? 0 : -currentBet.amount,
            priceChange: {
              amount: (currentBet.finalPrice || bet.lockedPrice) - bet.lockedPrice,
              percentage: (((currentBet.finalPrice || bet.lockedPrice) - bet.lockedPrice) / bet.lockedPrice * 100).toFixed(2)
            },
            realWalletUpdate: true
          };
          
          setFinalPrice(currentBet.finalPrice);
          setGameResult(gameResult);
          setGamePhase('COMPLETED');
          refreshUserData();
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking game completion:', error);
    return false;
  }
};



// Enhanced local timer with better completion handling
// Local timer backup for game countdown
// useEffect(() => {
//   if (gamePhase === 'PLAYING' && gameTimer > 0) {
//     if (gameTimer <= 5) {
//       SOUNDS.warning(); // Play warning sound for last 5 seconds
//     } else if (gameTimer % 5 === 0) {
//       SOUNDS.tick(); // Play tick every 5 seconds
//     }
//     const localTimer = setTimeout(() => {
//       setGameTimer(prev => {
//         const newTimer = prev - 1;
//         console.log('Local timer update:', newTimer);
        
//         // Check game status when timer reaches 0

//         if (newTimer === 0) {
          
//           console.log('⏰ Timer reached 0! Completing game...');
          
//           // Immediately try to complete the game via API
//           pollGameStatus().then(completed => {
//             if (completed) {
//               console.log('✅ Game completed successfully via API');
//             } else {
//               console.log('⚠️ Could not complete game via API, will retry...');
//               // Retry a few times if needed
//               let attempts = 0;
//               const maxAttempts = 3;
//               const retryInterval = setInterval(async () => {
//                 attempts++;
//                 console.log(`Retry ${attempts}/${maxAttempts} to complete game...`);
                
//                 const success = await pollGameStatus();
//                 if (success || attempts >= maxAttempts) {
//                   clearInterval(retryInterval);
//                   if (!success) {
//                     console.error('❌ Failed to complete game after multiple attempts');
//                   }
//                 }
//               }, 2000);
//             }
//           });
//         }
        
//         return newTimer;
//       }); 
//     }, 1000);
    
//     return () => clearTimeout(localTimer);
//   }
// }, [gamePhase, gameTimer, betId]);

// Add periodic completion check as extra safety
useEffect(() => {
  if (gamePhase === 'PLAYING' && bet) {
    // Check every 5 seconds if game should be completed
    const checkInterval = setInterval(() => {
      const expectedEndTime = new Date(bet.lockedAt).getTime() + (bet.duration * 1000);
      const now = Date.now();
      
      if (now > expectedEndTime + 5000) { // 5 seconds past expected end
        console.log('⚠️ Game should have ended by now, checking...');
        checkGameCompletion();
      }
    }, 5000);
    
    return () => clearInterval(checkInterval);
  }
}, [gamePhase, bet, checkGameCompletion]);
  // Initial countdown before matching
  useEffect(() => {
    if (gamePhase === 'COUNTDOWN' && countdown > 0) {
      SOUNDS.countdown(); // Play countdown beep
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (gamePhase === 'COUNTDOWN' && countdown === 0) {
       startMatchmaking();
    }
  }, [countdown, gamePhase]);
  
  // const startMatchmaking = async () => {
  //   setGamePhase('MATCHING');
    
  //   try {
  //     const matchData = {
  //       userId: bet.userId,
  //       direction: bet.direction,
  //       amount: bet.amount,
  //       token: bet.token,
  //       duration: bet.duration
  //     };
      
  //     console.log('Starting matchmaking:', matchData);
  //     const response = await gameService.startMatchmaking(betId, matchData);
      
  //     if (response.success && response.data.matched) {
  //       console.log('✅ Match found immediately:', response.data);
  //       setOpponent(response.data.opponent);
  //       setMatchingStatus(response.data.isHouseBot ? 'Matched with House Bot!' : 'Human opponent found!');
        
  //       // Start game after short delay
  //       setTimeout(() => {
  //         startGame();
  //       }, 2000);
  //     } else {
  //       // Set a timeout for house bot matching
  //       setTimeout(() => {
  //         console.log('⏱️ Timeout - matching with house bot');
  //         setOpponent('HOUSE_BOT');
  //         setMatchingStatus('Matched with House Bot!');
  //         setTimeout(() => {
  //           startGame();
  //         }, 2000);
  //       }, 10000); // 10 second timeout
  //     }
  //   } catch (error) {
  //     console.error('❌ Matchmaking error:', error);
  //     setMatchingStatus('Matchmaking failed');
      
  //     // Fallback to house bot
  //     setTimeout(() => {
  //       setOpponent('HOUSE_BOT');
  //       setMatchingStatus('Matched with House Bot!');
  //       setTimeout(() => {
  //         startGame();
  //       }, 2000);
  //     }, 3000);
  //   }
  // };
  const startMatchmaking = async () => {
    setGamePhase('MATCHING');
    
    try {
      const matchData = {
        userId: bet.userId,
        direction: bet.direction,
        amount: bet.amount,
        token: bet.token,
        duration: bet.duration
      };
      
      console.log('Starting matchmaking:', matchData);
      
      // INSTANT HOUSE BOT - Comment out P2P logic
      /*
      const response = await gameService.startMatchmaking(betId, matchData);
      
      if (response.success && response.data.matched) {
        console.log('✅ Match found immediately:', response.data);
        setOpponent(response.data.opponent);
        setMatchingStatus(response.data.isHouseBot ? 'Matched with House Bot!' : 'Human opponent found!');
        
        // Start game after short delay
        setTimeout(() => {
          startGame();
        }, 2000);
      } else {
        // Set a timeout for house bot matching
        setTimeout(() => {
          console.log('⏱️ Timeout - matching with house bot');
          setOpponent('HOUSE_BOT');
          setMatchingStatus('Matched with House Bot!');
          setTimeout(() => {
            startGame();
          }, 2000);
        }, 10000); // 10 second timeout
      }
      */
      
      
      
      // Call the API to update bet status
        const findMatch=await gameService.startMatchmaking(betId, matchData);
        if(findMatch?.opponent=="HOUSE_BOT")
        {
      setOpponent('HOUSE_BOT');
      setMatchingStatus('Matched with House Bot!');
       }
      // Start game after 10 second (just for UI effect)
      setTimeout(() => {
        startGame();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Matchmaking error:', error);
      setMatchingStatus('Matchmaking failed');
      
      // Fallback to house bot
      setTimeout(() => {
        setOpponent('HOUSE_BOT');
        setMatchingStatus('Matched with House Bot!');
        setTimeout(() => {
          startGame();
        }, 100);
      }, 0);
    }
  };

 
  useEffect(() => {
    if (gamePhase === 'PLAYING' && gameTimer > 0) {
      if (gameTimer <= 5) {
        SOUNDS.warning(); // Play warning sound for last 5 seconds
      } else if (gameTimer % 5 === 0) {
        SOUNDS.tick(); // Play tick every 5 seconds
      }
      const timer = setTimeout(() => {
        setGameTimer(prev => {
          const newTimer = prev - 1;
          console.log('Local timer update:', newTimer);
          
          // When timer reaches 0, start polling for game completion
          if (newTimer === 0) {
            console.log('⏰ Timer reached 0! Checking game status...');
            
            // Start polling for game completion
            setGamePhase('COMPLETING');

            let pollAttempts = 0;
            const MAX_POLL_ATTEMPTS = 10; // 20 seconds total (2s * 10)
            
            const checkGameStatus = async () => {
              try {
                console.log(`🔄 Polling for game completion (attempt ${pollAttempts + 1}/${MAX_POLL_ATTEMPTS})...`);
                const response = await gameService.getBetStatus(betId);
                const betStatus = response.data || {};
                console.log('Bet status finallll:', betStatus);
                // If game is completed, process the result
                if (betStatus.status === 'COMPLETED' || betStatus.status === 'COMPLETED_WITH_RESULT') {
                  


                   const apiResult = {
        betId: betStatus.betId,
        result: betStatus.result,
        finalPrice: betStatus.finalPrice,
        lockedPrice: betStatus.lockedPrice,
        payout: betStatus.payout || 0,
        fee: betStatus.fee || 0,
        amount: betStatus.amount,
        // FIXED: Calculate balance change correctly
        balanceChange: betStatus.result === 'WIN' ? (betStatus.payout || 0) : 
                      betStatus.result === 'LOSS' ? -(betStatus.amount || 0) : 0,
        priceChange: {
          amount: (betStatus.finalPrice || 0) - (betStatus.lockedPrice || 0),
          percentage: betStatus.lockedPrice ? 
            (((betStatus.finalPrice || 0) - (betStatus.lockedPrice || 0)) / betStatus.lockedPrice * 100).toFixed(2) : 
            '0.00',
          direction: (betStatus.finalPrice || 0) >= (betStatus.lockedPrice || 0) ? 'UP' : 'DOWN'
        },
        realWalletUpdate: true,
        // FIXED: Get proper transaction signatures
        transactionSignature: betStatus.metadata?.payoutTransferSignature || betStatus.metadata?.transferToHouseSignature || '',
        payoutTransferSignature: betStatus.metadata?.payoutTransferSignature || '',
        transferToHouseSignature: betStatus.metadata?.transferToHouseSignature || '',
        timestamp: betStatus.finalizedAt || new Date().toISOString(),
        // FIXED: Set winner/loser based on result
        winner: betStatus.result === 'WIN' ? betStatus.userId : betStatus.opponentId,
        loser: betStatus.result === 'WIN' ? betStatus.opponentId : betStatus.userId,
        // Add bet metadata for transaction viewing
        betData: betStatus
      };
      
      setGameResult(apiResult);
      setFinalPrice(betStatus.finalPrice);
      setGamePhase('COMPLETED');
      refreshUserData();
      return ;
    }

    



                else if (betStatus.status === 'NOT_FOUND' || betStatus.status === 'ERROR') {
                  console.warn('Bet not found or error status, stopping polling');
                  return false;
                }
                
                pollAttempts++;
                
                // If we've reached max attempts, complete the game
                // if (pollAttempts >= MAX_POLL_ATTEMPTS) {
                //   console.warn(`⚠️ Max poll attempts (${MAX_POLL_ATTEMPTS}) reached, completing game`);
                //   await completeGameLocally();
                //   return false;
                // }
                
                // Continue polling
                return true;
                
              } catch (error) {
                console.error('❌ Error polling game status:', error);
                pollAttempts++;
                
                // If we've reached max attempts or it's a 404, complete the game
                if (pollAttempts >= MAX_POLL_ATTEMPTS || (error.response && error.response.status === 404)) {
                  console.warn('Max attempts reached or bet not found, completing locally');
                  await completeGameLocally();
                  return false;
                }
                
                // Continue polling on other errors
                return true;
              }
            };
            
            // Process game completion
            const processGameCompletion = async (betStatus) => {
              try {
                // Call completeGame to process the result
                const result = await gameService.completeGame(betId, bet);
                
                if (result.success && result.data) {
                  console.log('✅ Game completed via API polling:', result.data);
                  setGameResult(result.data);
                  setFinalPrice(result.data.finalPrice);
                  setGamePhase('COMPLETED');
                  refreshUserData();
                } else {
                  throw new Error('Invalid game completion data');
                }
              } catch (error) {
                console.error('Error processing game completion:', error);
                await completeGameLocally();
              }
            };
            
            // Fallback to local completion
            const completeGameLocally = async () => {
              const finalPrice = bet?.lockedPrice || 0;
              const localResult = {
                betId,
                result: 'DRAW',
                finalPrice,
                payout: 0,
                balanceChange: 0,
                priceChange: { amount: 0, percentage: '0.00' },
                realWalletUpdate: false
              };
              
              console.log('🔄 Falling back to local completion with result:', localResult);
              setGameResult(localResult);
              setFinalPrice(finalPrice);
              setGamePhase('COMPLETED');
              refreshUserData();
            };
            
            // Start polling
          const pollInterval = setInterval(async () => {
  // ADD THIS CHECK FIRST
  if (gamePhase === 'COMPLETED') {
    clearInterval(pollInterval);
    return;
  }
  
  const shouldContinue = await checkGameStatus();
  if (!shouldContinue) {
    clearInterval(pollInterval);
  }
}, 2000); // Poll every 2 seconds
            
            // Initial check
            checkGameStatus().then(shouldContinue => {
              if (!shouldContinue) {
                clearInterval(pollInterval);
              }
            });
            
            // Cleanup interval on unmount
            return () => clearInterval(pollInterval);
          }
          
          return newTimer;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gamePhase, gameTimer, betId, bet, refreshUserData]);
const startGame = async () => {
  try {
    console.log('Starting game for bet:', betId);
    SOUNDS.gameStart(); // Play dramatic start sound
    const response = await gameService.startGame(betId);
    console.log('response start game',response)
    if (response.success) {
      console.log('Game started successfully');
      setGamePhase('PLAYING');
      setGameTimer(bet.duration);
    }
  } catch (error) {
    console.error('Error starting game:', error);
    // Fallback to start game locally if server fails
    setGamePhase('PLAYING');
    setGameTimer(bet.duration);
  }
};
// Easy fix - just check status before calling complete API

const pollGameStatus = async (isRetry = false) => {
  console.log(isRetry ? '🔄 Retrying to complete game...' : '🔄 Completing game...');
  if (gamePhase === 'COMPLETED') {
    console.log('Game already completed, skipping bet status check');
    return false;
  }
  if (!betId) return false;
  
  try {
    // FIRST: Always check current status
    const statusResponse = await gameService.getBetStatus(betId);
    const currentStatus = statusResponse.data?.status;
    
    console.log('Current bet status:', currentStatus);
    
    // If already COMPLETED, just process the result - DON'T call complete API
    if (currentStatus === 'COMPLETED') {
      console.log('✅ Bet already completed, processing existing result');
      
      const betData = statusResponse.data;
      const gameResult = {
        betId: betData.betId,
        result: betData.result,
        finalPrice: betData.finalPrice || bet.lockedPrice,
        payout: betData.payout || 0,
        balanceChange: betData.result === 'WIN' ? (betData.payout || 0) : 
                      betData.result === 'LOSS' ? -(betData.amount || 0) : 0,
        priceChange: {
          amount: (betData.finalPrice || bet.lockedPrice) - bet.lockedPrice,
          percentage: (((betData.finalPrice || bet.lockedPrice) - bet.lockedPrice) / bet.lockedPrice * 100).toFixed(2)
        },
        realWalletUpdate: true
      };
      
      setFinalPrice(betData.finalPrice);
      setGameResult(gameResult);
      setGamePhase('COMPLETED');
      refreshUserData();
      return true;
    }
    
    // ONLY call complete API if status is IN_PROGRESS
      // ONLY call complete API if status is IN_PROGRESS (not COMPLETED or CANCELLED)
if (currentStatus === 'IN_PROGRESS' && currentStatus !== 'COMPLETED' && currentStatus !== 'CANCELLED') {
      console.log('Status is IN_PROGRESS, calling complete API...');
      const completeResponse = await gameService.completeGame(betId, bet);
      
      if (completeResponse.success) {
        console.log('✅ Game completed via API:', completeResponse.data);
        
        const gameResult = {
          betId: completeResponse.data.betId,
          result: completeResponse.data.result,
          finalPrice: completeResponse.data.finalPrice || bet.lockedPrice,
          payout: completeResponse.data.payout || 0,
          balanceChange: completeResponse.data.balanceChange || 0,
          priceChange: {
            amount: completeResponse.data.finalPrice - bet.lockedPrice,
            percentage: (((completeResponse.data.finalPrice - bet.lockedPrice) / bet.lockedPrice) * 100).toFixed(2)
          },
          realWalletUpdate: true
        };
        
        setFinalPrice(completeResponse.data.finalPrice);
        setGameResult(gameResult);
        setGamePhase('COMPLETED');
        refreshUserData();
        return true;
      }
    } else {
      console.log(`Status is ${currentStatus}, not calling complete API`);
    }
    
  } catch (error) {
    console.error('Error in pollGameStatus:', error);
  }
  
  return false;
};  
  const handleCancelBet = async () => {
    try {
      await gameService.cancelBet(betId);
      // Navigation will be handled by socket event
    } catch (error) {
      console.error('Error cancelling bet:', error);
      alert('Failed to cancel bet. Please try again.');
    }
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };
  
  const handlePlayAgain = () => {
    refreshUserData();
    navigate('/game/setup');
  };
  
  if (!bet) return null;
  
  return (
    <motion.div
      className="game-play-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: '800px', margin: '0 auto' }}
    >
      {/* Countdown Phase */}
      {gamePhase === 'COUNTDOWN' && (
        <motion.div className="neon-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 className="neon-text" style={{ marginBottom: '40px' }}>GET READY!</h2>
          
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: '6rem',
              fontWeight: 'bold',
              fontFamily: 'Orbitron, sans-serif',
              marginBottom: '40px'
            }}
            className={countdown <= 1 ? 'neon-text-pink' : countdown === 2 ? 'neon-text-gold' : 'neon-text-cyan'}
          >
            {countdown}
          </motion.div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>Your Prediction</div>
            <div className={bet.direction === 'UP' ? 'neon-text-cyan' : 'neon-text-pink'} 
              style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
              {bet.direction}
            </div>
          </div>
          
          <div style={{ fontSize: '1.1rem', opacity: 0.8 }}>
            {bet.amount} {bet.token} • {bet.duration}s
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.7 }}>
            💰 Real blockchain transfer in progress...
          </div>
        </motion.div>
      )}
      
      {/* Matching Phase */}
      {gamePhase === 'MATCHING' && (
        <motion.div className="neon-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 className="neon-text-purple" style={{ marginBottom: '40px' }}>FINDING OPPONENT</h2>
          
          <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 40px' }}>
            <motion.div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                border: '3px solid var(--neon-purple)',
                borderRadius: '50%',
                boxShadow: 'var(--neon-glow-purple)'
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              style={{
                position: 'absolute',
                width: '80%',
                height: '80%',
                top: '10%',
                left: '10%',
                border: '3px solid var(--neon-blue)',
                borderRadius: '50%',
                boxShadow: 'var(--neon-glow)'
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '2rem'
            }}>
              🎮
            </div>
          </div>
          
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '1.2rem', marginBottom: '20px' }}
          >
            {matchingStatus}
          </motion.div>
          
          <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '30px' }}>
            Matching you with an opponent who predicted {bet.direction === 'UP' ? 'DOWN' : 'UP'}
          </div>
          
          <motion.button
            className="neon-button neon-button-pink"
            onClick={handleCancelBet}
            style={{ padding: '10px 25px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel Bet (Get Refund)
          </motion.button>
        </motion.div>
      )}
      
      {/* Playing Phase */}
      {gamePhase === 'PLAYING' && (
        <motion.div 
          className="neon-card"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
            {/* Player Side */}
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: bet.direction === 'UP' ? 'rgba(0, 255, 187, 0.1)' : 'rgba(255, 0, 212, 0.1)',
              borderRadius: '12px',
              border: `2px solid ${bet.direction === 'UP' ? 'var(--neon-cyan)' : 'var(--neon-pink)'}`
            }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '10px' }}>YOU</div>
              <div className={bet.direction === 'UP' ? 'neon-text-cyan' : 'neon-text-pink'} 
                style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {bet.direction}
              </div>
              <div style={{ marginTop: '10px', fontSize: '1.1rem' }}>
                {bet.amount} {bet.token}
              </div>
            </div>
            
            {/* Opponent Side */}
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: bet.direction === 'UP' ? 'rgba(255, 0, 212, 0.1)' : 'rgba(0, 255, 187, 0.1)',
              borderRadius: '12px',
              border: `2px solid ${bet.direction === 'UP' ? 'var(--neon-pink)' : 'var(--neon-cyan)'}`
            }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '10px' }}>
                {opponent === 'HOUSE_BOT' ? 'HOUSE BOT' : 'OPPONENT'}
              </div>
              <div className={bet.direction === 'UP' ? 'neon-text-pink' : 'neon-text-cyan'} 
                style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {bet.direction === 'UP' ? 'DOWN' : 'UP'}
              </div>
              <div style={{ marginTop: '10px', fontSize: '1.1rem' }}>
                {bet.amount} {bet.token}
              </div>
            </div>
          </div>
          
          {/* Game Timer */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <motion.div
              style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                fontFamily: 'Orbitron, sans-serif',
                color: gameTimer <= 5 ? 'var(--neon-pink)' : 'var(--neon-blue)',
                textShadow: gameTimer <= 5 ? 'var(--neon-glow-pink)' : 'var(--neon-glow)'
              }}
              animate={gameTimer <= 5 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: gameTimer <= 5 && gameTimer > 0 ? Infinity : 0 }}

>
{Math.max(0, gameTimer)}s
            </motion.div>
          </div>
          
          {/* Price Display */}
          {/* Price Display */}
<div className="price-row">
  <div className="neon-card" style={{ width: '100%', minWidth: 0, maxWidth: '100vw', boxSizing: 'border-box', marginBottom: '12px' }}>
    <div style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '8px' }}>Locked Price</div>
    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--neon-red)', letterSpacing: '2px' }}>
      ${bet.lockedPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  </div>
      <div className="neon-card" style={{ width: '100%', minWidth: 0, maxWidth: '100vw', boxSizing: 'border-box' }}>
    <div style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '8px' }}>Live BTC Price</div>
    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--neon-red)', letterSpacing: '2px' }}>
      ${btcPrice?.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  </div>
</div>
          
          {/* Price Change Indicator */}
          {currentPrice && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                background: currentPrice > bet.lockedPrice ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                borderRadius: '8px',
                border: `1px solid ${currentPrice > bet.lockedPrice ? '#00ff00' : '#ff0000'}`
              }}>
                {currentPrice > bet.lockedPrice ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="3">
                    <path d="M7 14l5-5 5 5" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff0000" strokeWidth="3">
                    <path d="M7 10l5 5 5-5" />
                  </svg>
                )}
                <span style={{
                  color: currentPrice > bet.lockedPrice ? '#00ff00' : '#ff0000',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  ${Math.abs(currentPrice - bet.lockedPrice).toFixed(2)} 
                  ({((Math.abs(currentPrice - bet.lockedPrice) / bet.lockedPrice) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}


      {/* COMPLETING Phase - Show loader when processing results */}
{gamePhase === 'COMPLETING' && (
  <motion.div 
    className="neon-card" 
    style={{ textAlign: 'center', padding: '60px 20px' }}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <h2 className="neon-text-purple" style={{ marginBottom: '40px' }}>🎯 PROCESSING RESULTS</h2>
    
    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 40px' }}>
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: '4px solid var(--neon-purple)',
          borderRadius: '50%',
          borderTop: '4px solid transparent',
          boxShadow: 'var(--neon-glow-purple)'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '2.5rem'
      }}>
        🎲
      </div>
    </div>
    
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{ fontSize: '1.2rem', marginBottom: '20px' }}
    >
      Calculating game results...
    </motion.div>
    
    <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
      Processing blockchain transactions and determining winner
    </div>
  </motion.div>
)}
      
      {/* Result Phase */}
     
     {/* Result Phase */}
{gamePhase === 'COMPLETED' && gameResult && (
  <motion.div 
    className="neon-card"
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
    style={{ textAlign: 'center', padding: '40px 20px' }}
  >
    {/* Result Header */}
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      onAnimationComplete={() => {
        // Play win/loss sound after animation
        if (gameResult.result === 'WIN') {
          SOUNDS.win();
        } else if (gameResult.result === 'LOSS') {
          SOUNDS.loss();
        }
      }}
    >
      {gameResult.houseInsufficientBalance ? (
        <>
          <h1 className="neon-text-gold" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
            ⚠️ SOMETHING WENT WRONG ⚠️
          </h1>
          <div style={{ 
            fontSize: '1.2rem', 
            marginBottom: '20px',
            padding: '20px',
            background: 'rgba(255, 204, 0, 0.1)',
            borderRadius: '12px',
            border: '2px solid var(--neon-gold)'
          }}>
            <p style={{ marginBottom: '10px' }}>
              We're experiencing technical difficulties and cannot process your winnings at this moment.
            </p>
            <p style={{ fontSize: '1rem', opacity: 0.8 }}>
              The house wallet has insufficient balance. Your bet amount will be refunded shortly.
            </p>
            <p style={{ fontSize: '0.9rem', marginTop: '15px', color: 'var(--neon-cyan)' }}>
              Please try again later or contact support if this persists.
            </p>
          </div>
        </>
      ) : gameResult.result === 'WIN' ? (
        <>
          <h1 className="neon-text-cyan" style={{ fontSize: '3rem', marginBottom: '20px' }}>
            🎉 YOU WON! 🎉
          </h1>
          <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            Congratulations! Your prediction was correct.
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '20px' }}>
            You won {(gameResult.payout || 0)} {bet?.token || 'SOL'}
          </div>
        </>
      ) : gameResult.result === 'LOSS' ? (
        // ... rest of the existing code remains the same
        <>
          <h1 className="neon-text-pink" style={{ fontSize: '3rem', marginBottom: '20px' }}>
            😔 YOU LOST
          </h1>
          <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            The price moved against your prediction.
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '20px' }}>
            You lost {Math.abs(gameResult.balanceChange)} {bet?.token || 'SOL'}
          </div>
        </>
      ) : (
        <>
          <h1 className="neon-text-gold" style={{ fontSize: '3rem', marginBottom: '20px' }}>
            🤝 IT'S A DRAW!
          </h1>
          <div style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
            The price didn't change significantly. Your bet has been returned.
          </div>
        </>
      )}
      
      {/* Show detailed opponent information */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '8px',
        padding: '15px',
        margin: '0 auto 20px',
        maxWidth: '500px'
      }}>
        <div style={{ fontSize: '1rem', marginBottom: '8px' }}>
          <strong>Match Result:</strong>
        </div>
        
        {gameResult.winner && gameResult.loser ? (
          <div style={{ fontSize: '0.95rem' }}>
            {gameResult.winner === bet?.userId ? (
              <div style={{ color: 'var(--neon-cyan)' }}>
                ✅ <strong>You</strong> defeated{' '}
                {gameResult.loser === 'HOUSE_BOT' ? (
                  <span style={{ color: 'var(--neon-pink)' }}>the House Bot</span>
                ) : (
                  <span style={{ color: 'var(--neon-pink)' }}>your opponent</span>
                )}
              </div>
            ) : gameResult.loser === bet?.userId ? (
              <div style={{ color: 'var(--neon-pink)' }}>
                ❌ <strong>You</strong> lost to{' '}
                {gameResult.winner === 'HOUSE_BOT' ? (
                  <span style={{ color: 'var(--neon-cyan)' }}>the House Bot</span>
                ) : (
                  <span style={{ color: 'var(--neon-cyan)' }}>your opponent</span>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--neon-gold)' }}>
                🤝 No winner in this match
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Match details not available
          </div>
        )}
      </div>
    </motion.div>
    
    {/* Real Blockchain Transfer Info - ENHANCED */}
    {gameResult.realWalletUpdate && (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'rgba(0, 255, 187, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px',
          border: '2px solid var(--neon-cyan)'
        }}
      >
        <div style={{ fontSize: '1.1rem', marginBottom: '15px' }}>
          🔗 Blockchain Transaction Details
        </div>
        
        {/* Transaction Signatures */}
        {gameResult.payoutTransferSignature && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>
              💰 Payout Transaction:
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              opacity: 0.7,
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '8px',
              borderRadius: '4px'
            }}>
              {gameResult.payoutTransferSignature}
            </div>
          </div>
        )}
        
        {gameResult.transferToHouseSignature && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>
              🏠 House Transfer:
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              opacity: 0.7,
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '8px',
              borderRadius: '4px'
            }}>
              {gameResult.transferToHouseSignature}
            </div>
          </div>
        )}
        
        <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '10px' }}>
          Your wallet balance has been updated on the Solana blockchain
        </div>
      </motion.div>
    )}
    
    {/* ENHANCED Balance Change Info */}
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4 }}
      style={{
        background: gameResult.balanceChange > 0 ? 'rgba(0, 255, 0, 0.1)' : 
                  gameResult.balanceChange < 0 ? 'rgba(255, 0, 0, 0.1)' : 
                  'rgba(255, 204, 0, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '25px',
        border: `2px solid ${gameResult.balanceChange > 0 ? '#00ff00' : 
                             gameResult.balanceChange < 0 ? '#ff0000' : 
                             'var(--neon-gold)'}`
      }}
    >
      <div style={{ fontSize: '1.1rem', marginBottom: '15px' }}>💰 Balance Change Summary</div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '15px',
        marginBottom: '15px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Your Bet</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            {gameResult.amount} {bet.token}
          </div>
        </div>
        
        {gameResult.payout > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Gross Winnings</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00ff00' }}>
              +{gameResult.payout} {bet.token}
            </div>
          </div>
        )}
        
        {gameResult.fee > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Platform Fee</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff5555' }}>
              -{gameResult.fee} {bet.token}
            </div>
          </div>
        )}
      </div>
      
      {/* Net Balance Change */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        paddingTop: '15px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>
          Net Balance Change
        </div>
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold',
          color: gameResult.balanceChange > 0 ? '#00ff00' : 
                 gameResult.balanceChange < 0 ? '#ff0000' : 
                 'var(--neon-gold)'
        }}>
          {gameResult.balanceChange > 0 ? '+' : ''}{gameResult.balanceChange} {bet.token}
        </div>
      </div>
    </motion.div>
    
    {/* ENHANCED Game Details */}
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5 }}
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '30px'
      }}
    >
      {/* Prediction vs Reality */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Your Prediction</div>
          <div className={`price-text ${bet.direction === 'UP' ? 'neon-text-cyan' : 'neon-text-pink'}`} 
            style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
            {bet.direction}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>
            {bet.amount} {bet.token} • {bet.duration}s
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>What Happened</div>
          <div className={`price-text ${gameResult.priceChange.direction === 'UP' ? 'neon-text-cyan' : 'neon-text-pink'}`}
            style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
            {gameResult.priceChange.direction}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>
            {gameResult.priceChange.percentage}% change
          </div>
        </div>
      </div>

      {/* Price Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Locked Price</div>
          <div className="price-text" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
            ${gameResult.lockedPrice}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Final Price</div>
          <div className="price-text" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
            ${gameResult.finalPrice?.toFixed(2)}
          </div>
        </div>
      </div>
      
      {/* Price Change Visualization */}
      <div style={{
        padding: '15px',
        background: gameResult.priceChange.amount > 0 ? 'rgba(0, 255, 0, 0.1)' : 
                  gameResult.priceChange.amount < 0 ? 'rgba(255, 0, 0, 0.1)' : 
                  'rgba(255, 204, 0, 0.1)',
        borderRadius: '8px',
        border: `1px solid ${gameResult.priceChange.amount > 0 ? '#00ff00' : 
                             gameResult.priceChange.amount < 0 ? '#ff0000' : 
                             'var(--neon-gold)'}`,
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center' 
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Price Movement</div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              color: gameResult.priceChange.amount > 0 ? '#00ff00' : 
                     gameResult.priceChange.amount < 0 ? '#ff0000' : 
                     'var(--neon-gold)'
            }}>
              {gameResult.priceChange.amount > 0 ? '+' : ''}
              ${Math.abs(gameResult.priceChange.amount).toFixed(2)}
              
              {' '}({gameResult.priceChange.amount > 0 ? '+' : ''}
              {gameResult.priceChange.percentage}%)
            </div>
          </div>
          <div style={{ 
            fontSize: '2.5rem',
            transform: gameResult.priceChange.amount < 0 ? 'rotate(180deg)' : 'rotate(0)'
          }}>
            {gameResult.priceChange.amount > 0 ? '🚀' : 
             gameResult.priceChange.amount < 0 ? '📉' : '➡️'}
          </div>
        </div>
      </div>

      {/* Prediction Accuracy */}
      <div style={{
        background: gameResult.result === 'WIN' ? 'rgba(0, 255, 0, 0.1)' : 
                  gameResult.result === 'LOSS' ? 'rgba(255, 0, 0, 0.1)' : 
                  'rgba(255, 204, 0, 0.1)',
        borderRadius: '8px',
        padding: '15px',
        border: `1px solid ${gameResult.result === 'WIN' ? '#00ff00' : 
                             gameResult.result === 'LOSS' ? '#ff0000' : 
                             'var(--neon-gold)'}`
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', marginBottom: '5px' }}>
            Your Prediction: <strong>{bet.direction}</strong>
          </div>
          <div style={{ fontSize: '1rem', marginBottom: '10px' }}>
            Actual Movement: <strong>{gameResult.priceChange.direction}</strong>
          </div>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: gameResult.result === 'WIN' ? '#00ff00' : 
                   gameResult.result === 'LOSS' ? '#ff0000' : 
                   'var(--neon-gold)'
          }}>
            {gameResult.result === 'WIN' ? '✅ CORRECT!' : 
             gameResult.result === 'LOSS' ? '❌ INCORRECT' : 
             '🤝 DRAW'}
          </div>
        </div>
      </div>
    </motion.div>
    
    {/* Action Buttons */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      style={{ display: 'flex', gap: '15px' }}
    >
      <motion.button
        className="neon-button"
        onClick={handleBackToHome}
        style={{ flex: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Back to Home
      </motion.button>
      <motion.button
        className="neon-button neon-button-purple"
        onClick={handlePlayAgain}
        style={{ flex: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Play Again
      </motion.button>
    </motion.div>
  </motion.div>
)}

    </motion.div>
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
  // const { connected } = useWallet();
  const { address, isConnected } = useAppKitAccount();

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
            PREDICT. PLAY. PROFIT.
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
  {isConnected ? (
    <motion.div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
      <Link to="/game/setup">
        <motion.button 
          className="neon-button neon-button-pink" 
          style={{ fontSize: '1.2rem', padding: '12px 30px' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          PLAY NOW
        </motion.button>
      </Link>
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
<div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
  <button 
    onClick={() => appKit.open()}
    style={{
      position: 'relative',
      background: 'linear-gradient(135deg, #00d4ff 0%, #00b4d8 50%, #0077b6 100%)',
      border: 'none',
      padding: '18px 40px',
      borderRadius: '50px',
      fontSize: '18px',
      fontWeight: '700',
      color: '#000',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)';
    }}
  >
    Connect Wallet
  </button>
</div>
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
              BeTyche, SOL, ETH, and RADBRO and many more  with seamless blockchain integration.
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
                title: 'Connect or Register',
                description: 'Link your Solana-compatible wallet (Phantom, Solflare, Coinbase) or create a Pulse account to track stats, referrals, and manage multiple wallets.',
                color: 'blue'
              },
              {
                step: '2', 
                title: 'Live BTC Price Feed',
                description: 'Follow real-time Bitcoin movements with our ultra-fast 250ms feed.',
                color: 'purple'
              },
              {
                step: '3',
                title: 'Predict. Play. Profit.',
                description:'Choose a token. Pick UP or DOWN. Lock your prediction for 10–60 seconds — your price is locked the instant you place your bet. If you’re right, you win and profit instantly',
                color: 'pink'
              },
              // {
              //   step: '4',
              //   title: 'Coming Soon: Predictions',
              //   description: 'Make predictions on BTC price movements and win instantly with our P2P system.',
              //   color: 'cyan'
              // }
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
  // const { publicKey, connected, disconnect } = useWallet();
  const { address, isConnected } = useAppKitAccount();

  const { user, refreshUserData, loading } = useAppContext();
  const [referralCode, setReferralCode] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [tokenStatus, setTokenStatus] = useState({
    BeTyche: { enabled: true },
    SOL: { enabled: true },
    ETH: { enabled: true },
    RADBRO: { enabled: true }
  });
  const navigate = useNavigate();
  
  const handleDisconnect = async () => {
    await appKit.disconnect();

    // await disconnect?.();
    navigate('/');
  };
  
  const handleApplyReferral = async () => {
    if (!isConnected || !address || !referralCode) return;
    
    try {
      // await walletService.applyReferralCode(address?.toString(), referralCode);
      await walletService.applyReferralCode(address, referralCode);

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
    if (!isConnected || !address) {
      navigate('/');
    } else {
      // Force refresh user data when wallet screen loads
      refreshUserData();
      
              // Fetch token status for display
      const fetchTokenStatus = async () => {
        try {
          const tokens = ['BeTyche', 'SOL', 'ETH', 'RADBRO'];
          const newTokenStatus = {};
          
          // Define appropriate test amounts for each token
          const testAmounts = {
            'BeTyche': 1000,
            'SOL': 0.00001,
            'ETH': 0.001,
            'RADBRO': 1000
          };
          
          for (const token of tokens) {
            try {
              await api.post('/api/game/bet/validate', {
                token: token,
                amount: testAmounts[token]
              });
              newTokenStatus[token] = { enabled: true };
            } catch (error) {
              // Check if the error is due to insufficient house balance
              const errorMessage = error.response?.data?.message || error.message;
              const isInsufficientBalance = errorMessage.includes('Insufficient house balance') || 
                                           errorMessage.includes('House has insufficient balance');
              
              if (isInsufficientBalance) {
                // Token is enabled but house balance is insufficient
                newTokenStatus[token] = { enabled: true };
              } else {
                // Token is actually disabled
                newTokenStatus[token] = { enabled: false };
              }
            }
          }
          
          setTokenStatus(newTokenStatus);
        } catch (error) {
          console.error('Error fetching token status:', error);
        }
      };
      
      fetchTokenStatus();
    }
  }, [isConnected, address, navigate, refreshUserData]);
  
  if (!isConnected || !address) {
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
                  {address.toString()}
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
                      ].map((token, index) => {
                        const isEnabled = tokenStatus[token.name]?.enabled;
                        return (
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
                          {!isEnabled && (
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              background: 'rgba(255, 0, 0, 0.9)',
                              color: 'white',
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 'bold'
                            }}>
                              DISABLED
                            </div>
                          )}
                        </motion.div>
                      );
                      })}
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
                   <motion.button 
                      className="neon-button neon-button-purple" 
                       onClick={()=>{
                        navigate(`/user-referal-dashboard`);
                       }}
                      // disabled={!referralCode}
                      whileHover={{ scale: referralCode ? 1.05 : 1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Referall Dashboard
                    </motion.button>
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
  return <>{children}</>  // Reown handles everything!
}
// ================= MAIN APP =================
function App() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const toastTimeout = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => {
      setToast(t => ({ ...t, visible: false }));
    }, 3000);
  }, []);

  const handleCloseToast = () => {
    setToast(t => ({ ...t, visible: false }));
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
  };
  
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
              {toast.visible && (
                <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />
              )}
              <Header />
              <main className="main-container">
                <Routes>
                  <Route path="/" element={<HomeScreen />} />
                  <Route path="/wallet" element={<WalletScreen />} />
                  <Route path="/game/setup" element={<GameSetupScreen showToast={showToast} />} />
                  <Route path="/game/play" element={<GamePlayScreen />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/user-referal-dashboard" element={<ReferallDashboard />} />
                   <Route path="/ambassador" element={<Ambassador />} />
                   <Route path="/pulse-auth" element={<PulseAccount />} />
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