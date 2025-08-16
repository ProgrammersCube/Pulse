import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Gift, History, TrendingUp, Copy, Check, 
  Share2, Award, Wallet, Calendar, ArrowUpRight,
  User, UserPlus, Clock, RefreshCw, AlertCircle,
  Shield, Eye, EyeOff, LogIn,
  Twitter, Instagram, MessageSquare, Smartphone, 
  Facebook, MessageCircle, Youtube, Link, Mail
} from 'lucide-react';
import { styles } from '../styles/Referall-dashboard.styles';
import { useAppKitAccount } from '@reown/appkit/react';
const ReferralDashboard = () => {
  const { address, isConnected,embeddedWalletInfo } = useAppKitAccount();
  const [userType, setUserType] = useState('guest'); // 'guest' or 'registered'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [focusedInput, setFocusedInput] = useState('');
  useEffect(()=>{
    if(!isConnected && !address) return;
    console.log(isConnected)
    console.log(address)
  },[])
  // Mock data - replace with actual API calls
  const [referralData, setReferralData] = useState({
    totalReferrals: 24,
    totalBonusEarned: 156.75,
    bonusToken: 'BeTyche',
    referralCode: 'PULSE2025',
    referralHistory: [
      { id: 1, wallet: '0x742d35Cc6635C0532925a3b8D4c3D3e8f7c1234A', date: '2024-01-15', bonusEarned: 10.50 },
      { id: 2, wallet: '0x8b5cf6A9d3E2B7C4F1A8D3E2B7C4F1A8D3E2B7C5', date: '2024-01-14', bonusEarned: 15.25 },
      { id: 3, wallet: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t', date: '2024-01-13', bonusEarned: 8.75 },
      { id: 4, wallet: '0x9f8e7d6c5b4a39281736455463728190abcdef12', date: '2024-01-12', bonusEarned: 12.00 },
      { id: 5, wallet: '0x5a4b3c2d1e0f9g8h7i6j5k4l3m2n1o0p9q8r7s6t', date: '2024-01-11', bonusEarned: 20.25 }
    ]
  });

  // Login form for registered users
  const [loginForm, setLoginForm] = useState({ 
    walletAddress: '', 
    signature: '' 
  });
  const [showSignature, setShowSignature] = useState(false);

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

  // Mock API calls
  const fetchReferralData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock different data based on user type
      if (userType === 'registered') {
        setReferralData(prev => ({
          ...prev,
          totalReferrals: 34,
          totalBonusEarned: 245.50
        }));
      }
    } catch (error) {
      setError('Failed to fetch referral data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUserType('registered');
      setSuccess('Successfully logged in!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  const formatCurrency = (amount) => {
    return amount.toFixed(2);
  };

  if (loading && userType === 'guest') {
    return (
      <div style={styles.container}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem'
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
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading referral dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background effects */}
      <div style={styles.backgroundEffects}>
        <div style={{
          ...styles.glowOrb,
          width: '500px',
          height: '500px',
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
              <Share2 size={24} color="white" />
            </motion.div>
            <div>
              <h1 style={styles.logoText}>REFERRAL DASHBOARD</h1>
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'rgba(255, 255, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {userType === 'registered' ? (
                  <>
                    <User size={14} />
                    Registered User
                  </>
                ) : (
                  <>
                    <Eye size={14} />
                    {embeddedWalletInfo?.authProvider?"Registered User":"Guest User"}
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <motion.button
              onClick={() => fetchReferralData(true)}
              disabled={refreshing}
              style={{
                ...styles.neonButton,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.8)',
                padding: '0.625rem'
              }}
              whileHover={{ scale: 1.05, borderColor: '#a855f7' }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw 
                size={20} 
                style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
              />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Alerts */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            style={{
              ...styles.alert,
              background: error 
                ? 'rgba(239, 68, 68, 0.1)' 
                : 'rgba(34, 197, 94, 0.1)',
              border: `1px solid ${error ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
              color: error ? '#ef4444' : '#22c55e'
            }}
          >
            <AlertCircle size={20} />
            <span>{error || success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        position: 'relative',
        zIndex: 1
      }}>
        <AnimatePresence mode="wait">
          {userType === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
              }}
            >
              <motion.div 
                style={{
                  ...styles.card,
                  maxWidth: '500px',
                  width: '100%'
                }}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="hover-lift"
              >
                <div style={styles.cardGlow} />
                
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 1.5rem',
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      borderRadius: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 40px rgba(168, 85, 247, 0.5)'
                    }}
                  >
                    <User size={40} color="white" />
                  </motion.div>
                  
                  <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    LOGIN TO ACCESS
                  </h2>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    View your complete referral history
                  </p>
                </div>
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}>
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      style={{
                        ...styles.input,
                        fontFamily: 'monospace',
                        ...(focusedInput === 'wallet' ? styles.inputFocus : {})
                      }}
                      value={loginForm.walletAddress}
                      onChange={(e) => setLoginForm({...loginForm, walletAddress: e.target.value})}
                      onFocus={() => setFocusedInput('wallet')}
                      onBlur={() => setFocusedInput('')}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}>
                      Signature
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showSignature ? "text" : "password"}
                        placeholder="Enter signature"
                        style={{
                          ...styles.input,
                          paddingRight: '3rem',
                          fontFamily: 'monospace',
                          ...(focusedInput === 'signature' ? styles.inputFocus : {})
                        }}
                        value={loginForm.signature}
                        onChange={(e) => setLoginForm({...loginForm, signature: e.target.value})}
                        onFocus={() => setFocusedInput('signature')}
                        onBlur={() => setFocusedInput('')}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignature(!showSignature)}
                        style={{
                          position: 'absolute',
                          right: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255, 255, 255, 0.6)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#a855f7'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                      >
                        {showSignature ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <motion.button
                      type="button"
                      onClick={() => setUserType('guest')}
                      style={{
                        ...styles.neonButton,
                        flex: 1,
                        justifyContent: 'center',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back to Guest View
                    </motion.button>
                    
                    <motion.button 
                      type="submit"
                      disabled={loading}
                      style={{
                        ...styles.neonButton,
                        flex: 1,
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                        border: 'none',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)'
                      }}
                      whileHover={{ 
                        scale: 1.02, 
                        boxShadow: '0 6px 30px rgba(168, 85, 247, 0.6)' 
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      ) : (
                        'LOGIN'
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {(userType === 'guest' || userType === 'registered') && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              {/* Stats Grid */}
              <div style={styles.statsGrid}>
                <StatCard 
                  title="Total Referrals" 
                  value={formatNumber(referralData.totalReferrals)}
                  icon={Users}
                  color="#3b82f6"
                  trend={8.5}
                />
                <StatCard 
                  title="Total Bonus Earned" 
                  value={`${formatCurrency(referralData.totalBonusEarned)} ${referralData.bonusToken}`}
                  icon={Gift}
                  color="#22c55e"
                  trend={12.3}
                />
                <StatCard 
                  title="Referral Code" 
                  value={referralData.referralCode}
                  icon={Award}
                  color="#a855f7"
                  copyable={true}
                  onCopy={() => copyToClipboard(referralData.referralCode, 'code')}
                  copied={copiedCode === 'code'}
                />
              </div>

              {/* Share Section */}
              <motion.div 
                style={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="hover-lift"
              >
                <div style={styles.cardGlow} />
                
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Share2 size={20} color="white" />
                  </div>
                  Share Your Referral Code
                </h3>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      flex: 1,
                      padding: '1rem 1.25rem',
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '2px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '12px',
                      fontFamily: 'monospace',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#a855f7',
                      textAlign: 'center',
                      letterSpacing: '0.1em'
                    }}>
                      {referralData.referralCode}
                    </div>
                    
                    <motion.button
                      onClick={() => copyToClipboard(referralData.referralCode, 'share')}
                      style={{
                        ...styles.neonButton,
                        borderColor: copiedCode === 'share' ? '#22c55e' : '#a855f7',
                        color: copiedCode === 'share' ? '#22c55e' : '#a855f7',
                        background: copiedCode === 'share' 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(168, 85, 247, 0.1)',
                        padding: '1rem'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {copiedCode === 'share' ? <Check size={20} /> : <Copy size={20} />}
                    </motion.button>
                  </div>
                  
                  {/* <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textAlign: 'center'
                  }}>
                    Share this code with friends to earn referral bonuses when they register!
                  </p> */}
                
<div style={{ marginTop: '1.5rem' }}>
   <h4 style={{ 
    fontSize: '1rem', 
    fontWeight: 500, 
    marginBottom: '1rem',
    color: 'rgba(255, 255, 255, 0.7)'
  }}>
    Refer a friend and you both get 1,000 BeTyche/RADBRO
  </h4>
  <h4 style={{ 
    fontSize: '1rem', 
    fontWeight: 500, 
    marginBottom: '1rem',
    color: 'rgba(255, 255, 255, 0.7)'
  }}>
    Share via:
  </h4>
  
  <div style={styles.socialGrid}>
    {/* Twitter */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#1DA1F2' }
      }}
      onClick={() => window.open(`https://twitter.com/intent/tweet?text=Join%20me%20on%20PulseChain!%20Use%20my%20referral%20code%3A%20${referralData.referralCode}&url=https%3A%2F%2Fpulsechain.com`, '_blank')}
    >
      <Twitter size={24} color="#1DA1F2" />
    </motion.div>
    
    {/* Instagram */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#E1306C' }
      }}
      onClick={() => copyToClipboard(`Join me on PulseChain! Use my referral code: ${referralData.referralCode}`, 'instagram')}
    >
      <Instagram size={24} color="#E1306C" />
    </motion.div>
    
    {/* TikTok */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#000000' }
      }}
      onClick={() => copyToClipboard(`Join me on PulseChain! Use my referral code: ${referralData.referralCode}`, 'tiktok')}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="white"/>
      </svg>
    </motion.div>
    
    {/* Telegram */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#0088cc' }
      }}
      onClick={() => window.open(`https://t.me/share/url?url=https://pulsechain.com&text=Join%20me%20on%20PulseChain!%20Use%20my%20referral%20code%3A%20${referralData.referralCode}`, '_blank')}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.14.141-.259.259-.374.261l.213-3.053 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.136-.954l11.566-4.458c.538-.196 1.006.128.832.941z" fill="#0088cc"/>
      </svg>
    </motion.div>
    
    {/* WhatsApp */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#25D366' }
      }}
      onClick={() => window.open(`https://api.whatsapp.com/send?text=Join%20me%20on%20PulseChain!%20Use%20my%20referral%20code%3A%20${referralData.referralCode}%20https%3A%2F%2Fpulsechain.com`, '_blank')}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/>
      </svg>
    </motion.div>
    
    {/* Discord */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#7289da' }
      }}
      onClick={() => copyToClipboard(`Join me on PulseChain! Use my referral code: ${referralData.referralCode}`, 'discord')}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M18.942 5.556a16.299 16.299 0 00-4.126-1.297c-.178.321-.385.754-.529 1.097a15.175 15.175 0 00-4.573 0c-.144-.343-.352-.776-.529-1.097a16.274 16.274 0 00-4.129 1.301c-2.611 3.946-3.327 7.808-2.973 11.575a16.494 16.494 0 005.061 2.593c.406-.55.766-1.136 1.072-1.752a10.637 10.637 0 01-1.69-.817c.141-.103.281-.216.415-.328.99.451 2.073.773 3.208.94.23.035.353.039.527.039.405-.006.814-.034 1.222-.082 2.98-.367 5.786-1.502 5.786-1.502 0-2.947-1.286-5.337-1.286-5.337-2.569.477-3.565.779-3.565.779l-.146-.186c1.649-.484 3.212-1.387 3.212-1.387-1.013-.684-2.121-1.041-3.261-1.246-.88-.133-1.802-.102-2.707.073-.765.146-1.515.399-2.222.75-.019.01-.037.03-.056.04-.047.025-.094.049-.14.075-.65.359-1.24.803-1.75 1.315-1.7 1.727-2.153 4.149-1.597 6.403a16.368 16.368 0 005.064 2.51c.411-.556.774-1.147 1.084-1.767a10.716 10.716 0 01-1.692-.831c.143-.106.284-.219.42-.333.996.457 2.087.782 3.232.952.231.034.465.05.698.05.402 0 .805-.024 1.208-.07 3.0-.365 5.833-1.497 5.833-1.497-.105-3.323-1.41-6.005-1.41-6.005-2.552.477-3.576.782-3.576.782l-.186-.249c1.65-.487 3.22-1.392 3.22-1.392zm-8.678 10.227c-.991 0-1.8-.902-1.8-2.001 0-1.1.79-2.001 1.8-2.001 1.004 0 1.819.902 1.8 2.001 0 1.1-.796 2.001-1.8 2.001zm6.645 0c-.991 0-1.8-.902-1.8-2.001 0-1.1.79-2.001 1.8-2.001 1.004 0 1.819.902 1.8 2.001 0 1.1-.796 2.001-1.8 2.001z" fill="#7289da"/>
      </svg>
    </motion.div>
    
    {/* Reddit */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#FF4500' }
      }}
      onClick={() => window.open(`https://www.reddit.com/submit?url=https://pulsechain.com&title=Join%20me%20on%20PulseChain!%20Use%20my%20referral%20code%3A%20${referralData.referralCode}`, '_blank')}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.5.002l-.001-.002c0-.688.563-1.249 1.251-1.249zm-4.606 4.019a4.055 4.055 0 013.243-1.46c1.25 0 2.41.61 3.243 1.6.1.12.119.28.047.415-.07.135-.22.215-.37.203-.33-.01-.65-.52-1.14-1.18-1.14-.65 0-1.17.52-1.17 1.17 0 .65.52 1.17 1.17 1.17.33 0 .62-.13.83-.35a.98.98 0 00.35-.78c0-.65-.52-1.17-1.16-1.17-.41 0-.79.21-1.0.55-.21.34-.18.78.08 1.08.46.55 1.25.59 1.78.13.52-.46.55-1.26.08-1.81-.28-.33-.67-.48-1.07-.48-.13 0-.25.02-.38.06-.03 0-.06.01-.1.03-.18.07-.23.26-.16.41.2.31.31.65.31 1.04 0 .78-.54 1.42-1.27 1.58-.73.16-1.46-.2-1.81-.77-.36-.57-.32-1.31.11-1.85.43-.54 1.15-.73 1.75-.53.06.02.12.05.18.08l.01-.02c.01 0 .01 0 .02.01.18.1.23.33.12.51z" fill="#FF4500"/>
      </svg>
    </motion.div>
    
    {/* Facebook */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#1877F2' }
      }}
      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fpulsechain.com&quote=Join%20me%20on%20PulseChain!%20Use%20my%20referral%20code%3A%20${referralData.referralCode}`, '_blank')}
    >
      <Facebook size={24} color="#1877F2" />
    </motion.div>
    
    {/* iMessage */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#007AFF' }
      }}
      onClick={() => window.open(`sms:?&body=Join%20me%20on%20PulseChain!%20Use%20my%20referral%20code%3A%20${referralData.referralCode}%20https%3A%2F%2Fpulsechain.com`, '_blank')}
    >
      <MessageSquare size={24} color="#007AFF" />
    </motion.div>
    
    {/* SMS */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#20C997' }
      }}
      onClick={() => window.open(`sms:?&body=Join%20me%20on%20PulseChain!%20Use%20my%20referral%20code%3A%20${referralData.referralCode}%20https%3A%2F%2Fpulsechain.com`, '_blank')}
    >
      <Smartphone size={24} color="#20C997" />
    </motion.div>
    
    {/* Messenger */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#006AFF' }
      }}
      onClick={() => window.open(`fb-messenger://share/?link=https%3A%2F%2Fpulsechain.com&app_id=123456789&redirect_uri=https%3A%2F%2Fpulsechain.com&quote=Join%20me%20on%20PulseChain!%20Use%20my%20referral%20code%3A%20${referralData.referralCode}`, '_blank')}
    >
      <MessageCircle size={24} color="#006AFF" />
    </motion.div>
    
    {/* Copy Link */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#a855f7' }
      }}
      onClick={() => copyToClipboard(`https://pulsechain.com/ref/${referralData.referralCode}`, 'link')}
    >
      <Link size={24} color="#a855f7" />
    </motion.div>
    
    {/* Email */}
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        ...styles.socialButton,
        '&:hover': { borderColor: '#ea4335' }
      }}
      onClick={() => window.open(`mailto:?subject=PulseChain%20Referral&body=Join%20me%20on%20PulseChain!%20Use%20my%20referral%20code%3A%20${referralData.referralCode}%20https%3A%2F%2Fpulsechain.com`, '_blank')}
    >
      <Mail size={24} color="#ea4335" />
    </motion.div>
  </div>
