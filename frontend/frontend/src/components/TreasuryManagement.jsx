import { Key, Lock, RotateCw, Bell, AlertTriangle } from 'lucide-react';
import { useState ,useEffect} from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { styles } from '../styles/Admin-dashbaord.styles.js';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Activity, 
  Settings, Award, RefreshCw, LogOut, Copy, Check,
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
 // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  // Format currency
  const formatCurrency = (amount, token) => {
    if (token === 'SOL' || token === 'ETH') {
      return amount.toFixed(6);
    }
    return formatNumber(amount.toFixed(2));
  };
  const fetchTreasuryData = async () => {
    setLoading(true);
    try {
    //   const response = await adminApi.get('/treasury');
      setTreasury({
    "activeWallet": {
      "_id": "wallet_primary_1",
      "publicKey": "4t7e9V8g3h2J5kL6pO0iU1yT2r3E4w5Q6",
      "type": "primary",
      "enabledTokens": {
        "SOL": true,
        "ETH": true,
        "USDC": true,
        "BTC": false
      },
      "balances": {
        "SOL": 25.6321,
        "ETH": 3.4215,
        "USDC": 12500.75
      },
      "lastUsed": "2023-10-15T14:30:00Z"
    },
    "fallbackWallet": {
      "_id": "wallet_fallback_1",
      "publicKey": "7b3c8X1d9e4A5s6D7f8G9h0J1k2L3z4",
      "type": "fallback",
      "enabledTokens": {
        "SOL": true,
        "ETH": false,
        "USDC": true,
        "BTC": false
      },
      "balances": {
        "SOL": 15.0000,
        "USDC": 5000.00
      },
      "lastUsed": "2023-09-20T09:15:00Z"
    },
    "fallbackEnabled": true,
    "thresholds": {
      "SOL": 10,
      "ETH": 1,
      "USDC": 1000,
      "BTC": 0.1
    },
    "wallets": [
      {
        "_id": "wallet_primary_1",
        "publicKey": "4t7e9V8g3h2J5kL6pO0iU1yT2r3E4w5Q6",
        "type": "primary",
        "enabledTokens": {
          "SOL": true,
          "ETH": true,
          "USDC": true,
          "BTC": false
        },
        "createdAt": "2023-08-10T12:00:00Z"
      },
      {
        "_id": "wallet_fallback_1",
        "publicKey": "7b3c8X1d9e4A5s6D7f8G9h0J1k2L3z4",
        "type": "fallback",
        "enabledTokens": {
          "SOL": true,
          "ETH": false,
          "USDC": true,
          "BTC": false
        },
        "createdAt": "2023-08-15T14:00:00Z"
      },
      {
        "_id": "wallet_primary_2",
        "publicKey": "9a2b4Y6c8d0Z1x3C5v6B7n8M9q0W1e2R",
        "type": "primary",
        "enabledTokens": {
          "SOL": false,
          "ETH": true,
          "USDC": false,
          "BTC": true
        },
        "createdAt": "2023-10-01T10:30:00Z"
      }
    ],
    "logs": [
      {
        "_id": "log_1",
        "admin": "superadmin@example.com",
        "action": "Set active wallet",
        "walletPublicKey": "4t7e9V8g3h2J5kL6pO0iU1yT2r3E4w5Q6",
        "timestamp": "2023-10-15T14:30:00Z"
      },
      {
        "_id": "log_2",
        "admin": "admin@example.com",
        "action": "Added new wallet",
        "walletPublicKey": "9a2b4Y6c8d0Z1x3C5v6B7n8M9q0W1e2R",
        "timestamp": "2023-10-01T10:30:00Z"
      },
      {
        "_id": "log_3",
        "admin": "superadmin@example.com",
        "action": "Set fallback wallet",
        "walletPublicKey": "7b3c8X1d9e4A5s6D7f8G9h0J1k2L3z4",
        "timestamp": "2023-09-20T09:15:00Z"
      },
      {
        "_id": "log_4",
        "admin": "admin@example.com",
        "action": "Updated thresholds",
        "walletPublicKey": null,
        "timestamp": "2023-09-15T16:45:00Z"
      }
    ]
  })
    //   setThresholds(response.data.data.thresholds || {});
    } catch (err) {
      setError('Failed to fetch treasury data');
    } finally {
      setLoading(false);
    }
  };

  const addNewWallet = async () => {
    try {
      await adminApi.post('/treasury/wallets', newWallet);
      setSuccess('Wallet added successfully!');
      setNewWallet({ publicKey: '', privateKey: '', type: 'primary', tokens: {} });
      fetchTreasuryData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add wallet');
    }
  };

  const setActiveWallet = async (walletId) => {
    try {
      await adminApi.put('/treasury/wallets/active', { walletId });
      setSuccess('Active wallet updated!');
      fetchTreasuryData();
    } catch (err) {
      setError('Failed to set active wallet');
    }
  };

  const setFallbackWallet = async (walletId) => {
    try {
      await adminApi.put('/treasury/wallets/fallback', { walletId });
      setSuccess('Fallback wallet updated!');
      fetchTreasuryData();
    } catch (err) {
      setError('Failed to set fallback wallet');
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
    adminApi.put(`/treasury/wallets/${walletId}/tokens`, {
      token,
      enabled: !treasury?.wallets?.find(w => w._id === walletId).enabledTokens[token]
    });
  };

  const updateThresholds = async () => {
    try {
      await adminApi.put('/treasury/thresholds', { thresholds });
      setSuccess('Thresholds updated successfully!');
    } catch (err) {
      setError('Failed to update thresholds');
    }
  };

  const toggleFallback = async () => {
    try {
      await adminApi.put('/treasury/fallback', { enabled: !treasury.fallbackEnabled });
      setTreasury({ ...treasury, fallbackEnabled: !treasury.fallbackEnabled });
      setSuccess(`Fallback ${!treasury.fallbackEnabled ? 'enabled' : 'disabled'}!`);
    } catch (err) {
      setError('Failed to toggle fallback');
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
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* Current Active Wallet */}
      <motion.div 
        style={styles.card}
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
            background: treasury?.fallbackEnabled 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            borderRadius: '999px',
            border: treasury?.fallbackEnabled 
              ? '1px solid rgba(34, 197, 94, 0.3)' 
              : '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: treasury?.fallbackEnabled ? '#22c55e' : '#ef4444'
          }}>
            <span>Fallback: {treasury?.fallbackEnabled ? 'ON' : 'OFF'}</span>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={treasury?.fallbackEnabled}
                onChange={toggleFallback}
                style={{ display: 'none' }}
              />
              <div style={{
                ...styles.toggle,
                width: '36px',
                height: '20px',
                background: treasury?.fallbackEnabled ? '#22c55e' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  ...styles.toggleThumb,
                  width: '16px',
                  height: '16px',
                  transform: treasury?.fallbackEnabled ? 'translateX(18px)' : 'translateX(2px)'
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
                  {treasury?.activeWallet.publicKey.slice(0, 8)}...{treasury?.activeWallet?.publicKey.slice(-6)}
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
                  onClick={() => fetchTreasuryData()}
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
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginTop: '1rem'
            }}>
              {Object.entries(treasury?.activeWallet?.balances).map(([token, balance]) => (
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
        style={styles.card}
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
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
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
              onChange={(e) => setNewWallet({ ...newWallet, publicKey: e.target.value })}
              style={styles.input}
            />
          </div>
          
          <div>
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
                onChange={(e) => setNewWallet({ ...newWallet, privateKey: e.target.value })}
                style={{ ...styles.input, paddingRight: '3rem' }}
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
          </div>
          
          <div>
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
                paddingRight: '3rem'
              }}
            >
              <option value="primary">Primary</option>
              <option value="fallback">Fallback</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <motion.button
              onClick={addNewWallet}
              disabled={!newWallet.publicKey || !newWallet.privateKey}
              style={{
                ...styles.neonButton,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                border: 'none',
                color: 'white',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: '600',
                width: '100%',
                opacity: (!newWallet.publicKey || !newWallet.privateKey) ? 0.5 : 1
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add Wallet
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
          <strong>Security Note:</strong> Private keys are encrypted using AES-256 immediately upon submission 
          and never stored in plaintext. They are only decrypted in memory during transaction signing and 
          immediately purged after use.
        </div>
      </motion.div>

      {/* Wallet Management */}
      <motion.div 
        style={styles.card}
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
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Tokens</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {treasury?.wallets?.map((wallet) => (
                  <tr key={wallet._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>
                      {wallet.publicKey.slice(0,8)}...{wallet.publicKey.slice(-6)}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        background: wallet.type === 'primary' 
                          ? 'rgba(59, 130, 246, 0.1)' 
                          : 'rgba(139, 92, 246, 0.1)',
                        color: wallet.type === 'primary' ? '#3b82f6' : '#8b5cf6',
                        border: `1px solid ${wallet.type === 'primary' 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : 'rgba(139, 92, 246, 0.3)'}`,
                        fontSize: '0.75rem'
                      }}>
                        {wallet.type}
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
                          {wallet._id === treasury?.activeWallet?._id 
                            ? 'Active' 
                            : wallet.type === 'fallback' && treasury?.fallbackEnabled 
                              ? 'Standby' 
                              : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {Object.entries(wallet.enabledTokens).map(([token, enabled]) => (
                          <button
                            key={token}
                            onClick={() => toggleToken(token, wallet._id)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '999px',
                              background: enabled 
                                ? 'rgba(34, 197, 94, 0.1)' 
                                : 'rgba(239, 68, 68, 0.1)',
                              color: enabled ? '#22c55e' : '#ef4444',
                              border: `1px solid ${enabled 
                                ? 'rgba(34, 197, 94, 0.3)' 
                                : 'rgba(239, 68, 68, 0.3)'}`,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                          >
                            {token}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {wallet?.type === 'primary' && wallet?._id !== treasury?.activeWallet?._id && (
                          <motion.button
                            onClick={() => setActiveWallet(wallet?._id)}
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
                            onClick={() => setFallbackWallet(wallet._id)}
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
        style={styles.card}
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
          {Object.keys(treasury?.activeWallet?.balances || {}).map(token => (
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
          ))}
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
        style={styles.card}
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
