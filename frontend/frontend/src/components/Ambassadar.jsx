import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import CommissionCalculator from "./CommisionCalculator";
import axios from "axios";
import { 
  Home, Users, PieChart, BarChart2, Share2, Calculator, LogOut, 
  Copy, Check, Eye, EyeOff, ArrowUp, ArrowDown, ChevronDown, ChevronUp,
  Zap, Shield, Database, Globe, Wallet, Clock, Award, RefreshCw,AlertCircle,
  Twitter, Facebook, Instagram, MessageCircle, MessageSquareText, Mail, Smartphone,TrendingDown,Settings,Headset,MessageSquare,Phone
} from 'lucide-react';

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    color: 'white',
    fontFamily: "'Inter', sans-serif",
    overflowX: 'hidden',
    position: 'relative'
  },
  
  backgroundEffects: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0
  },
  
  glowOrbPurple: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
    top: '-200px',
    left: '-200px',
    zIndex: 1
  },
  
  glowOrbPink: {
    position: 'absolute',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
    bottom: '-300px',
    right: '-300px',
    zIndex: 1
  },
  
  dashboardLayout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    padding: '2rem',
    position: 'relative',
    zIndex: 2,
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%'
  },
  
  dashboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '20px',
    padding: '1.5rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  
  dashboardTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  },
  
  referralCodeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  
  referralCodeLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem'
  },
  
  referralCodeBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(39, 23, 65, 0.6)',
    borderRadius: '12px',
    padding: '0.5rem 1rem',
    border: '1px solid rgba(168, 85, 247, 0.3)'
  },
  
  referralCodeText: {
    fontWeight: '600',
    letterSpacing: '1px',
    color: '#d8b4fe',
    marginRight: '0.75rem'
  },
  
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: 'rgba(168, 85, 247, 0.15)',
    border: 'none',
    borderRadius: '8px',
    padding: '0.4rem 0.8rem',
    color: '#e9d5ff',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  
  headerActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  
  refreshButton: {
    background: 'rgba(39, 23, 65, 0.6)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '12px',
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#e9d5ff'
  },
  
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '0.6rem 1.2rem',
    color: '#fecaca',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  
  // Tab Navigation
  tabContainer: {
    display: 'flex',
    gap: '0.5rem',
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '16px',
    padding: '0.5rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)'
  },
  
  tabButton: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    fontSize: '0.95rem'
  },
  
  activeTab: {
    background: 'rgba(168, 85, 247, 0.3)',
    color: 'white',
    boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
  },
  
  tabContent: {
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '20px',
    padding: '2rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    minHeight: '500px'
  },
  
  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    marginBottom: '2rem'
  },
  
  statCard: {
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '20px',
    padding: '1.5rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  },
  
  statCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem'
  },
  
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d8b4fe'
  },
  
  statTitle: {
    fontSize: '1rem',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0
  },
  
  statValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    margin: '0.5rem 0',
    color: 'white'
  },
  
  statSubtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '0.25rem'
  },
  
  // Login Styles
  loginCard: {
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '24px',
    padding: '3rem',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 10
  },
  
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderRadius: '24px',
    background: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.2), transparent 70%)',
    zIndex: -1
  },
  
  neonButton: {
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  
  input: {
    width: '100%',
    background: 'rgba(39, 23, 65, 0.6)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '12px',
    padding: '0.875rem 1.25rem',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  
  inputFocus: {
    borderColor: '#a855f7',
    boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.3)'
  },
  // Add these to the styles
modalBackdrop: {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
},

contactModal: {
  background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
  borderRadius: '24px',
  width: '100%',
  maxWidth: '600px',
  padding: '2rem',
  boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(168, 85, 247, 0.3)',
  position: 'relative'
},

modalHeader: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
},

modalTitle: {
  fontSize: '1.5rem',
  fontWeight: '600',
  margin: 0,
  color: '#e9d5ff',
  display: 'flex',
  alignItems: 'center'
},