</div>
                </div>
              </motion.div>

              {/* Referral History - Only for registered users */}
              {userType === 'registered' && (
                <motion.div 
                  style={styles.card}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
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
                      background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <History size={20} color="white" />
                    </div>
                    Referral History
                  </h3>
                  
                  {referralData.referralHistory.length > 0 ? (
                    <div style={{
                      overflowX: 'auto',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}>
                      <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse', 
                        color: '#fff', 
                        fontSize: '0.95rem' 
                      }}>
                        <thead>
                          <tr style={{ background: 'rgba(168, 85, 247, 0.07)' }}>
                            <th style={{ 
                              padding: '1rem', 
                              textAlign: 'left', 
                              fontWeight: 600,
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                              Referred Wallet
                            </th>
                            <th style={{ 
                              padding: '1rem', 
                              textAlign: 'center', 
                              fontWeight: 600,
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                              Date
                            </th>
                            <th style={{ 
                              padding: '1rem', 
                              textAlign: 'right', 
                              fontWeight: 600,
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                              Bonus Earned
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {referralData.referralHistory.map((entry, index) => (
                            <motion.tr 
                              key={entry.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              style={{ 
                                borderBottom: index < referralData.referralHistory.length - 1 
                                  ? '1px solid rgba(255, 255, 255, 0.04)' 
                                  : 'none',
                                background: index % 2 === 0 
                                  ? 'rgba(255, 255, 255, 0.01)' 
                                  : 'transparent'
                              }}
                            >
                              <td style={{ 
                                padding: '1rem',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Wallet size={16} style={{ color: '#a855f7' }} />
                                  {entry.wallet.slice(0, 8)}...{entry.wallet.slice(-6)}
                                  <button
                                    onClick={() => copyToClipboard(entry.wallet, `wallet-${entry.id}`)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'rgba(255, 255, 255, 0.5)',
                                      cursor: 'pointer',
                                      padding: '0.25rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      transition: 'color 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#a855f7'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
                                  >
                                    {copiedCode === `wallet-${entry.id}` ? 
                                      <Check size={14} /> : 
                                      <Copy size={14} />
                                    }
                                  </button>
                                </div>
                              </td>
                              <td style={{ 
                                padding: '1rem',
                                textAlign: 'center',
                                color: 'rgba(255, 255, 255, 0.7)'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                  <Calendar size={16} style={{ color: '#60a5fa' }} />
                                  {new Date(entry.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </td>
                              <td style={{ 
                                padding: '1rem',
                                textAlign: 'right',
                                fontWeight: 600
                              }}>
                                <div style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.5rem 1rem',
                                  background: 'rgba(34, 197, 94, 0.1)',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(34, 197, 94, 0.2)',
                                  color: '#22c55e'
                                }}>
                                  <Gift size={16} />
                                  +{formatCurrency(entry.bonusEarned)} {referralData.bonusToken}
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '4rem 2rem',
                      color: 'rgba(255, 255, 255, 0.4)'
                    }}>
                      <History size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
                      <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                        No referral history yet
                      </p>
                      <p style={{ fontSize: '0.875rem' }}>
                        Start sharing your referral code to see your earnings here
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Guest User Notice */}
              {userType === 'guest' && (
                <motion.div 
                  style={{
                    ...styles.card,
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="hover-lift"
                >
                  <div style={{
                    ...styles.cardGlow,
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)'
                  }} />
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Shield size={24} color="white" />
                    </div>
                    
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem'
                      }}>
                        Limited Guest View
                      </h3>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.875rem'
                      }}>
                        You're viewing basic referral statistics
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <h4 style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginBottom: '0.5rem'
                      }}>
                        Available
                      </h4>
                      <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        fontSize: '0.875rem'
                      }}>
                        <li style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.25rem'
                        }}>
                          <Check size={14} style={{ color: '#22c55e' }} />
                          Total referrals count
                        </li>
                        <li style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.25rem'
                        }}>
                          <Check size={14} style={{ color: '#22c55e' }} />
                          Total bonus earned
                        </li>
                        <li style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem'
                        }}>
                          <Check size={14} style={{ color: '#22c55e' }} />
                          Referral code sharing
                        </li>
                      </ul>
                    </div>
                    
                    <div style={{
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <h4 style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginBottom: '0.5rem'
                      }}>
                        Login Required
                      </h4>
                      <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        fontSize: '0.875rem'
                      }}>
                        <li style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.25rem',
                          color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                          <History size={14} style={{ color: '#ef4444' }} />
                          Detailed referral history
                        </li>
                        <li style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.25rem',
                          color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                          <Wallet size={14} style={{ color: '#ef4444' }} />
                          Individual wallet addresses
                        </li>
                        <li style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                          <Calendar size={14} style={{ color: '#ef4444' }} />
                          Registration dates
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => setUserType('login')}
                    style={{
                      ...styles.neonButton,
                      width: '100%',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      border: 'none',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      padding: '1rem',
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
                    }}
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: '0 6px 30px rgba(59, 130, 246, 0.5)' 
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <UserPlus size={20} />
                    Login to View Complete History
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Enhanced Stats Card Component
const StatCard = ({ title, value, icon: Icon, color, trend, copyable, onCopy, copied }) => {
  const isPositive = trend > 0;
  
  return (
    <motion.div
      style={{
        ...styles.statCard,
        position: 'relative'
      }}
      className="hover-lift"
      whileHover={{ scale: 1.02 }}
    >
      <div style={{
        ...styles.iconBox,
        background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
        boxShadow: `0 0 30px ${color}40`
      }}>
        <Icon size={28} color="white" />
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.5rem'
      }}>
        <h3 style={{
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          {title}
        </h3>
        
        {copyable && (
          <motion.button
            onClick={onCopy}
            style={{
              background: 'none',
              border: 'none',
              color: copied ? '#22c55e' : 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.3s ease'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={(e) => !copied && (e.currentTarget.style.color = color)}
            onMouseLeave={(e) => !copied && (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)')}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </motion.button>
        )}
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <p style={{
          fontSize: copyable ? '1.5rem' : '2rem',
          fontWeight: 'bold',
          background: `linear-gradient(135deg, white 0%, ${color} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          wordBreak: 'break-all'
        }}>
          {value}
        </p>
        
        {trend !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.75rem',
            background: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: isPositive ? '#22c55e' : '#ef4444'
          }}>
            <TrendingUp size={16} />
            {typeof trend === 'number' ? `+${Math.abs(trend)}%` : trend}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReferralDashboard;