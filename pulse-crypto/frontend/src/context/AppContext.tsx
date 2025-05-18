import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { io, Socket } from 'socket.io-client';
import { fetchUserData, updateUserTokens } from '../services/wallet.service';
import { getBTCPrice } from '../services/price.service';

interface Tokens {
  BeTyche: number;
  SOL: number;
  ETH: number;
  RADBRO: number;
}

interface User {
  walletAddress: string;
  tokens: Tokens;
  referralCode: string;
}

interface BTCPriceData {
  price: number;
  timestamp: number;
}

interface AppContextType {
  user: User | null;
  btcPrice: BTCPriceData | null;
  loading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
  updateTokens: (tokens: Partial<Tokens>) => Promise<void>;
}

const defaultContext: AppContextType = {
  user: null,
  btcPrice: null,
  loading: false,
  error: null,
  refreshUserData: async () => {},
  updateTokens: async () => {}
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [btcPrice, setBtcPrice] = useState<BTCPriceData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socketURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(socketURL);
    
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    // Store socket instance
    setSocket(socketInstance);
    
    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Subscribe to BTC price updates
  useEffect(() => {
    if (!socket) return;
    
    // Subscribe to BTC price updates
    socket.emit('subscribe:btc-price');
    
    // Handle price updates
    socket.on('price:btc', (data) => {
      setBtcPrice({
        price: data.price,
        timestamp: data.timestamp
      });
    });
    
    // Cleanup
    return () => {
      socket.emit('unsubscribe:btc-price');
      socket.off('price:btc');
    };
  }, [socket]);

  // Fetch initial BTC price
  useEffect(() => {
    const fetchInitialPrice = async () => {
      try {
        const priceData = await getBTCPrice();
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
    
    // Set up a fallback interval for price updates
    const interval = setInterval(fetchInitialPrice, 
      parseInt(process.env.REACT_APP_REFRESH_INTERVAL || '300', 10) * 1000
    );
    
    return () => clearInterval(interval);
  }, []);

  // Fetch user data when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      refreshUserData();
      
      // Notify about wallet connection
      if (socket) {
        socket.emit('wallet:connect', { address: publicKey.toString() });
      }
    } else {
      setUser(null);
      
      // Notify about wallet disconnection
      if (socket && user) {
        socket.emit('wallet:disconnect', { address: user.walletAddress });
      }
    }
  }, [connected, publicKey]);

  // Function to refresh user data
  const refreshUserData = async () => {
    if (!connected || !publicKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userData = await fetchUserData(publicKey.toString());
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // Function to update token balances
  const updateTokens = async (tokens: Partial<Tokens>) => {
    if (!connected || !publicKey || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await updateUserTokens(publicKey.toString(), tokens);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating tokens:', error);
      setError('Failed to update token balances');
    } finally {
      setLoading(false);
    }
  };

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