modalClose: {
  background: 'none',
  border: 'none',
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '2rem',
  cursor: 'pointer',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
},

modalContent: {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2rem'
},

contactInfo: {
  background: 'rgba(39, 23, 65, 0.5)',
  borderRadius: '16px',
  padding: '1.5rem',
  border: '1px solid rgba(168, 85, 247, 0.3)'
},

contactMethod: {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '1.5rem',
  fontSize: '1.1rem',
  color: 'rgba(255, 255, 255, 0.9)'
},

messageForm: {
  display: 'flex',
  flexDirection: 'column'
},

formLabel: {
  marginBottom: '0.75rem',
  fontWeight: '500',
  color: 'rgba(255, 255, 255, 0.8)'
},

messageInput: {
  background: 'rgba(39, 23, 65, 0.6)',
  border: '1px solid rgba(168, 85, 247, 0.3)',
  borderRadius: '12px',
  padding: '1rem',
  color: 'white',
  fontSize: '1rem',
  marginBottom: '1.5rem',
  resize: 'vertical',
  minHeight: '150px'
},

formActions: {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'flex-end'
},

cancelButton: {
  background: 'rgba(239, 68, 68, 0.15)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '12px',
  padding: '0.8rem 1.5rem',
  color: '#fecaca',
  fontWeight: '500',
  cursor: 'pointer'
},

submitButton: {
  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  border: 'none',
  borderRadius: '12px',
  padding: '0.8rem 1.5rem',
  color: 'white',
  fontWeight: '600',
  cursor: 'pointer'
},
// Add to the styles
flaggedBanner: {
  background: 'linear-gradient(135deg, #7e22ce, #dc2626)',
  borderRadius: '16px',
  padding: '1rem',
  marginBottom: '1.5rem',
  boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  position: 'relative',
  overflow: 'hidden'
},

flaggedContent: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '1.5rem',
  position: 'relative',
  zIndex: 2
},

flaggedHeader: {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  minWidth: '200px'
},

flaggedTitle: {
  fontSize: '1.25rem',
  fontWeight: '700',
  margin: 0,
  color: 'white'
},

flaggedDetails: {
  flex: 1,
  minWidth: '300px',
  color: 'rgba(255, 255, 255, 0.9)'
},

flaggedReason: {
  marginBottom: '0.25rem'
},

flaggedDate: {
  marginBottom: '0.25rem'
},

flaggedImpact: {
  fontWeight: '600',
  color: '#fecaca'
},

flaggedActions: {
  minWidth: '180px'
},

contactButton: {
  background: 'rgba(255, 255, 255, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  padding: '0.8rem 1.5rem',
  color: 'white',
  fontWeight: '600',
  cursor: 'pointer',
  width: '100%'
},

};

const API_URL = process.env.REACT_APP_API_URL || "https://api.casino.com";

const Ambassador = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('ambassadorToken') || localStorage.getItem('adminToken'));
  const [ambassadorData, setAmbassadorData] = useState(null);
  const [ambassadarId,setAmbassadarId]=useState(null)
  const [referralPlayers,setReferralPlayers]=useState([])
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copiedCode, setCopiedCode] = useState(false);
  const [payoutWallet,setPayoutWallet]=useState("")
  // Add to the Ambassador component
