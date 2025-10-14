import { Key, Lock, RotateCw, Bell, AlertTriangle, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { styles } from '../styles/Admin-dashbaord.styles.js';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Activity, 
  Settings, Award, RefreshCw, LogOut, Copy,
  AlertCircle, ChevronDown, ChevronUp, Eye, EyeOff,
  Zap, Shield, Database, Globe, BarChart3, PieChart,
  Wallet, ArrowUpRight, ArrowDownRight, Clock,ArrowUp,ArrowDown
} from 'lucide-react';
// Treasury Management Component
const API_URL = process.env.REACT_APP_API_URL
const TreasuryManagement = () => {
  const [treasury, setTreasury] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);
  const [newWallet, setNewWallet] = useState({
    publicKey: '',
    privateKey: '',
    type: 'primary',
    tokens: {}
  });
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [thresholds, setThresholds] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fallbackEnabled, setFallbackEnabled] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Real-time validation states
  const [publicKeyValidation, setPublicKeyValidation] = useState({ valid: null, error: null });
  const [privateKeyValidation, setPrivateKeyValidation] = useState({ valid: null, error: null });

// Create axios instance with auth
  const adminApi = axios.create({
    baseURL: `${API_URL}api/admin`,
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
  useEffect(() => {
    fetchTreasuryData();
  }, []);

  // Auto-refresh balances every 30 seconds
  useEffect(() => {
    if (autoRefresh && treasury?.activeWallet) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing balances...');
        fetchTreasuryData();
        setLastRefresh(new Date());
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, treasury?.activeWallet]);

  // Auto-dismiss success message after 3 seconds and scroll to top
  useEffect(() => {
    if (success) {
      // Try multiple scroll methods to ensure it works
      setTimeout(() => {
        // Method 1: Scroll to element by ID
        const notificationElement = document.getElementById('notification-area');
        if (notificationElement) {
          notificationElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
        
        // Method 2: Fallback to window scroll
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
          // Method 3: Fallback for older browsers
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 100); // Small delay to ensure DOM is updated
      
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error message after 5 seconds and scroll to top
  useEffect(() => {
    if (error) {
      // Try multiple scroll methods to ensure it works
      setTimeout(() => {
        // Method 1: Scroll to element by ID
        const notificationElement = document.getElementById('notification-area');
        if (notificationElement) {
          notificationElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
        
        // Method 2: Fallback to window scroll
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
          // Method 3: Fallback for older browsers
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 100); // Small delay to ensure DOM is updated
      
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
 // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  // Format currency
  const formatCurrency = (amount, token) => {
    console.log(amount)
    if (token === 'SOL' || token === 'ETH') {
      return amount?.toFixed(6);
    }
    return formatNumber(amount?.toFixed(2));
  };
  const fetchTreasuryData = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/settings/get-wallet-rotation');
      const allWallets = response?.data?.data;
      const activeWallet = response?.data?.activeWallet?.walletRotation[0];
      
      console.log('All Wallets:', allWallets);
      console.log('Active Wallet:', activeWallet);
      
      // Set fallback enabled state from API response
      setFallbackEnabled(response?.data?.fallbackEnabled);
      
      // Prepare active wallet data
      let activeWalletData = null;
      if (activeWallet) {
        // Fetch real blockchain balances for the active wallet
        let realBalances = {};
        try {
          console.log('🔍 Fetching real balances for wallet:', activeWallet._id);
          const balanceResponse = await adminApi.get(`/treasury/wallet-balances/${activeWallet._id}`);
          
          if (balanceResponse.data.success) {
            realBalances = balanceResponse.data.data.balances;
            console.log('✅ Real balances fetched:', realBalances);
          } else {
            console.log('⚠️ Failed to fetch real balances, using fallback');
            realBalances = {
              "SOL": 0,
              "BeTyche": 0,
              "RADBRO": 0
            };
          }
        } catch (error) {
          console.log('❌ Error fetching real balances:', error);
          // Fallback to zero balances if API fails
          realBalances = {
            "SOL": 0,
            "BeTyche": 0,
            "RADBRO": 0
          };
        }
        
        activeWalletData = {
          "_id": activeWallet._id,
          "publicKey": activeWallet.publicKey,
          "type": activeWallet.type,
          "active": activeWallet.active,
          "balances": realBalances, // ✅ Real blockchain balances instead of mock data
          "lastUpdated": new Date()
        };
      }
      
      console.log('Processed Active Wallet:', activeWalletData);
      setTreasury({
    "activeWallet": activeWalletData,
    "fallbackEnabled": response?.data?.fallbackEnabled,
    "wallets": allWallets,
    // Mock data for features not yet available in API
    "thresholds": {
      "SOL": 10,
      "ETH": 1,
      "USDC": 1000,
      "BTC": 0.1
    },
    "logs": [
      {
        "_id": "log_1",
        "admin": "admin@example.com",
        "action": "Wallet data fetched",
        "walletPublicKey": activeWallet?.publicKey || "None",
        "timestamp": new Date().toISOString()
      }
    ]
  });
    //   setThresholds(response.data.data.thresholds || {});
    } catch (err) {
      setError('Failed to fetch treasury data');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced Solana address validation function
  const validateSolanaAddress = (address) => {
    // Basic format checks
    if (typeof address !== 'string' || !address.trim()) {
      return { valid: false, error: 'Address must be a non-empty string' };
    }
    
    // Length validation (Solana addresses: 32-44 chars)
    if (address.length < 32 || address.length > 44) {
      return { valid: false, error: `Address must be 32-44 characters long (current: ${address.length})` };
    }
    
    // Base58 character validation
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (!base58Regex.test(address)) {
      return { valid: false, error: 'Address contains invalid characters. Use only base58 characters: 1-9, A-H, J-N, P-Z, a-k, m-z' };
    }
    
    // Common invalid patterns check
    if (address.includes('0') || address.includes('O') || address.includes('I') || address.includes('l')) {
      return { valid: false, error: 'Address contains invalid characters. Base58 excludes: 0, O, I, l' };
    }
    
    // Check for common typos and invalid patterns
    if (address.includes(' ') || address.includes('\t') || address.includes('\n')) {
      return { valid: false, error: 'Address cannot contain spaces or whitespace' };
    }
    
    return { valid: true, error: null };
  };

  // Real-time validation functions
  const handlePublicKeyChange = (value) => {
    setNewWallet(prev => ({ ...prev, publicKey: value }));
    
    if (!value.trim()) {
      setPublicKeyValidation({ valid: null, error: null });
      return;
    }
    
    const validation = validateSolanaAddress(value);
    setPublicKeyValidation(validation);
  };

  const handlePrivateKeyChange = (value) => {
    setNewWallet(prev => ({ ...prev, privateKey: value }));
    
    if (!value.trim()) {
      setPrivateKeyValidation({ valid: null, error: null });
      return;
    }
    
    // Basic private key validation
    let isValid = false;
    let error = null;
    
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length === 64) {
          isValid = true;
        } else {
          error = 'Private key array must contain exactly 64 numbers';
        }
      } catch {
        error = 'Invalid private key array format';
      }
    } else if (value.length >= 80 && value.length <= 90) {
      // Base58 format check
      const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
      if (base58Regex.test(value)) {
        isValid = true;
      } else {
        error = 'Invalid base58 private key format';
      }
    } else {
      error = 'Private key should be either a 64-number array or valid base58 string';
    }
    
    setPrivateKeyValidation({ valid: isValid, error: error });
  };

  const addNewWallet = async () => {
    try {
      // Step 1: Enhanced public key format validation
      const publicKeyValidation = validateSolanaAddress(newWallet.publicKey);
      if (!publicKeyValidation.valid) {
        setError(publicKeyValidation.error);
        return;
      }
      
      // Step 2: Check if wallet with same public key and type already exists
      const existingWallet = treasury?.wallets?.find(wallet => 
        wallet.publicKey === newWallet.publicKey && wallet.type === newWallet.type
      );
      
      if (existingWallet) {
        setError(`A ${newWallet.type} wallet with this public key already exists`);
        return;
      }
      
      // Step 3: Enhanced private key validation
      if (!privateKeyValidation.valid) {
        setError('Please fix private key validation errors before submitting');
        return;
      }
      
      // Validate private key format
      let privateKeyToEncrypt = newWallet.privateKey;
      
      // Check if it's already in array format
      if (newWallet.privateKey.startsWith('[') && newWallet.privateKey.endsWith(']')) {
        try {
          // Validate it's a valid JSON array
          const parsed = JSON.parse(newWallet.privateKey);
          if (!Array.isArray(parsed) || parsed.length !== 64) {
            setError('Private key array must contain exactly 64 numbers');
            return;
          }
          // It's valid, use as-is
        } catch (error) {
          setError('Invalid private key array format');
          return;
        }
      } else {
        // It's a string, check if it looks like a base58 key
        if (newWallet.privateKey.length < 80 || newWallet.privateKey.length > 90) {
          setError('Private key should be either a 64-number array or a valid base58 string');
          return;
        }
      }
      
      // Send plaintext private key to backend - backend will encrypt it securely
      const res = await adminApi.put("/update-wallet-rotation", {
        ...newWallet, 
        privateKey: privateKeyToEncrypt
      });
      
      console.log('API Response:', res?.data);
      setSuccess('Wallet added successfully!');
      
      // Clear the form after successful addition
      setNewWallet({ 
        publicKey: '', 
        privateKey: '', 
        type: 'primary', 
        tokens: {} 
      });
      
      fetchTreasuryData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add wallet');
    }
  };

  const setActiveWallet = async (walletId,targetType) => {
    try {
      await adminApi.put('/settings/setActiveWallet', { walletId,targetType });
      setSuccess('New wallet activated successfully!');
      fetchTreasuryData();
    } catch (err) {
      setError('Failed to set active wallet');
    }
  };

  const toggleToken = (token, walletId) => {
    const updatedWallets = treasury?.wallets?.map(wallet => {
      if (wallet._id === walletId) {
        const updatedTokens = { ...wallet.enabledTokens };
        updatedTokens[token] = !updatedTokens[token];
        return { ...wallet, enabledTokens: updatedTokens };
      }
      return wallet;
    });
    
    setTreasury({ ...treasury, wallets: updatedWallets });
    
    // Update on server
    // adminApi.put(`/treasury/wallets/${walletId}/tokens`, {
    //   token,
    //   enabled: !treasury?.wallets?.find(w => w._id === walletId).enabledTokens[token]
    // });
  };

  const updateThresholds = async () => {
    try {
      await adminApi.put('/treasury/thresholds', { thresholds });
      setSuccess('Thresholds updated successfully!');
    } catch (err) {
      setError('Failed to update thresholds');
    }
  };

  const toggleFallback = async (e) => {
    try {
      const toggleValue = e.target.checked;
      console.log(toggleValue);
      
      const response = await adminApi.post('/settings/wallet-rotation-toggle-fallback', { 
        toggleWallet: toggleValue 
      });
      
      if (response.data.success) {
        setFallbackEnabled(toggleValue);
        fetchTreasuryData();
        setSuccess(`Fallback ${toggleValue ? 'enabled' : 'disabled'}!`);
      } else {
        setError('Failed to toggle fallback');
      }
    } catch (err) {
      setError('Failed to toggle fallback');
      console.error('Toggle fallback error:', err);
    }
  };

//   if (loading || !treasury) {
//     return (
//       <div style={{ textAlign: 'center', padding: '4rem' }}>
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
//           style={{
//             width: '60px',
//             height: '60px',
//             border: '4px solid rgba(168, 85, 247, 0.2)',
//             borderTop: '4px solid #a855f7',
//             borderRadius: '50%',
//             margin: '0 auto'
//           }}
//         />
//         <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '1rem' }}>
//           Loading treasury data...
//         </p>
//       </div>
//     );
//   }

  return (
    <motion.div
      key="treasury"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', zIndex: 15 }}
    >
      {/* Success/Error Messages */}
      <div id="notification-area" style={{ position: 'relative', zIndex: 20 }}>
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            padding: '1rem 1.5rem',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            color: '#22c55e',
            fontSize: '0.875rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            position: 'relative',
            zIndex: 25
          }}
        >
          <Check size={18} />
          {success}
          <button
            onClick={() => setSuccess('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#22c55e',
              cursor: 'pointer',
              marginLeft: 'auto',
              padding: '0.25rem',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            padding: '1rem 1.5rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#ef4444',
            fontSize: '0.875rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            position: 'relative',
            zIndex: 25
          }}
        >
          <AlertCircle size={18} />
          {error}
          <button
            onClick={() => setError('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              marginLeft: 'auto',
              padding: '0.25rem',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </motion.div>
      )}
      </div>

      {/* Current Active Wallet */}
      <motion.div 
        style={{...styles.card, position: 'relative', zIndex: 16}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hover-lift"
      >
        <div style={styles.cardGlow} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Key size={20} color="white" />
            </div>
            Active Treasury Wallet
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: fallbackEnabled 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            borderRadius: '999px',
            border: fallbackEnabled 
              ? '1px solid rgba(34, 197, 94, 0.3)' 
              : '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: fallbackEnabled ? '#22c55e' : '#ef4444'
          }}>
            <span>Fallback: {fallbackEnabled ? 'ON' : 'OFF'}</span>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                // defaultValue={treasury?.fallbackEnabled}
                checked={fallbackEnabled}
                onChange={toggleFallback}
                style={{ display: 'none' }}
              />
              <div style={{
                ...styles.toggle,
                width: '36px',
                height: '20px',
                background: fallbackEnabled ? '#22c55e' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  ...styles.toggleThumb,
                  width: '16px',
                  height: '16px',
                  transform: fallbackEnabled ? 'translateX(18px)' : 'translateX(2px)'
                }} />
              </div>
            </label>
          </div>
        </div>
        
        {treasury?.activeWallet ? (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <div>
                <h4 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Key size={18} />
                  {treasury?.activeWallet?.publicKey?.slice(0, 8)}...{treasury?.activeWallet?.publicKey?.slice(-6)}
                </h4>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '0.25rem'
                }}>
                  {treasury?.activeWallet.type === 'primary' ? 'Primary Wallet' : 'Fallback Wallet'}
                  {treasury?.activeWallet.lastUsed && ` • Last used: ${new Date(treasury?.activeWallet?.lastUsed).toLocaleDateString()}`}
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <motion.button
                  onClick={() => {
                    fetchTreasuryData();
                    setLastRefresh(new Date());
                  }}
                  style={{
                    ...styles.neonButton,
                    padding: '0.5rem 1rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    color: '#3b82f6'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={16} />
                  Refresh
                </motion.button>
                
                <div style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '999px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#22c55e',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  Active
                </div>
              </div>
            </div>
            
            {/* Last Updated Info */}
            <div style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock size={16} />
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '0.75rem' }}>Auto-refresh</span>
                <div style={{
                  ...styles.toggle,
                  width: '32px',
                  height: '18px',
                  background: autoRefresh ? '#22c55e' : 'rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    ...styles.toggleThumb,
                    width: '14px',
                    height: '14px',
                    transform: autoRefresh ? 'translateX(16px)' : 'translateX(2px)'
                  }} />
                </div>
              </label>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginTop: '1rem'
            }}>
              {Object.entries(treasury?.activeWallet?.balances || {}).map(([token, balance]) => (
                <motion.div 
                  key={token}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    background: 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {thresholds[token] && balance < thresholds[token] && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      padding: '0.25rem 0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      color: '#ef4444'
                    }}>
                      <AlertTriangle size={14} />
                      <span>Low</span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600',
                        marginBottom: '0.25rem'
                      }}>
                        {token}
                      </p>
                      <p style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {formatCurrency(balance, token)}
                      </p>
                    </div>
                    
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: `linear-gradient(135deg, ${
                        token === 'SOL' ? '#9945FF' :
                        token === 'ETH' ? '#627EEA' :
                        token === 'USDC' ? '#2775CA' :
                        '#a855f7'
                      } 0%, ${
                        token === 'SOL' ? '#14F195' :
                        token === 'ETH' ? '#8A92B2' :
                        token === 'USDC' ? '#2EBAC6' :
                        '#ec4899'
                      } 100%)`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Wallet size={24} color="white" />
                    </div>
                  </div>
                  
                  <div style={{ 
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: 'rgba(255, 255, 255, 0.6)',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>Threshold:</span>
                      <span style={{ fontWeight: '500' }}>
                        {thresholds[token] ? formatCurrency(thresholds[token], token) : 'Not set'}
                      </span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem',
            color: 'rgba(255, 255, 255, 0.4)'
          }}>
            <Key size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No active wallet configured</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Add a wallet and set it as active
            </p>
          </div>
        )}
      </motion.div>

      {/* Add New Wallet */}
      <motion.div 
        style={{
          ...styles.card, 
          position: 'relative', 
          zIndex: 16,
          overflow: 'visible',
          minWidth: '0'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hover-lift"
      >
        <div style={styles.cardGlow} />
        
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Lock size={20} color="white" />
          </div>
          Add New Wallet
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem',
          padding: '0.5rem',
          overflow: 'visible',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: '1rem'
          }
        }}>
          <div style={{ minWidth: '0', overflow: 'visible' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '0.5rem'
            }}>
              Public Key
            </label>
            <input
              type="text"
              placeholder="Wallet address"
              value={newWallet.publicKey}
              onChange={(e) => handlePublicKeyChange(e.target.value)}
              style={{
                ...styles.input,
                borderColor: publicKeyValidation.valid === null ? 'rgba(255, 255, 255, 0.2)' : 
                             publicKeyValidation.valid ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
                boxShadow: publicKeyValidation.valid === null ? 'none' : 
                           publicKeyValidation.valid ? '0 0 0 1px rgba(34, 197, 94, 0.3)' : '0 0 0 1px rgba(239, 68, 68, 0.3)',
                minWidth: '0',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            {/* Real-time validation feedback */}
            {publicKeyValidation.valid === false && (
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(239, 68, 68, 0.8)',
                marginTop: '0.25rem',
                fontStyle: 'italic'
              }}>
                ⚠️ {publicKeyValidation.error}
              </p>
            )}
            {publicKeyValidation.valid === true && (
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(34, 197, 94, 0.8)',
                marginTop: '0.25rem',
                fontStyle: 'italic'
              }}>
                ✅ Valid Solana address
              </p>
            )}
          </div>
          
          <div style={{ minWidth: '0', overflow: 'visible' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Private Key</span>
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem'
                }}
              >
                {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPrivateKey ? 'Hide' : 'Show'}
              </button>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPrivateKey ? "text" : "password"}
                placeholder="Private key"
                value={newWallet.privateKey}
                onChange={(e) => handlePrivateKeyChange(e.target.value)}
                style={{ 
                  ...styles.input, 
                  paddingRight: '3rem',
                  borderColor: privateKeyValidation.valid === null ? 'rgba(255, 255, 255, 0.2)' : 
                               privateKeyValidation.valid ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
                  boxShadow: privateKeyValidation.valid === null ? 'none' : 
                             privateKeyValidation.valid ? '0 0 0 1px rgba(34, 197, 94, 0.3)' : '0 0 0 1px rgba(239, 68, 68, 0.3)',
                  minWidth: '0',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <Lock 
                size={18} 
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255, 255, 255, 0.3)'
                }} 
              />
            </div>
            {/* Real-time validation feedback */}
            {privateKeyValidation.valid === false && (
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(239, 68, 68, 0.8)',
                marginTop: '0.25rem',
                fontStyle: 'italic'
              }}>
                ⚠️ {privateKeyValidation.error}
              </p>
            )}
            {privateKeyValidation.valid === true && (
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(34, 197, 94, 0.8)',
                marginTop: '0.25rem',
                fontStyle: 'italic'
              }}>
                ✅ Valid private key format
              </p>
            )}
            <p style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '0.25rem',
              fontStyle: 'italic'
            }}>
              Format: 64-number array [1,2,3...] or base58 string from wallet export
            </p>
          </div>
          
          <div style={{ minWidth: '0', overflow: 'visible' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '0.5rem'
            }}>
                            Wallet Type
            </label>
            <select
              value={newWallet.type}
              onChange={(e) => setNewWallet({ ...newWallet, type: e.target.value })}
              style={{
                ...styles.input,
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1em 1em',
                paddingRight: '3rem',
                minWidth: '0',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <option value="primary">Primary</option>
              <option value="fallback">Fallback</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', minWidth: '0', overflow: 'visible' }}>
            <motion.button
              onClick={addNewWallet}
              disabled={!newWallet.publicKey || !newWallet.privateKey || !publicKeyValidation.valid || !privateKeyValidation.valid}
              style={{
                ...styles.neonButton,
                background: publicKeyValidation.valid && privateKeyValidation.valid 
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'  // Green when valid
                  : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', // Purple when invalid
                border: 'none',
                color: 'white',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: '600',
                width: '100%',
                opacity: (!newWallet.publicKey || !newWallet.privateKey || !publicKeyValidation.valid || !privateKeyValidation.valid) ? 0.5 : 1
              }}
              whileHover={{ scale: publicKeyValidation.valid && privateKeyValidation.valid ? 1.02 : 1 }}
              whileTap={{ scale: publicKeyValidation.valid && privateKeyValidation.valid ? 0.98 : 1 }}
            >
              {publicKeyValidation.valid && privateKeyValidation.valid ? '✅ Add Wallet' : 'Add Wallet'}
            </motion.button>
          </div>
        </div>
        
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '12px',
          borderLeft: '3px solid #ef4444',
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <strong>Security Note:</strong> Private keys are transmitted over HTTPS and encrypted using AES-256 
          on the backend server before database storage. They are never stored in plaintext. Keys are only 
          decrypted in memory during transaction signing and immediately purged after use.
        </div>
      </motion.div>

      {/* Wallet Management */}
      <motion.div 
        style={{...styles.card, position: 'relative', zIndex: 16}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hover-lift"
      >
        <div style={styles.cardGlow} />
        
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <RotateCw size={24} style={{ color: '#a855f7' }} />
          Wallet Rotation
        </h3>
        
        {treasury?.wallets?.length > 0 ? (
          <div style={{ 
            overflowX: 'auto',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.01)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: 'rgba(168,85,247,0.07)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Wallet</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Private Key</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {treasury?.wallets?.map((wallet) => (
                  <tr key={wallet._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>
                      {wallet?.publicKey?.slice(0,8)}...{wallet?.publicKey?.slice(-6)}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        background: (wallet.type === 'primary' || wallet.type==="fallback") 
                          ? 'rgba(59, 130, 246, 0.1)' 
                          : 'rgba(139, 92, 246, 0.1)',
                        color: (wallet.type === 'primary' || wallet.type==="fallback") ? '#3b82f6' : '#19085cff',
                        border: `1px solid ${(wallet.type === 'primary' || wallet.type==="fallback") 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : 'rgba(139, 92, 246, 0.3)'}`,
                        fontSize: '0.75rem'
                      }}>
                        {wallet?.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: wallet._id === treasury?.activeWallet?._id 
                            ? '#22c55e' 
                            : '#6b7280'
                        }} />
                        <span>
                          {/* {wallet._id === treasury?.activeWallet?._id 
                            ? 'Active' 
                            : wallet.type === 'fallback' && treasury?.fallbackEnabled 
                              ? 'Standby' 
                              : 'Inactive'} */}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {treasury?.activeWallet?.privateKeyCorrupted ? (
                          <div style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <AlertTriangle size={12} />
                            Corrupted
                          </div>
                        ) : (
                          <div style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            color: '#22c55e',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <Check size={12} />
                            Valid
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {wallet?.type === 'primary' && wallet?._id !== treasury?.activeWallet?._id && (
                          <motion.button
                            onClick={() => setActiveWallet(wallet?._id,"primary")}
                            style={{
                              ...styles.neonButton,
                              padding: '0.5rem 1rem',
                              background: 'rgba(59, 130, 246, 0.1)',
                              borderColor: 'rgba(59, 130, 246, 0.3)',
                              color: '#3b82f6',
                              fontSize: '0.75rem'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Set Active
                          </motion.button>
                        )}
                        
                                                 {wallet.type === 'fallback' && wallet._id !== treasury.fallbackWallet?._id && (
                           <motion.button
                             onClick={() => setActiveWallet(wallet?._id,"fallback")}
                             style={{
                               ...styles.neonButton,
                               padding: '0.5rem 1rem',
                               background: 'rgba(139, 92, 246, 0.1)',
                               borderColor: 'rgba(139, 92, 246, 0.3)',
                               color: '#8b5cf6',
                               fontSize: '0.75rem'
                             }}
                             whileHover={{ scale: 1.05 }}
                             whileTap={{ scale: 0.95 }}
                           >
                             Set Fallback
                           </motion.button>
                         )}
                         
                         
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem',
            color: 'rgba(255, 255, 255, 0.4)'
          }}>
            <Wallet size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No wallets configured</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Add a wallet using the form above
            </p>
          </div>
        )}
      </motion.div>

      {/* Balance Thresholds */}
      <motion.div 
        style={{...styles.card, position: 'relative', zIndex: 16}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hover-lift"
      >
        <div style={styles.cardGlow} />
        
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Bell size={24} style={{ color: '#a855f7' }} />
          Balance Thresholds
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* {Object.keys(treasury?.activeWallet?.balances || {}).map(token => (
            <div key={token}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '0.5rem'
              }}>
                {token} Minimum
              </label>
              <input
                type="number"
                value={thresholds[token] || ''}
                onChange={(e) => setThresholds({
                  ...thresholds,
                  [token]: Number(e.target.value)
                })}
                style={styles.input}
                min="0"
                step="0.000001"
                placeholder="Set threshold"
              />
            </div>
          ))} */}
        </div>
        
        <motion.button
          onClick={updateThresholds}
          style={{
            ...styles.neonButton,
            borderColor: '#22c55e',
            color: '#22c55e',
            background: 'rgba(34, 197, 94, 0.1)',
            marginTop: '2rem',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            width: '100%'
          }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)'
          }}
          whileTap={{ scale: 0.98 }}
        >
          Update Thresholds
        </motion.button>
      </motion.div>

      {/* Audit Logs */}
      <motion.div 
        style={{...styles.card, position: 'relative', zIndex: 16}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hover-lift"
      >
        <div style={styles.cardGlow} />
        
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Audit Logs
        </h3>
        
        {treasury?.logs?.length > 0 ? (
          <div style={{ 
            overflowX: 'auto',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.01)',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: 'rgba(168,85,247,0.07)', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Admin</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Action</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Wallet</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {treasury?.logs?.map(log => (
                  <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem' }}>{log.admin}</td>
                    <td style={{ padding: '0.75rem' }}>{log.action}</td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>
                      {log.walletPublicKey ? `${log.walletPublicKey.slice(0,4)}...${log.walletPublicKey.slice(-4)}` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem',
            color: 'rgba(255, 255, 255, 0.4)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, margin: '0 auto 1rem' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p>No audit logs available</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
export default TreasuryManagement
