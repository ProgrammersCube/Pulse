import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Gift, History, TrendingUp, Copy, Check, 
  Share2, Award, Wallet, Calendar, ArrowUpRight,
  User, UserPlus, Clock, RefreshCw, AlertCircle,
  Shield, Eye, EyeOff, LogIn, Plus, Trash2,
  Twitter, Instagram, MessageSquare, Smartphone, 
  Facebook, MessageCircle, Youtube, Link, Mail, Phone,
  BarChart3, Target, DollarSign, Trophy, LogOut
} from 'lucide-react';
import { styles } from '../styles/PulseDashboard.styles';
import { useAppKitAccount } from '@reown/appkit/react';
import { useNavigate } from 'react-router-dom';

const PulseDashboard = () => {
  const { address, isConnected, embeddedWalletInfo } = useAppKitAccount();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [focusedInput, setFocusedInput] = useState('');
  const [activeTab, setActiveTab] = useState('stats');
  
  // Referral code application state
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [referralMessage, setReferralMessage] = useState({ text: '', type: '' });
  
  // API configuration
  const API_URL = process.env.REACT_APP_API_URL;
  
  // Bets history data
  const [betsHistory, setBetsHistory] = useState([]);
  const [betsLoading, setBetsLoading] = useState(false);
  const [betsPagination, setBetsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBets: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20
  });
  
  // User data
  const [username, setUsername] = useState('PulseUser123');
  const [userStats, setUserStats] = useState({
    totalBets: 0,
    totalWins: 0,
    totalLosses: 0,
    totalNetLosses: 0,
    totalReferrals: 0,
    totalBonusEarned: 0,
    referralCode: 'PULSE2025'
  });
  const [userData, setUserData] = useState(null);
  
  // Wallet addresses
  const [walletAddresses, setWalletAddresses] = useState([
    '0x742d35Cc6635C0532925a3b8D4c3D3e8f7c1234A',
    '0x8b5cf6A9d3E2B7C4F1A8D3E2B7C4F1A8D3E2B7C5'
  ]);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  
  // Referral history
  const [referralHistory, setReferralHistory] = useState([]);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralPagination, setReferralPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReferrals: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20
  });

  // Initialize component
  useEffect(() => {
    const token = localStorage.getItem('pulseToken');
    if (!token) return;
    
    console.log('Pulse token found, fetching dashboard stats...');
    console.log('Wallet connected:', isConnected);
    console.log('Wallet address:', address);
    
    // Fetch dashboard stats when component mounts
    fetchDashboardStats();
  }, [isConnected, address]);

  // Fetch bet history when bets-history tab is active
  useEffect(() => {
    if (activeTab === 'bets-history' && !betsLoading && betsHistory.length === 0) {
      fetchBetHistory();
    }
  }, [activeTab]);

  // Fetch referral history when referral-history tab is active
  useEffect(() => {
    if (activeTab === 'referral-history' && !referralLoading && referralHistory.length === 0) {
      fetchReferralHistory();
    }
  }, [activeTab]);

  // API Functions
  // Fetch bet history from API
  // Fetch referral history from API
  const fetchReferralHistory = async (page = 1) => {
    try {
      setReferralLoading(true);
      setError('');
      
      const token = localStorage.getItem('pulseToken');
      if (!token) {
        setError('Please login to view referral history');
        return;
      }

      const response = await fetch(`${API_URL}api/wallet/referral-history?page=${page}&limit=20`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Referral history response:', data);

      if (data.success) {
        setReferralHistory(data.data.referrals);
        setReferralPagination(data.data.pagination);
        setSuccess('Referral history loaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to load referral history');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error fetching referral history:', error);
      setError('Failed to load referral history. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setReferralLoading(false);
    }
  };

  const fetchBetHistory = async (page = 1) => {
    try {
      setBetsLoading(true);
      setError('');
      
      const token = localStorage.getItem('pulseToken');
      if (!token) {
        setError('Please login to view bet history');
        return;
      }

      const response = await fetch(`${API_URL}api/wallet/bet-history?page=${page}&limit=20`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Bet history response:', data);

      if (data.success) {
        setBetsHistory(data.data.bets);
        setBetsPagination(data.data.pagination);
        setSuccess('Bet history loaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to load bet history');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error fetching bet history:', error);
      setError('Failed to load bet history. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setBetsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('pulseToken');
      if (!token) {
        setError('Please login to view dashboard stats');
        return;
      }

      const response = await fetch(`${API_URL}api/wallet/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      
      if (data.success) {
        const stats = data.data;
        setUserStats({
          totalBets: stats.totalBets || 0,
          totalWins: stats.totalWins || 0,
          totalLosses: stats.totalLosses || 0,
          totalNetLosses: stats.totalNetLosses || 0,
          totalReferrals: stats.totalReferrals || 0,
          totalBonusEarned: stats.totalBonusEarned || 0,
          referralCode: stats.referralCode || 'PULSE2025'
        });
        
        setUsername(stats.userName || 'PulseUser');
        setWalletAddresses(stats.wallets || (stats.walletAddress ? [stats.walletAddress] : []));
        setUserData(stats);
        
        setSuccess('Dashboard stats loaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to load dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      @keyframes ping {
        75%, 100% { transform: scale(2); opacity: 0; }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .hover-lift {
        transition: all 0.3s ease;
      }
      
      .hover-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
      }
      
      .referral-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      .referral-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }
      
      .referral-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(168, 85, 247, 0.3);
        border-radius: 4px;
      }
      
      .referral-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(168, 85, 247, 0.5);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // API calls
  const fetchUserData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError('');
    
    try {
      await fetchDashboardStats();
      setSuccess('Data refreshed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Copy referral code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(userStats.referralCode);
    setCopiedCode('code');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Add wallet address
  const handleAddWallet = async () => {
    if (!newWalletAddress.trim()) {
      setError('Please enter a wallet address');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('pulseToken');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}api/wallet/wallet/pulse/add-wallet`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: newWalletAddress.trim()
        })
      });

      const data = await response.json();
      console.log('Add wallet response:', data);

      if (data.success) {
        // Update local state with all wallets from server
        console.log('Setting wallets to:', data.data.allWallets);
        setWalletAddresses(data.data.allWallets);
        setNewWalletAddress('');
        setSuccess('Wallet added successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to add wallet');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error adding wallet:', error);
      setError('Network error. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Remove wallet address
  const handleRemoveWallet = async (walletAddress) => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('pulseToken');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}api/wallet/wallet/${walletAddress}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Update local state with remaining wallets
        setWalletAddresses(data.data.remainingWallets);
        setSuccess('Wallet deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete wallet');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      setError('Network error. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Copy wallet address
  const handleCopyWallet = (wallet) => {
    navigator.clipboard.writeText(wallet);
    setCopiedCode('wallet');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Share to WhatsApp
  const handleWhatsAppShare = () => {
    const message = `Join me on Pulse! Use my referral code: ${userStats.referralCode}\n\nStart earning rewards and bonuses today!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('pulseToken');
    navigate('/pulse-auth');
  };

  // Apply referral code function
  const handleApplyReferralCode = async () => {
    if (!referralCodeInput.trim()) {
      setReferralMessage({ text: 'Please enter a referral code', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setReferralMessage({ text: '', type: '' });

      const token = localStorage.getItem('pulseToken');
      if (!token) {
        setReferralMessage({ text: 'Authentication required', type: 'error' });
        return;
      }

      // Get user's primary wallet address
      const userWalletAddress = userData?.walletAddress || address;
      if (!userWalletAddress) {
        setReferralMessage({ text: 'Wallet address not found', type: 'error' });
        return;
      }

      const response = await fetch(`${API_URL}api/wallet/${userWalletAddress}/referral`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          referralCode: referralCodeInput.trim().toUpperCase()
        })
      });

      const data = await response.json();

      if (data.success) {
        setReferralMessage({ 
          text: 'Referral code applied successfully!', 
          type: 'success' 
        });
        setReferralCodeInput('');
        // Refresh dashboard stats to show updated data
        await fetchDashboardStats();
      } else {
        setReferralMessage({ 
          text: data.message || 'Failed to apply referral code', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error applying referral code:', error);
      setReferralMessage({ 
        text: 'Network error. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const token = localStorage.getItem('pulseToken');
  
  // Show loading state while fetching data
  if (loading) {
    return (
      <div style={{...styles.container, position: 'relative', zIndex: 10}}>
        <div style={styles.backgroundEffects}>
          <div style={{
            ...styles.glowOrb,
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
            top: '10%',
            left: '5%',
            animation: 'float 25s infinite ease-in-out'
          }} />
        </div>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative',
          zIndex: 1
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '60px',
              height: '60px',
              border: '4px solid rgba(168, 85, 247, 0.2)',
              borderTop: '4px solid #a855f7',
              borderRadius: '50%'
            }}
          />
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading Pulse dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Show loading state if no token
  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundEffects}>
          <div style={{
            ...styles.glowOrb,
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
            top: '10%',
            left: '5%',
            animation: 'float 25s infinite ease-in-out'
          }} />
        </div>
        
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '3rem',
            maxWidth: '400px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 1rem',
              border: '3px solid rgba(168, 85, 247, 0.3)',
              borderTop: '3px solid #a855f7',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <h2 style={{ marginBottom: '1rem', color: 'white' }}>Authentication Required</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
              Please login to access your Pulse Dashboard
            </p>
            <motion.button
              onClick={() => window.location.href = '/pulse-auth'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                ...styles.neonButton,
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                border: 'none',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)'
              }}
            >
              Go to Login
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background Effects */}
      <div style={styles.backgroundEffects}>
        <div style={{
          ...styles.glowOrb,
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
          top: '10%',
          left: '5%',
          animation: 'float 25s infinite ease-in-out'
        }} />
        <div style={{
          ...styles.glowOrb,
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
          bottom: '20%',
          right: '10%',
          animation: 'float 30s infinite ease-in-out reverse'
        }} />
        <div style={{
          ...styles.glowOrb,
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 4s infinite ease-in-out'
        }} />
      </div>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)'
              }}
            >
              <BarChart3 size={24} color="white" />
            </motion.div>
            <div>
              <h1 style={styles.logoText}>PULSE DASHBOARD</h1>
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'rgba(255, 255, 255, 0.5)',
                margin: 0,
                fontWeight: '400'
              }}>
                Track your gaming performance & earnings
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <motion.button
              onClick={() => fetchUserData(true)}
              disabled={refreshing}
              style={{
                ...styles.neonButton,
                opacity: refreshing ? 0.7 : 1,
                cursor: refreshing ? 'not-allowed' : 'pointer'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw 
                size={16} 
                style={{ 
                  animation: refreshing ? 'spin 1s linear infinite' : 'none' 
                }} 
              />
              Refresh
            </motion.button>
            
            <motion.button
              onClick={handleLogout}
              style={{
                ...styles.neonButton,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={16} />
              Logout
            </motion.button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <User size={16} color="rgba(255, 255, 255, 0.7)" />
              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem' }}>
                {username}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                ...styles.alert,
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e'
              }}
            >
              <Check size={16} />
              {success}
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                ...styles.alert,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444'
              }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabbed Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={styles.tabContainer}
        >
          {/* Tab Headers */}
          <div style={styles.tabHeader}>
            <motion.button
              onClick={() => setActiveTab('stats')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'stats' ? styles.tabButtonActive : {})
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BarChart3 size={20} />
              Stats
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('wallets')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'wallets' ? styles.tabButtonActive : {})
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Wallet size={20} />
              Wallets
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('referral')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'referral' ? styles.tabButtonActive : {})
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share2 size={20} />
              Referral
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('bets-history')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'bets-history' ? styles.tabButtonActive : {})
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Target size={20} />
              Bets History
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('referral-history')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'referral-history' ? styles.tabButtonActive : {})
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <History size={20} />
              Referral History
            </motion.button>
          </div>

          {/* Tab Content */}
          <div style={styles.tabContent}>
            <AnimatePresence mode="wait">
              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                      <BarChart3 size={24} />
                      Registered User Stats
                    </h2>
                  </div>
                  
                  <div style={styles.statsGrid}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      style={styles.statCard}
                    >
                      <div style={styles.statIcon}>
                        <Target size={24} />
                      </div>
                      <div style={styles.statContent}>
                        <h3 style={styles.statValue}>{userStats.totalBets.toLocaleString()}</h3>
                        <p style={styles.statLabel}>Total Bets</p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      style={styles.statCard}
                    >
                      <div style={styles.statIcon}>
                        <Trophy size={24} />
                      </div>
                      <div style={styles.statContent}>
                        <h3 style={styles.statValue}>${userStats.totalWins.toLocaleString()}</h3>
                        <p style={styles.statLabel}>Total Wins</p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      style={styles.statCard}
                    >
                      <div style={styles.statIcon}>
                        <TrendingUp size={24} />
                      </div>
                      <div style={styles.statContent}>
                        <h3 style={styles.statValue}>${userStats.totalLosses.toLocaleString()}</h3>
                        <p style={styles.statLabel}>Total Losses</p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      style={styles.statCard}
                    >
                      <div style={styles.statIcon}>
                        <DollarSign size={24} />
                      </div>
                      <div style={styles.statContent}>
                        <h3 style={styles.statValue}>${userStats.totalNetLosses.toLocaleString()}</h3>
                        <p style={styles.statLabel}>Total Net Losses</p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      style={styles.statCard}
                    >
                      <div style={styles.statIcon}>
                        <Users size={24} />
                      </div>
                      <div style={styles.statContent}>
                        <h3 style={styles.statValue}>{userStats.totalReferrals}</h3>
                        <p style={styles.statLabel}>Total Referrals</p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      style={styles.statCard}
                    >
                      <div style={styles.statIcon}>
                        <Gift size={24} />
                      </div>
                      <div style={styles.statContent}>
                        <h3 style={styles.statValue}>${userStats.totalBonusEarned}</h3>
                        <p style={styles.statLabel}>Total Bonus Earned</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Referral Code Display */}
                  <div style={{
                    ...styles.statCard,
                    marginTop: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.3)'
                  }}>
                    <div style={styles.statIcon}>
                      <Share2 size={24} />
                    </div>
                    <div style={styles.statContent}>
                      <h3 style={styles.statValue}>{userStats.referralCode}</h3>
                      <p style={styles.statLabel}>Referral Code</p>
                    </div>
                    <motion.button
                      onClick={handleCopyCode}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        ...styles.neonButton,
                        padding: '0.5rem',
                        minWidth: 'auto'
                      }}
                    >
                      {copiedCode === 'code' ? <Check size={16} /> : <Copy size={16} />}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Apply Referral Code Section */}
              {activeTab === 'stats' && !userData?.referredBy && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  style={{
                    ...styles.section,
                    marginTop: '2rem'
                  }}
                >
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                      <Gift size={24} />
                      Apply Referral Code
                    </h2>
                  </div>
                  
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.3)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      marginBottom: '1rem',
                      fontSize: '0.9rem'
                    }}>
                      Enter a referral code to earn bonus tokens and rewards!
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center'
                    }}>
                      <input
                        type="text"
                        value={referralCodeInput}
                        onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                        placeholder="Enter referral code"
                        style={{
                          ...styles.input,
                          flex: 1,
                          fontSize: '1rem',
                          padding: '0.75rem 1rem'
                        }}
                        onFocus={() => setFocusedInput('referral')}
                        onBlur={() => setFocusedInput('')}
                      />
                      
                      <motion.button
                        onClick={handleApplyReferralCode}
                        disabled={!referralCodeInput.trim() || loading}
                        style={{
                          ...styles.neonButton,
                          opacity: (!referralCodeInput.trim() || loading) ? 0.6 : 1,
                          cursor: (!referralCodeInput.trim() || loading) ? 'not-allowed' : 'pointer',
                          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                          border: 'none',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          fontSize: '1rem',
                          fontWeight: '600'
                        }}
                        whileHover={{ scale: (!referralCodeInput.trim() || loading) ? 1 : 1.05 }}
                        whileTap={{ scale: (!referralCodeInput.trim() || loading) ? 1 : 0.95 }}
                      >
                        {loading ? 'Applying...' : 'Apply'}
                      </motion.button>
                    </div>
                    
                    {referralMessage.text && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          marginTop: '1rem',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          backgroundColor: referralMessage.type === 'success' 
                            ? 'rgba(34, 197, 94, 0.1)' 
                            : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${referralMessage.type === 'success' 
                            ? 'rgba(34, 197, 94, 0.3)' 
                            : 'rgba(239, 68, 68, 0.3)'}`,
                          color: referralMessage.type === 'success' 
                            ? '#22c55e' 
                            : '#ef4444',
                          fontSize: '0.9rem'
                        }}
                      >
                        {referralMessage.text}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'wallets' && (
                <motion.div
                  key="wallets"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                      <Wallet size={24} />
                      Wallet Addresses
                    </h2>
                  </div>
                  
                  <div style={styles.walletContainer}>
                    {(walletAddresses || []).map((wallet, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={styles.walletCard}
                      >
                        <div style={styles.walletInfo}>
                          <div style={styles.walletAddress}>
                            Wallet Address - {index + 1} 
                          </div>
                          <div style={styles.walletFull}>
                            {wallet}
                          </div>
                        </div>
                        <div style={styles.walletActions}>
                          <motion.button
                            onClick={() => handleCopyWallet(wallet)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              ...styles.neonButton,
                              padding: '0.5rem',
                              minWidth: 'auto',
                              marginRight: '0.5rem'
                            }}
                          >
                            {copiedCode === 'wallet' ? <Check size={16} /> : <Copy size={16} />}
                          </motion.button>
                          <motion.button
                            onClick={() => handleRemoveWallet(wallet)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              ...styles.neonButton,
                              padding: '0.5rem',
                              minWidth: 'auto',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444'
                            }}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Add New Wallet */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (walletAddresses || []).length * 0.1 }}
                      style={styles.addWalletCard}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                        <input
                          type="text"
                          placeholder="Enter wallet address"
                          value={newWalletAddress}
                          onChange={(e) => setNewWalletAddress(e.target.value)}
                          onFocus={() => setFocusedInput('wallet')}
                          onBlur={() => setFocusedInput('')}
                          style={{
                            ...styles.input,
                            flex: 1,
                            ...(focusedInput === 'wallet' ? styles.inputFocus : {})
                          }}
                        />
                        <motion.button
                          onClick={handleAddWallet}
                          disabled={!newWalletAddress.trim()}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            ...styles.neonButton,
                            opacity: !newWalletAddress.trim() ? 0.5 : 1,
                            cursor: !newWalletAddress.trim() ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <Plus size={16} />
                          Add
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'referral' && (
                <motion.div
                  key="referral"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                      <Share2 size={24} />
                      Share Your Referral Code
                    </h2>
                  </div>
                  
                  <div style={styles.shareContainer}>
                    <div style={styles.shareCard}>
                      <div style={styles.shareCode}>
                        <h3 style={styles.shareCodeText}>{userStats.referralCode}</h3>
                        <p style={styles.shareCodeLabel}>Your Referral Code</p>
                      </div>
                      <motion.button
                        onClick={handleCopyCode}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={styles.shareButton}
                      >
                        {copiedCode === 'code' ? <Check size={20} /> : <Copy size={20} />}
                        {copiedCode === 'code' ? 'Copied!' : 'Copy Code'}
                      </motion.button>
                    </div>
                    
                    <div style={styles.shareButtons}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={styles.socialButton}
                      >
                        <Twitter size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={styles.socialButton}
                      >
                        <Facebook size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={styles.socialButton}
                      >
                        <Instagram size={20} />
                      </motion.button>
                      <motion.button
                        onClick={handleWhatsAppShare}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          ...styles.socialButton,
                          background: 'rgba(37, 211, 102, 0.1)',
                          border: '1px solid rgba(37, 211, 102, 0.3)',
                          color: '#25d366'
                        }}
                        title="Share on WhatsApp"
                      >
                        <Phone size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={styles.socialButton}
                      >
                        <MessageSquare size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={styles.socialButton}
                      >
                        <Mail size={20} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bets-history' && (
                <motion.div
                  key="bets-history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                      <Target size={24} />
                      Bets History
                    </h2>
                    {betsPagination.totalBets > 0 && (
                      <span style={styles.badge}>
                        {betsPagination.totalBets} Total Bets
                      </span>
                    )}
                  </div>
                  
                  {betsLoading ? (
                    <div style={styles.loadingContainer}>
                      <div style={styles.loadingSpinner}></div>
                      <p style={styles.loadingText}>Loading bet history...</p>
                    </div>
                  ) : betsHistory.length === 0 ? (
                    <div style={styles.emptyState}>
                      <Target size={48} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                      <h3 style={styles.emptyStateTitle}>No Bets Yet</h3>
                      <p style={styles.emptyStateText}>
                        You haven't placed any bets yet. Start betting to see your history here!
                      </p>
                    </div>
                  ) : (
                    <div style={styles.historyContainer}>
                      <div style={{
                        ...styles.historyHeader,
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1.5fr'
                      }}>
                        <span style={styles.historyHeaderText}>Amount</span>
                        <span style={styles.historyHeaderText}>Currency</span>
                        <span style={styles.historyHeaderText}>Direction</span>
                        <span style={styles.historyHeaderText}>Result</span>
                        <span style={styles.historyHeaderText}>Profit/Loss</span>
                        <span style={styles.historyHeaderText}>Date & Time</span>
                      </div>
                      
                      <div style={styles.historyList}>
                        {(betsHistory || []).map((bet, index) => (
                          <motion.div
                            key={bet.id || bet.betId || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                              ...styles.historyItem,
                              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1.5fr'
                            }}
                          >
                            <div style={styles.historyWallet}>
                              {bet.amount}
                            </div>
                            <div style={styles.historyWallet}>
                              {bet.token || 'SOL'}
                            </div>
                            <div style={{
                              ...styles.historyDate,
                              color: bet.direction === 'UP' ? '#22c55e' : '#ef4444',
                              fontWeight: '600'
                            }}>
                              {bet.direction}
                            </div>
                            <div style={{
                              ...styles.historyDate,
                              color: bet.result === 'WIN' ? '#22c55e' : 
                                     bet.result === 'LOSS' ? '#ef4444' : '#6b7280',
                              fontWeight: '600'
                            }}>
                              {bet.result || 'PENDING'}
                            </div>
                            <div style={{
                              ...styles.historyBonus,
                              color: bet.profit > 0 ? '#22c55e' : 
                                     bet.profit < 0 ? '#ef4444' : '#6b7280',
                              justifyContent: 'flex-start'
                            }}>
                              {bet.profit > 0 ? '+' : ''}{bet.profit?.toFixed(2) || '0.00'}
                            </div>
                            <div style={styles.historyDate}>
                              {new Date(bet.createdAt || bet.lockedAt).toLocaleDateString()} {new Date(bet.createdAt || bet.lockedAt).toLocaleTimeString()}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {betsPagination.totalPages > 1 && (
                        <div style={styles.paginationContainer}>
                          <motion.button
                            onClick={() => fetchBetHistory(betsPagination.currentPage - 1)}
                            disabled={!betsPagination.hasPrevPage}
                            whileHover={{ scale: betsPagination.hasPrevPage ? 1.05 : 1 }}
                            whileTap={{ scale: betsPagination.hasPrevPage ? 0.95 : 1 }}
                            style={{
                              ...styles.paginationButton,
                              opacity: betsPagination.hasPrevPage ? 1 : 0.5,
                              cursor: betsPagination.hasPrevPage ? 'pointer' : 'not-allowed'
                            }}
                          >
                            Previous
                          </motion.button>
                          
                          <span style={styles.paginationInfo}>
                            Page {betsPagination.currentPage} of {betsPagination.totalPages}
                          </span>
                          
                          <motion.button
                            onClick={() => fetchBetHistory(betsPagination.currentPage + 1)}
                            disabled={!betsPagination.hasNextPage}
                            whileHover={{ scale: betsPagination.hasNextPage ? 1.05 : 1 }}
                            whileTap={{ scale: betsPagination.hasNextPage ? 0.95 : 1 }}
                            style={{
                              ...styles.paginationButton,
                              opacity: betsPagination.hasNextPage ? 1 : 0.5,
                              cursor: betsPagination.hasNextPage ? 'pointer' : 'not-allowed'
                            }}
                          >
                            Next
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'referral-history' && (
                <motion.div
                  key="referral-history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                      <History size={24} />
                      Referral History
                    </h2>
                    {referralPagination.totalReferrals > 0 && (
                      <span style={styles.badge}>
                        {referralPagination.totalReferrals} Total Referrals
                      </span>
                    )}
                  </div>
                  
                  {referralLoading ? (
                    <div style={styles.loadingContainer}>
                      <div style={styles.loadingSpinner}></div>
                      <p style={styles.loadingText}>Loading referral history...</p>
                    </div>
                  ) : referralHistory.length === 0 ? (
                    <div style={styles.emptyState}>
                      <History size={48} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                      <h3 style={styles.emptyStateTitle}>No Referrals Yet</h3>
                      <p style={styles.emptyStateText}>
                        You haven't referred anyone yet. Share your referral code to start earning bonuses!
                      </p>
                    </div>
                  ) : (
                    <div style={styles.historyContainer}>
                      <div style={{
                        ...styles.historyHeader,
                        gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr'
                      }}>
                        <span style={styles.historyHeaderText}>Wallet Address</span>
                        <span style={styles.historyHeaderText}>Username</span>
                        <span style={styles.historyHeaderText}>Date</span>
                        <span style={styles.historyHeaderText}>Total Bets</span>
                        <span style={styles.historyHeaderText}>Total Wins</span>
                        <span style={styles.historyHeaderText}>Total Loss</span>
                        <span style={styles.historyHeaderText}>Net Loss</span>
                        <span style={styles.historyHeaderText}>Bonus Earned</span>
                      </div>
                      
                      <div style={styles.historyList}>
                        {(referralHistory || []).map((referral, index) => (
                          <motion.div
                            key={referral.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                              ...styles.historyItem,
                              gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr'
                            }}
                          >
                            <div style={styles.historyWallet}>
                              {referral.walletAddress ? 
                                `${referral.walletAddress.slice(0, 6)}...${referral.walletAddress.slice(-4)}` : 
                                'Unknown'
                              }
                            </div>
                            <div style={styles.historyDate}>
                              {referral.userName}
                            </div>
                            <div style={styles.historyDate}>
                              {new Date(referral.createdAt).toLocaleDateString()}
                            </div>
                            <div style={styles.historyDate}>
                              {referral.totalBets || 0}
                            </div>
                            <div style={{
                              ...styles.historyBonus,
                              color: '#22c55e'
                            }}>
                              {referral.totalWins?.toFixed(2) || '0.00'}
                            </div>
                            <div style={{
                              ...styles.historyBonus,
                              color: '#ef4444'
                            }}>
                              {referral.totalLosses?.toFixed(2) || '0.00'}
                            </div>
                            <div style={{
                              ...styles.historyBonus,
                              color: referral.totalNetLoss >= 0 ? '#ef4444' : '#22c55e'
                            }}>
                              {referral.totalNetLoss >= 0 ? '+' : ''}{referral.totalNetLoss?.toFixed(2) || '0.00'}
                            </div>
                            <div style={{
                              ...styles.historyBonus,
                              color: '#22c55e'
                            }}>
                              +{referral.bonusEarned?.toFixed(2) || '0.00'}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {referralPagination.totalPages > 1 && (
                        <div style={styles.paginationContainer}>
                          <motion.button
                            onClick={() => fetchReferralHistory(referralPagination.currentPage - 1)}
                            disabled={!referralPagination.hasPrevPage}
                            whileHover={{ scale: referralPagination.hasPrevPage ? 1.05 : 1 }}
                            whileTap={{ scale: referralPagination.hasPrevPage ? 0.95 : 1 }}
                            style={{
                              ...styles.paginationButton,
                              opacity: referralPagination.hasPrevPage ? 1 : 0.5,
                              cursor: referralPagination.hasPrevPage ? 'pointer' : 'not-allowed'
                            }}
                          >
                            Previous
                          </motion.button>
                          
                          <span style={styles.paginationInfo}>
                            Page {referralPagination.currentPage} of {referralPagination.totalPages}
                          </span>
                          
                          <motion.button
                            onClick={() => fetchReferralHistory(referralPagination.currentPage + 1)}
                            disabled={!referralPagination.hasNextPage}
                            whileHover={{ scale: referralPagination.hasNextPage ? 1.05 : 1 }}
                            whileTap={{ scale: referralPagination.hasNextPage ? 0.95 : 1 }}
                            style={{
                              ...styles.paginationButton,
                              opacity: referralPagination.hasNextPage ? 1 : 0.5,
                              cursor: referralPagination.hasNextPage ? 'pointer' : 'not-allowed'
                            }}
                          >
                            Next
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PulseDashboard;