const [accountStatus, setAccountStatus] = useState('active'); // 'active', 'flagged'
const [showContactModal, setShowContactModal] = useState(false);
const [supportMessage, setSupportMessage] = useState('');
  const adminApi = axios.create({
    baseURL: `${API_URL}api/admin`,
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  // Mock data for demonstration
  useEffect(() => {
    const fetchData=async()=>
    {
   if (token) {
      try{
        if(!ambassadarId) return;
const ambassadors = await adminApi.post("ambassadors/dashboard-stats", {ambassadorId:ambassadarId })
     console.log(ambassadors?.data?.userName)
        setAmbassadorData({
          id:ambassadors?.data?.id,
          name: ambassadors?.data?.userName,
          referralCode: ambassadors?.data?.referallCode,
          totalReferrals: ambassadors?.data?.totalReferalls,
          wagerVolume: ambassadors?.data?.wagerVolume,
          commissionRate: ambassadors?.data?.commisionRate,
          netLosses: ambassadors?.data?.netLoss,
          totalCommissions: ambassadors?.data?.totalCommision,
          pendingCommissions: 2400,
          lastPayoutDate: "2023-10-15",
          lastPayoutAmount: 7800,
          status: 'flagged', // Change to 'active' for normal state
      flaggedReason: 'Suspected referral fraud',
      flaggedDate: '2023-10-20',
      commissionPaused: true
        });
      }
     catch(e)
     {
     console.log(e)
     }
    }
 
    }
    fetchData()
    
  }, [token]);
  useEffect(()=>{
referredPlayersStats()
  },[ambassadorData])
  const referredPlayersStats=async()=>{
    try{
        if(!ambassadorData) return;
        const referredPlayers = await adminApi.post(`/ambassadors/${ambassadorData?.id}/calculate-earnings`)
        console.log(referredPlayers?.data?.data)
        setReferralPlayers(referredPlayers?.data?.data)
    }
    catch(e)
    {

    }
  }
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log(loginForm)
      const login = await adminApi.post("/ambassadar-login", {username: loginForm?.username,password:loginForm?.password})
      console.log(login?.data?.data?.token)
      setAmbassadarId(login?.data?.data?.ambassadar?.id)
       localStorage.setItem('ambassadorToken', login?.data?.data?.token);
       setToken(login?.data?.data?.token)
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ambassadorToken');
    setToken(null);
    setAmbassadorData(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ambassadorData?.referrallCode || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Login screen
  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundEffects}>
          <div style={styles.glowOrbPurple} />
          <div style={styles.glowOrbPink} />
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
          <motion.div 
            style={styles.loginCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={styles.cardGlow} />
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
                <Shield size={40} color="white" />
              </motion.div>
              
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                AMBASSADOR ACCESS
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Enter your credentials to continue
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
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'username' ? styles.inputFocus : {})
                  }}
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput('')}
                  required
                  autoFocus
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
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    style={{
                      ...styles.input,
                      paddingRight: '3rem',
                      ...(focusedInput === 'password' ? styles.inputFocus : {})
                    }}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput('')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#ef4444'
                  }}
                >
                  <div style={{ fontSize: '20px' }}>⚠️</div>
                  <span>{error}</span>
                </motion.div>
              )}
              
              <motion.button 
                type="submit"
                style={{
                  ...styles.neonButton,
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)'
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 30px rgba(168, 85, 247, 0.6)' }}
                whileTap={{ scale: 0.98 }}
              >
                LOGIN TO DASHBOARD
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  // Dashboard Tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { id: 'players', label: 'Players', icon: <Users size={18} /> },
    { id: 'commissions', label: 'Commissions', icon: <PieChart size={18} /> },
    { id: 'funnel', label: 'Funnel', icon: <BarChart2 size={18} /> },
    { id: 'share', label: 'Share', icon: <Share2 size={18} /> },
    { id: 'calculator', label: 'Calculator', icon: <Calculator size={18} /> },
    { id: 'settings', label: 'Account', icon: <Settings size={18} /> }
  ];
function truncateMiddle(str, startChars, endChars) {
  if (str.length <= startChars + endChars + 3) {
    // If the string is short enough, just return it as is
    return str;
  }
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Stat Card Component
  const StatCard = ({ 
    icon, 
    title, 
    value, 
    subtitle, 
    change, 
    isCurrency = false,
    isNegativeGood = false
  }) => {
    const changePositive = change > 0;
    const changeNegative = change < 0;
    
    return (
      <motion.div
        style={styles.statCard}
        whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
        transition={{ duration: 0.2 }}
      >
        <div style={styles.statCardHeader}>
          <div style={styles.statIcon}>{icon}</div>
          <h3 style={styles.statTitle}>{title}</h3>
        </div>
        
        {ambassadorData ? (
          <>
            <div style={styles.statValue}>
              {isCurrency ? formatCurrency(value) : value}
              {title === "Commission Rate" && "%"}
            </div>
            
            {subtitle && (
              <div style={styles.statSubtitle}>
                {isCurrency ? formatCurrency(subtitle) : subtitle}
                {title === "Total Commissions" && " pending"}
              </div>
            )}
            
            {change !== undefined && !isNaN(change) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: changePositive 
                  ? (isNegativeGood ? '#ef4444' : '#10b981') 
                  : (isNegativeGood ? '#10b981' : '#ef4444')
              }}>
                {changePositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                {Math.abs(change)}%
              </div>
            )}
          </>
        ) : (
          <div style={{ height: '60px', display: 'flex', alignItems: 'center' }}>
            <div style={{
              height: '12px',
              width: '100%',
              background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.4), rgba(168, 85, 247, 0.2))',
              backgroundSize: '200%',
              borderRadius: '6px',
              animation: 'loading 1.5s infinite'
            }} />
          </div>
        )}
      </motion.div>
    );
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div style={styles.tabContent}>
            <div style={styles.statsGrid}>
              <StatCard 
                icon={<Users size={24} />}
                title="Total Referrals"
                value={ambassadorData?.totalReferrals || 0}
                change={5}
              />
              
              <StatCard 
                icon={<Database size={24} />}
                title="Referred Wager Volume"
                value={ambassadorData?.wagerVolume || 0}
                change={12}
                isCurrency={true}
              />
              
              <StatCard 
                icon={<PieChart size={24} />}
                title="Commission Rate"
                value={ambassadorData?.commissionRate || 0}
              />
              
              <StatCard 
                icon={<TrendingDown size={24} />}
                title="Net Losses Generated"
                value={ambassadorData?.netLosses || 0}
                change={-8}
                isCurrency={true}
                isNegativeGood={true}
              />
              
              <StatCard 
                icon={<Wallet size={24} />}
                title="Total Commissions"
                value={ambassadorData?.totalCommissions || 0}
                subtitle={ambassadorData?.pendingCommissions || 0}
                isCurrency={true}
              />
              
              <StatCard 
                icon={<Clock size={24} />}
                title="Last Payout Date"
                value={ambassadorData?.lastPayoutDate ? new Date(ambassadorData.lastPayoutDate).toLocaleDateString() : 'Never'}
                subtitle={ambassadorData?.lastPayoutAmount ? formatCurrency(ambassadorData.lastPayoutAmount) : ''}
                isCurrency={false}
              />
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#d8b4fe' }}>Performance Overview</h3>
              <div style={{
                height: '300px',
                background: 'rgba(39, 23, 65, 0.4)',
                borderRadius: '16px',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                padding: '1rem',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}>
                {[60, 80, 120, 90, 110, 85, 75].map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}px` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    style={{
                      width: '40px',
                      background: 'linear-gradient(to top, #a855f7, #ec4899)',
                      borderRadius: '8px 8px 0 0'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'players':
        return (
          <div style={styles.tabContent}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#e9d5ff' }}>Referred Players</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <select style={{ ...styles.input, minWidth: '180px' }}>
                <option>All Tokens</option>
                <option>ETH</option>
                <option>BTC</option>
                <option>USDT</option>
              </select>
              
              <select style={{ ...styles.input, minWidth: '180px' }}>
                <option>All Activity</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              
              <button style={styles.copyButton}>
                Apply Filters
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Player</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Referral Date</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Total Games</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Bet Volume</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Wins</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Losses</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Net P&L</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                {/* <tbody>
                  {referralPlayers?.map((i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '1rem' }}>0x5a3...d8f{i}</td>
                      <td style={{ padding: '1rem' }}>2023-10-{10+i}</td>
                      <td style={{ padding: '1rem' }}>{42 + i * 3}</td>
                      <td style={{ padding: '1rem' }}>{formatCurrency(1200 + i * 350)}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ color: '#10b981' }}>12</div>
                        <div style={{ color: '#ef4444' }}>15</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#ef4444', fontWeight: '500' }}>
                        -{formatCurrency(300 + i * 50)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: i % 3 === 0 ? 'rgba(16, 185, 129, 0.15)' : 
                                    i % 3 === 1 ? 'rgba(156, 163, 175, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: i % 3 === 0 ? '#10b981' : 
                                 i % 3 === 1 ? '#9ca3af' : '#ef4444',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.85rem'
                        }}>
                          {i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Inactive' : 'Flagged'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody> */}
                <tbody>
  {referralPlayers?.map((player, i) => (
    <tr key={player.Player} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <td style={{ padding: '1rem' }}>{truncateMiddle(player?.Player,8,12)}</td>
      <td style={{ padding: '1rem' }}>21-05-2025</td>
      <td style={{ padding: '1rem' }}>{player["Total Games"]}</td>
      <td style={{ padding: '1rem' }}>{player["Bet Volume"]}</td>
      <td style={{ padding: '1rem', color: '#10b981' }}>{player.Wins}</td>
      <td style={{ padding: '1rem', color: '#ef4444' }}>{player.Losses}</td>
      <td style={{ padding: '1rem', color: player["Net P&L"] >= 0 ? '#10b981' : '#ef4444', fontWeight: '500' }}>
        {player["Net P&L"] >= 0 
          ? formatCurrency(player["Net P&L"]) 
          : `-${formatCurrency(Math.abs(player["Net P&L"]))}`}
      </td>
      <td style={{ padding: '1rem' }}>
        <span style={{
          background: player["Net P&L"] > 0 
            ? 'rgba(16, 185, 129, 0.15)' 
            : player["Net P&L"] === 0 
              ? 'rgba(156, 163, 175, 0.15)' 
              : 'rgba(239, 68, 68, 0.15)',
          color: player["Net P&L"] > 0 
            ? '#10b981' 
            : player["Net P&L"] === 0 
              ? '#9ca3af' 
              : '#ef4444',
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          fontSize: '0.85rem'
        }}>
          {player["Net P&L"] > 0 ? 'Net Gain' : player["Net P&L"] === 0 ? 'Neutral' : 'Net Loss'}
        </span>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          </div>
        );
      
      case 'commissions':
        return (
          <div style={styles.tabContent}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#e9d5ff' }}>Commissions</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h3 style={{ color: '#d8b4fe', marginBottom: '1rem' }}>Current Period Preview</h3>
                <div style={{ 
                  background: 'rgba(39, 23, 65, 0.4)', 
                  borderRadius: '12px', 
                  padding: '1.5rem',
                  border: '1px solid rgba(168, 85, 247, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Net Losses</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatCurrency(ambassadorData?.netLosses)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Commission Rate</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{ambassadorData?.commissionRate}%</div>
                    </div>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(90deg, #7e22ce, #a855f7)', 
                    borderRadius: '8px', 
                    padding: '1rem',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    Estimated Payout: {formatCurrency(ambassadorData?.totalCommissions)}
                  </div>
                </div>
              </div>
              
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h3 style={{ color: '#d8b4fe', marginBottom: '1rem' }}>Commission History</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{
                      background: 'rgba(39, 23, 65, 0.4)',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(168, 85, 247, 0.3)'
                    }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>2023-09-{20+i} to 2023-10-{5+i}</div>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                          {formatCurrency(12000 + i * 1500)} net loss
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700' }}>{formatCurrency(1440 + i * 180)}</div>
                        <div style={{
                          background: i > 2 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: i > 2 ? '#10b981' : '#f59e0b',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.85rem'
                        }}>
                          {i > 2 ? 'Paid' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
       
      
      case 'funnel':
        return (
          <div style={styles.tabContent}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#e9d5ff' }}>Referral Funnel</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {['1D', '1W', '1M', 'ALL'].map((period) => (
                <button
                  key={period}
                  style={{
                    ...styles.copyButton,
                    ...(period === '1W' ? styles.activeTab : {})
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-end',
              height: '300px',
              padding: '2rem',
              background: 'rgba(39, 23, 65, 0.4)',
              borderRadius: '16px',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Views</div>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: '200px' }}
                  transition={{ duration: 1 }}
                  style={{
                    width: '80px',
                    background: 'linear-gradient(to top, #7e22ce, #a855f7)',
                    borderRadius: '8px 8px 0 0'
                  }}
                />
                <div style={{ marginTop: '0.5rem', fontWeight: '700' }}>1,240</div>
                <div style={{ color: '#a78bfa', fontSize: '0.9rem' }}>100%</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Signups</div>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: '160px' }}
                  transition={{ duration: 1, delay: 0.2 }}
                  style={{
                    width: '80px',
                    background: 'linear-gradient(to top, #a855f7, #d946ef)',
                    borderRadius: '8px 8px 0 0'
                  }}
                />
                <div style={{ marginTop: '0.5rem', fontWeight: '700' }}>248</div>
                <div style={{ color: '#a78bfa', fontSize: '0.9rem' }}>20%</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>First Bets</div>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: '120px' }}
                  transition={{ duration: 1, delay: 0.4 }}
                  style={{
                    width: '80px',
                    background: 'linear-gradient(to top, #d946ef, #ec4899)',
                    borderRadius: '8px 8px 0 0'
                  }}
                />
                <div style={{ marginTop: '0.5rem', fontWeight: '700' }}>124</div>
                <div style={{ color: '#a78bfa', fontSize: '0.9rem' }}>50%</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Conversions</div>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: '80px' }}
                  transition={{ duration: 1, delay: 0.6 }}
                  style={{
                    width: '80px',
                    background: 'linear-gradient(to top, #ec4899, #f97316)',
                    borderRadius: '8px 8px 0 0'
                  }}
                />
                <div style={{ marginTop: '0.5rem', fontWeight: '700' }}>62</div>
                <div style={{ color: '#a78bfa', fontSize: '0.9rem' }}>50%</div>
              </div>
            </div>
          </div>
        );
      
      case 'share':
        return (
          <div style={styles.tabContent}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#e9d5ff' }}>Share Your Referral</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                background: 'rgba(39, 23, 65, 0.4)', 
                borderRadius: '16px', 
                padding: '1.5rem',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}>
                <h3 style={{ color: '#d8b4fe', marginBottom: '1rem' }}>Your Referral Link</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={`https://casino.com/ref/${ambassadorData?.referralCode || 'REFCODE'}`}
                    readOnly
                    style={styles.input}
                  />
                  <button style={styles.copyButton}>
                    <Copy size={16} /> Copy
                  </button>
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(39, 23, 65, 0.4)', 
                borderRadius: '16px', 
                padding: '1.5rem',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}>
                <h3 style={{ color: '#d8b4fe', marginBottom: '1rem' }}>Your Referral Code</h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  background: 'rgba(168, 85, 247, 0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: '700'
                }}>
                  {ambassadorData?.referralCode || 'AMB123456'}
                  <button 
                    style={styles.copyButton}
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    {copiedCode ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            
            <h3 style={{ color: '#d8b4fe', marginBottom: '1rem' }}>Share Via</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
              gap: '1rem'
            }}>
              {[
                { name: 'Twitter', icon: <Twitter size={24} />, color: '#1DA1F2' },
                { name: 'Facebook', icon: <Facebook size={24} />, color: '#1877F2' },
                { name: 'Instagram', icon: <Instagram size={24} />, color: '#E1306C' },
                { name: 'WhatsApp', icon: <MessageCircle size={24} />, color: '#25D366' },
                { name: 'Telegram', icon: <MessageSquareText size={24} />, color: '#0088CC' },
                { name: 'Discord', icon: <MessageCircle size={24} />, color: '#5865F2' },
                { name: 'Email', icon: <Mail size={24} />, color: '#EA4335' },
                { name: 'SMS', icon: <Smartphone size={24} />, color: '#34B7F1' }
              ].map((platform, index) => (
                <motion.button
                  key={index}
                  style={{
                    background: platform.color,
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '500'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {platform.icon}
                  {platform.name}
                </motion.button>
              ))}
            </div>
          </div>
        );
      
      case 'calculator':
       return (
        <CommissionCalculator /> 
       )
      case 'settings':
  return (
    <div style={styles.tabContent}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#e9d5ff' }}>Account Settings</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Wallet Information */}
        <div style={{ 
          background: 'rgba(39, 23, 65, 0.4)', 
          borderRadius: '16px', 
          padding: '1.5rem',
          border: '1px solid rgba(168, 85, 247, 0.3)'
        }}>
          <h3 style={{ color: '#d8b4fe', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={20} /> Payout Wallet
          </h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Wallet Address</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Enter your wallet address"
                value="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                onChange={() => {}}
                style={styles.input}
              />
              <button style={styles.copyButton}>
                <Copy size={16} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
              This is where your commissions will be paid
            </p>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Network</label>
            <select style={styles.input}>
              <option>Ethereum (ERC-20)</option>
              <option>Binance Smart Chain (BEP-20)</option>
              <option>Polygon (MATIC)</option>
              <option>Solana (SOL)</option>
            </select>
          </div>
        </div>
        
        {/* Security Settings */}
        <div style={{ 
          background: 'rgba(39, 23, 65, 0.4)', 
          borderRadius: '16px', 
          padding: '1.5rem',
          border: '1px solid rgba(168, 85, 247, 0.3)'
        }}>
          <h3 style={{ color: '#d8b4fe', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} /> Security
          </h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Display Name</label>
            <input
              type="text"
              value="Alex Johnson"
              onChange={() => {}}
              style={styles.input}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)' }}>Two-Factor Authentication (2FA)</label>
              <div style={{
                position: 'relative',
                width: '44px',
                height: '24px'
              }}>
                <input 
                  type="checkbox" 
                  checked={true} 
                  onChange={() => {}} 
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0
                  }} 
                />
                <div style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#10b981',
                  borderRadius: '999px',
                  transition: '0.4s'
                }}>
                  <div style={{
                    position: 'absolute',
                    height: '20px',
                    width: '20px',
                    left: '2px',
                    bottom: '2px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.4s'
                  }} />
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              Enabled - Protects your account with an extra layer of security
            </p>
          </div>
          
          <div>
            <button style={{
              ...styles.copyButton,
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#fecaca',
              width: '100%',
              justifyContent: 'center'
            }}>
              Change Password
            </button>
          </div>
        </div>
      </div>
      
      {/* Referral Code Section */}
      <div style={{ 
        background: 'rgba(39, 23, 65, 0.4)', 
        borderRadius: '16px', 
        padding: '1.5rem',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#d8b4fe', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} /> Referral Code
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Your Custom Code</label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: 'rgba(168, 85, 247, 0.1)',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1.25rem',
              fontWeight: '700'
            }}>
              {ambassadorData?.referallCode || "AMB12345"}
              <button 
                style={styles.copyButton}
                onClick={handleCopyCode}
              >
                {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                {copiedCode ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
              This code is controlled by admin and cannot be changed
            </p>
          </div>
          
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Referral Link</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value="https://casino.com/ref/AMB12345"
                readOnly
                style={styles.input}
              />
              <button style={styles.copyButton}>
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <motion.button
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '0.8rem 2rem',
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Save Changes
        </motion.button>
        {accountStatus === 'flagged' && (
  <motion.div
    style={styles.flaggedBanner}
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div style={styles.flaggedContent}>
      <div style={styles.flaggedHeader}>
        <AlertCircle size={24} />
        <h3 style={styles.flaggedTitle}>Account Flagged</h3>
      </div>
      
      <div style={styles.flaggedDetails}>
        <div style={styles.flaggedReason}>
          <strong>Reason:</strong> {ambassadorData?.flaggedReason || 'Suspicious activity detected'}
        </div>
        <div style={styles.flaggedDate}>
          <strong>Date Flagged:</strong> {ambassadorData?.flaggedDate ? new Date(ambassadorData.flaggedDate).toLocaleDateString() : 'N/A'}
        </div>
        <div style={styles.flaggedImpact}>
          <strong>Impact:</strong> Commissions paused until resolved
        </div>
      </div>
      
      <div style={styles.flaggedActions}>
        <motion.button
          style={styles.contactButton}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowContactModal(true)}
        >
          Contact Support
        </motion.button>
      </div>
    </div>
  </motion.div>
)}
      </div>
    </div>
  );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundEffects}>
        <div style={styles.glowOrbPurple} />
        <div style={styles.glowOrbPink} />
      </div>
      
      <div style={styles.dashboardLayout}>
        {/* Header */}
        <motion.header 
          style={styles.dashboardHeader}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={styles.headerLeft}>
            <h1 style={styles.dashboardTitle}>
              Welcome, {ambassadorData?.name || 'Ambassador'}!
            </h1>
            <div style={styles.referralCodeContainer}>
              <span style={styles.referralCodeLabel}>Your Referral Code:</span>
              <div style={styles.referralCodeBox}>
                <span style={styles.referralCodeText}>
                  {ambassadorData?.referralCode || 'AMB12345'}
                </span>
                <motion.button
                  style={styles.copyButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyCode}
                >
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                </motion.button>
              </div>
            </div>
          </div>
          
          <div style={styles.headerActions}>
            <motion.button
              style={styles.refreshButton}
              whileHover={{ rotate: 360 }}
              whileTap={{ scale: 0.9 }}
            >
              <RefreshCw size={20} />
            </motion.button>
            
            <motion.button
              style={styles.logoutButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </motion.button>
          </div>
        </motion.header>
        
        {/* Tab Navigation */}
        <div style={styles.tabContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.id ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        {renderTabContent()}
      </div>
{showContactModal && (
  <motion.div
    style={styles.modalBackdrop}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    onClick={() => setShowContactModal(false)}
  >
    <motion.div
      style={styles.contactModal}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>
          <Headset size={24} style={{ marginRight: '0.75rem' }} />
          Contact Support
        </h3>
        <button 
          style={styles.modalClose}
          onClick={() => setShowContactModal(false)}
        >
          &times;
        </button>
      </div>
      
      <div style={styles.modalContent}>
        <div style={styles.contactInfo}>
          <div style={styles.contactMethod}>
            <Mail size={20} />
            <span>support@casino.com</span>
          </div>
          <div style={styles.contactMethod}>
            <MessageSquare size={20} />
            <span>Live Chat (24/7)</span>
          </div>
          <div style={styles.contactMethod}>
            <Phone size={20} />
            <span>+1 (888) 123-4567</span>
          </div>
        </div>
        
        <div style={styles.messageForm}>
          <label style={styles.formLabel}>Your Message</label>
          <textarea
            value={supportMessage}
            onChange={(e) => setSupportMessage(e.target.value)}
            placeholder="Explain your situation in detail..."
            style={styles.messageInput}
            rows={5}
          />
          
          <div style={styles.formActions}>
            <button 
              style={styles.cancelButton}
              onClick={() => setShowContactModal(false)}
            >
              Cancel
            </button>
            <button 
              style={styles.submitButton}
              onClick={() => {
                alert('Support message submitted! Our team will contact you shortly.');
                setShowContactModal(false);
                setSupportMessage('');
              }}
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
)}
    </div>
  );
};

export default Ambassador;