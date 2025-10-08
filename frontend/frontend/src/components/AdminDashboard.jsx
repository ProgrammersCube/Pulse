import React, { useState, useEffect,useRef} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TreasuryManagement from './TreasuryManagement.jsx';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Activity, 
  Settings, Award, RefreshCw, LogOut, Copy, Check,
  AlertCircle, ChevronDown, ChevronUp, Eye, EyeOff,
  Zap, Shield, Database, Globe, BarChart3, PieChart,
  Wallet, ArrowUpRight, ArrowDownRight, Clock,ArrowUp,ArrowDown,Edit3,X,Trash2,
  User, MoreVertical, Key
} from 'lucide-react';
import { styles } from '../styles/Admin-dashbaord.styles.js';
// const API_URL = process.env.REACT_APP_API_URL || 'https://creative-communication-production.up.railway.app';
const API_URL = process.env.REACT_APP_API_URL
console.log(API_URL)
// Chart component for revenue visualization
const MiniChart = ({ data, color }) => {
  const max = Math.max(...data);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (value / max) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width="100%" height="60" style={{ marginTop: '1rem' }}>
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        fill={`url(#gradient-${color})`}
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const ambassadorCodeRef = useRef(null);
  const usernameRef=useRef(null)
  const passwordRef=useRef(null)
  const [showCreateAmbassadarPassword, setShowCreateAmbassadarPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [ambassadors, setAmbassadors] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingRequestsLoading, setPendingRequestsLoading] = useState(false);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [approvedRequestsLoading, setApprovedRequestsLoading] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  
  // User Analytics State
  const [userAnalyticsData, setUserAnalyticsData] = useState([]);
  const [userAnalyticsLoading, setUserAnalyticsLoading] = useState(false);
  const [userAnalyticsFilter, setUserAnalyticsFilter] = useState('all'); // 'all', 'high-volume', 'top-referrers'
  
  // Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedAmbassador, setExpandedAmbassador] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');
  const [focusedInput, setFocusedInput] = useState('');
  
  // Edit Ambassador Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAmbassador, setEditingAmbassador] = useState(null);
  const [editForm, setEditForm] = useState({
    walletAddress: '',
    username: '',
    password: '',
    ambassadorCode: '',
    commissionRate: '',
    payoutWalletAddress: ''
  });
  const [editingFields, setEditingFields] = useState({
    walletAddress: false,
    username: false,
    password: false,
    ambassadorCode: false,
    commissionRate: false,
    payoutWalletAddress: false
  });
  const [editLoading, setEditLoading] = useState(false);
  
  // Delete Ambassador Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAmbassador, setDeletingAmbassador] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Payment Confirmation Modal State
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Local state for House Configuration
  const [localHouseSettings, setLocalHouseSettings] = useState({ houseFeePercentage: 0 });
  
  // Local state for Bet Limits
  const [localBetLimits, setLocalBetLimits] = useState({});

  // Player Net Profitability State
  const [playerProfitabilityData, setPlayerProfitabilityData] = useState(null);
  const [profitabilityLoading, setProfitabilityLoading] = useState(false);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);

  // Net Revenue Analytics State
  const [netRevenueData, setNetRevenueData] = useState(null);
  const [netRevenueLoading, setNetRevenueLoading] = useState(false);
  const [selectedRevenueTimePeriod, setSelectedRevenueTimePeriod] = useState('ALL');

  // Add animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      ${styles.shimmerAnimation}
      ${styles.floatAnimation}
      ${styles.pulseAnimation}
      ${styles.glowAnimation}
      
      .admin-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      .admin-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }
      
      .admin-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(168, 85, 247, 0.3);
        border-radius: 4px;
      }
      
      .admin-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(168, 85, 247, 0.5);
      }
      
      .glow-text {
        text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
      }
      
      .hover-lift {
        transition: all 0.3s ease;
      }
      
      .hover-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Create axios instance with auth
  const adminApi = axios.create({
    baseURL: `${API_URL}api/admin`,
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API_URL}api/admin/login`, loginForm);
      if (response.data.success) {
        const adminToken = response.data.data.token;
        localStorage.setItem('adminToken', adminToken);
        setToken(adminToken);
        window.location.reload();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials');
    }
  };

  // Fetch initial data
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Fetch player profitability data when useranalytics tab is active
  useEffect(() => {
    if (activeTab === 'useranalytics' && token && !playerProfitabilityData) {
      fetchPlayerProfitability(selectedTimePeriod);
    }
  }, [activeTab, token]);

  // Fetch net revenue analytics when useranalytics tab is active
  useEffect(() => {
    if (activeTab === 'useranalytics' && token && !netRevenueData) {
      fetchNetRevenueAnalytics(selectedRevenueTimePeriod);
    }
  }, [activeTab, token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAccountDropdown && !event.target.closest('[data-dropdown]')) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountDropdown]);

  // Fetch pending and approved requests when ambassadors tab is active
  useEffect(() => {
    if (activeTab === 'ambassadors' && token) {
      Promise.all([fetchPendingRequests(), fetchApprovedRequests()]);
    }
  }, [activeTab, token]);

  // Fetch user analytics when walletanalytics tab is active
  useEffect(() => {
    if (activeTab === 'walletanalytics' && token) {
      fetchUserAnalytics(userAnalyticsFilter);
    }
  }, [activeTab, token, userAnalyticsFilter]);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError('');
    
    try {
      const [settingsRes, statsRes, ambassadorsRes] = await Promise.all([
        adminApi.get('/settings'),
        adminApi.get('/dashboard/stats'),
        adminApi.get('/ambassadors')
      ]);
      
      setSettings(settingsRes.data.data);
      setStats(statsRes.data.data);
      console.log(ambassadorsRes.data.data)
      setAmbassadors(ambassadorsRes.data.data);
      
      // Initialize local house settings
      setLocalHouseSettings({ houseFeePercentage: settingsRes.data.data?.houseFeePercentage ?? 0 });
      
      // Initialize local bet limits
      setLocalBetLimits(settingsRes.data.data?.betLimits ?? {});
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        setToken(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // House Configuration handlers
  const handleHouseFeeChange = (value) => {
    setLocalHouseSettings(prev => ({ ...prev, houseFeePercentage: value }));
  };

  const handleSaveHouseSettings = async () => {
    try {
      await adminApi.put('/settings', localHouseSettings);
      setSuccess('House settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchData(true);
    } catch (error) {
      setError('Failed to save house settings');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Bet Limits handlers
  const handleBetLimitChange = (token, field, value) => {
    setLocalBetLimits(prev => ({
      ...prev,
      [token]: {
        ...prev[token],
        [field]: Number(value)
      }
    }));
  };

  const handleSaveBetLimits = async () => {
    try {
      await adminApi.put('/settings', { betLimits: localBetLimits });
      setSuccess('Bet limits saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchData(true);
    } catch (error) {
      setError('Failed to save bet limits');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Update settings with optimistic updates
  const updateSettings = async (updates) => {
    const previousSettings = { ...settings };
    setSettings({ ...settings, ...updates });
    
    try {
      const response = await adminApi.put('/settings', updates);
      setSettings(response.data.data);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setSettings(previousSettings);
      setError('Failed to update settings');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Create ambassador
  const createAmbassador = async (data) => {
    try {
      await adminApi.post('/ambassadors', data);
      fetchData(true);
      setSuccess('Ambassador created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating ambassador');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Refresh ambassador data
  const refreshAmbassadorData = async (ambassadorId) => {
    try {
      // Refresh data to get updated ambassador information
      await fetchData(true);
      setSuccess('Data refreshed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error refreshing data');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text, code) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Handle edit ambassador
  const handleEditAmbassador = (ambassador) => {
    setEditingAmbassador(ambassador);
    setEditForm({
      walletAddress: ambassador.walletAddress || '',
      username: ambassador.username || '',
      password: '',
      ambassadorCode: ambassador.ambassadorCode || '',
      commissionRate: ambassador.commissionPercentage || '',
      payoutWalletAddress: ambassador.payoutWalletAddress || ''
    });
    setEditingFields({
      walletAddress: false,
      username: false,
      password: false,
      ambassadorCode: false,
      commissionRate: false,
      payoutWalletAddress: false
    });
    setShowEditModal(true);
  };

  // Handle field edit toggle
  const toggleFieldEdit = (field) => {
    setEditingFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle form input change
  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      setEditLoading(true);
      
      // Prepare update data
      const updateData = {
        walletAddress: editForm.walletAddress,
        ambassadorCode: editForm.ambassadorCode,
        commissionPercentage: parseFloat(editForm.commissionRate),
        payoutWalletAddress: editForm.payoutWalletAddress
      };

      // Only include password if it's not empty
      if (editForm.password.trim()) {
        updateData.password = editForm.password;
      }

      // Make API call to update ambassador
      await adminApi.put(`/ambassadors/${editingAmbassador._id}`, updateData);
      
      // Refresh data
      await fetchData(true);
      
      // Close modal
      setShowEditModal(false);
      setEditingAmbassador(null);
      
      setSuccess('Ambassador updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating ambassador:', error);
      setError('Error updating ambassador. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle close modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingAmbassador(null);
    setEditForm({
      walletAddress: '',
      username: '',
      password: '',
      ambassadorCode: '',
      commissionRate: '',
      payoutWalletAddress: ''
    });
    setEditingFields({
      walletAddress: false,
      username: false,
      password: false,
      ambassadorCode: false,
      commissionRate: false,
      payoutWalletAddress: false
    });
  };

  // Handle delete ambassador
  const handleDeleteAmbassador = (ambassador) => {
    setDeletingAmbassador(ambassador);
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      
      // Make API call to delete ambassador
      await adminApi.delete(`/ambassadors/${deletingAmbassador._id}`);
      
      // Refresh data
      await fetchData(true);
      
      // Close modal
      setShowDeleteModal(false);
      setDeletingAmbassador(null);
      
      setSuccess('Ambassador deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting ambassador:', error);
      setError('Error deleting ambassador. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingAmbassador(null);
  };

  // Handle password change for user
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }
    
    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });
    
    try {
      const response = await adminApi.post('/change-user-password', {
        walletAddress: selectedUser.walletAddress,
        newPassword: passwordForm.newPassword
      });
      
      if (response.data.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordForm({ newPassword: '', confirmPassword: '' });
          setPasswordMessage({ type: '', text: '' });
          setSelectedUser(null);
        }, 2000);
      } else {
        setPasswordMessage({ type: 'error', text: response.data.message || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password. Please try again.' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Open password change modal
  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setPasswordMessage({ type: '', text: '' });
  };

  // Close password change modal
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setPasswordMessage({ type: '', text: '' });
  };

  // Fetch user analytics data
  const fetchUserAnalytics = async (filter = 'all') => {
    setUserAnalyticsLoading(true);
    try {
      const response = await adminApi.get(`/dashboard/user-analytics?filter=${filter}`);
      if (response.data.success) {
        setUserAnalyticsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setUserAnalyticsLoading(false);
    }
  };

  // Fetch approved payout requests
  const fetchApprovedRequests = async () => {
    try {
      setApprovedRequestsLoading(true);
      const response = await adminApi.get('/approved-payout-requests');
      if (response.data.success) {
        setApprovedRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching approved requests:', error);
    } finally {
      setApprovedRequestsLoading(false);
    }
  };

  // Fetch pending payout requests
  const fetchPendingRequests = async () => {
    try {
      setPendingRequestsLoading(true);
      const response = await adminApi.get('/pending-payout-requests');
      if (response.data.success) {
        setPendingRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setPendingRequestsLoading(false);
    }
  };

  // Handle approve request
  const handleApproveRequest = async (requestId) => {
    try {
      console.log('Approving request:', requestId);
      const response = await adminApi.post('/approve-payout-request', { requestId });
      
      if (response.data.success) {
        // Refresh the pending requests list
        await fetchPendingRequests();
        await fetchApprovedRequests();
        console.log('Request approved successfully');
      } else {
        console.error('Failed to approve request:', response.data.message);
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  // Handle account dropdown actions
  const handleAccountOverview = () => {
    setShowAccountDropdown(false);
    navigate('/admin/account-overview');
  };

  const handleLogout = () => {
    setShowAccountDropdown(false);
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  // Handle process payment confirmation
  const handleProcessPaymentClick = (request) => {
    setPaymentRequest(request);
    setShowPaymentConfirmation(true);
  };

  // Handle process payment
  const handleProcessPayment = async () => {
    alert("Payout Execution is currently disabled")
    return;
    if (!paymentRequest) return;
    
    setPaymentLoading(true);
    try {
      console.log('Processing payment for request:', paymentRequest.requestId);
      const response = await adminApi.post('/process-payment', { requestId: paymentRequest.requestId });
      
      if (response.data.success) {
        // Refresh both approved and pending requests lists
        await Promise.all([fetchApprovedRequests(), fetchPendingRequests()]);
        console.log('Payment processed successfully');
        setSuccess('Payment processed successfully!');
        setTimeout(() => setSuccess(''), 3000);
        setShowPaymentConfirmation(false);
        setPaymentRequest(null);
      } else {
        console.error('Failed to process payment:', response.data.message);
        setError(`Payment failed: ${response.data.message}`);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(`Payment error: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle reject request
  const handleRejectRequest = async (requestId) => {
    try {
      console.log('Rejecting request:', requestId);
      const response = await adminApi.post('/reject-payout-request', { requestId });
      
      if (response.data.success) {
        // Refresh the pending requests list
        await fetchPendingRequests();
        console.log('Request rejected successfully');
      } else {
        console.error('Failed to reject request:', response.data.message);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  // Fetch player profitability data
  const fetchPlayerProfitability = async (timePeriod = 'ALL') => {
    setProfitabilityLoading(true);
    try {
      const response = await adminApi.get(`/dashboard/player-profitability?timePeriod=${timePeriod}&limit=50`);
      setPlayerProfitabilityData(response.data.data);
    } catch (error) {
      console.error('Error fetching player profitability:', error);
      setError('Failed to fetch player profitability data');
      setTimeout(() => setError(''), 3000);
    } finally {
      setProfitabilityLoading(false);
    }
  };

  // Handle time period change
  const handleTimePeriodChange = (period) => {
    setSelectedTimePeriod(period);
    fetchPlayerProfitability(period);
  };

  // Handle player details modal
  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setShowPlayerDetailsModal(true);
  };

  // Fetch net revenue analytics
  const fetchNetRevenueAnalytics = async (timePeriod = 'ALL') => {
    setNetRevenueLoading(true);
    try {
      const response = await adminApi.get(`/dashboard/net-revenue?timePeriod=${timePeriod}`);
      setNetRevenueData(response.data.data);
    } catch (error) {
      console.error('Error fetching net revenue analytics:', error);
      setError('Failed to fetch net revenue analytics');
      setTimeout(() => setError(''), 3000);
    } finally {
      setNetRevenueLoading(false);
    }
  };

  // Handle revenue time period change
  const handleRevenueTimePeriodChange = (period) => {
    setSelectedRevenueTimePeriod(period);
    fetchNetRevenueAnalytics(period);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  // Format currency
  const formatCurrency = (amount, token) => {
    if (token === 'SOL' || token === 'ETH') {
      return amount?.toFixed(6);
    }
    return formatNumber(amount?.toFixed(2));
  };
  const generateUniqueCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const codeLength = 8; // Length of the generated code
  
  for (let i = 0; i < codeLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Set the generated code in the input field
  if (ambassadorCodeRef.current) {
    ambassadorCodeRef.current.value = result;
  }
  
  // // Show success message
  // setSuccess('Unique code generated!');
  // setTimeout(() => setSuccess(''), 2000);
};

  // Login screen
  if (!token) {
    return (
      <div style={{...styles.container, position: 'relative', zIndex: 10}}>
        {/* Background effects */}
        <div style={styles.backgroundEffects}>
          <div style={{
            ...styles.glowOrb,
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
            top: '-200px',
            left: '-200px'
          }} />
          <div style={{
            ...styles.glowOrb,
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
            bottom: '-300px',
            right: '-300px'
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
                ADMIN ACCESS
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
                  <AlertCircle size={20} />
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

  if (loading) {
    return (
      <div style={{...styles.container, position: 'relative', zIndex: 10}}>
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
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{...styles.container, position: 'relative', zIndex: 10}}>
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
              <Shield size={24} color="white" />
            </motion.div>
            <div>
              <h1 style={styles.logoText}>PULSE ADMIN</h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                Control Panel v2.0
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <motion.button
              onClick={() => fetchData(true)}
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
                className={refreshing ? 'animate-spin' : ''}
                style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
              />
            </motion.button>
            
            {/* Account Dropdown */}
            <div style={{ position: 'relative' }} data-dropdown>
              <motion.button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                style={{
                  ...styles.neonButton,
                  background: 'rgba(168, 85, 247, 0.1)',
                  borderColor: 'rgba(168, 85, 247, 0.3)',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                whileHover={{ 
                  scale: 1.02, 
                  background: 'rgba(168, 85, 247, 0.2)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' 
                }}
                whileTap={{ scale: 0.98 }}
              >
                <User size={18} />
                <span>Admin</span>
                <ChevronDown 
                  size={16} 
                  style={{ 
                    transform: showAccountDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showAccountDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      background: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '12px',
                      padding: '0.5rem',
                      minWidth: '200px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                      zIndex: 1000
                    }}
                  >
                    <motion.button
                      onClick={handleAccountOverview}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      whileHover={{ 
                        background: 'rgba(168, 85, 247, 0.1)',
                        color: 'white'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <User size={16} />
                      Account Overview
                    </motion.button>
                    
                    <div style={{
                      height: '1px',
                      background: 'rgba(168, 85, 247, 0.2)',
                      margin: '0.5rem 0'
                    }} />
                    
                    <motion.button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(239, 68, 68, 0.9)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      whileHover={{ 
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut size={16} />
                      Logout
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
        zIndex: 1,
        '@media (max-width: 768px)': {
          padding: '1rem 0.75rem'
        }
      }}>
        {/* Tabs */}
        <div style={styles.tabContainer} className="admin-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'useranalytics', label: 'Revenue & Analytics', icon: Users },
            { id: 'walletanalytics', label: 'User Analytics', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'ambassadors', label: 'Ambassadors', icon: Award },
             { id: 'activebetqueue', label: 'Active Bet Queue', icon: Award },
              { id: 'treasury', label: 'Treasury Management', icon: Award }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.activeTab : styles.inactiveTab)
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              {/* Stats Grid */}
              <div style={styles.statsGrid}>
                <StatCard 
                  title="Total Users" 
                  value={formatNumber(stats?.totalUsers || 0)}
                  icon={Users}
                  color="#3b82f6"
                  trend={12.5}
                  data={[20, 35, 45, 50, 65, 75, 85, 95]}
                />
                <StatCard 
                  title="Total Bets" 
                  value={formatNumber(stats?.totalBets || 0)}
                  icon={Activity}
                  color="#a855f7"
                  trend={8.2}
                  data={[30, 45, 40, 60, 70, 65, 80, 90]}
                />
                <StatCard 
                  title="Active Bets" 
                  value={formatNumber(stats?.activeBets || 0)}
                  icon={Zap}
                  color="#10b981"
                  trend={-2.4}
                  pulse
                  data={[60, 55, 70, 65, 75, 70, 85, 80]}
                />
                <StatCard 
                  title="Ambassadors" 
                  value={formatNumber(stats?.totalAmbassadors || 0)}
                  icon={Award}
                  color="#ec4899"
                  trend={5.1}
                  data={[40, 50, 45, 60, 65, 70, 75, 85]}
                />
              </div>

              {/* Revenue Stats */}
              <motion.div 
                style={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hover-lift"
              >
                <div style={styles.cardGlow} />
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '2rem'
                }}>
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
                      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <DollarSign size={20} color="white" />
                    </div>
                    Revenue Analytics
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px'
                  }}>
                    {['1D', '1W', '1M', 'ALL'].map((period) => (
                      <button
                        key={period}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: period === '1W' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                          color: period === '1W' ? '#a855f7' : 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {stats?.revenueStats?.length > 0 ? (
                    stats.revenueStats.map((stat) => (
                      <motion.div 
                        key={stat._id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '16px',
                          padding: '1.5rem',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          background: 'rgba(255, 255, 255, 0.04)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '1rem'
                        }}>
                          <div>
                            <h4 style={{
                              fontSize: '1.25rem',
                              fontWeight: 'bold',
                              marginBottom: '0.25rem'
                            }}>
                              {stat._id}
                            </h4>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.75rem',
                              background: 'rgba(34, 197, 94, 0.1)',
                              color: '#22c55e',
                              borderRadius: '999px',
                              border: '1px solid rgba(34, 197, 94, 0.2)'
                            }}>
                              Active
                            </span>
                          </div>
                          
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: `linear-gradient(135deg, ${
                              stat._id === 'BeTyche' ? '#3b82f6' :
                              stat._id === 'SOL' ? '#a855f7' :
                              stat._id === 'ETH' ? '#8b5cf6' :
                              '#ec4899'
                            } 0%, ${
                              stat._id === 'BeTyche' ? '#60a5fa' :
                              stat._id === 'SOL' ? '#c084fc' :
                              stat._id === 'ETH' ? '#a78bfa' :
                              '#f472b6'
                            } 100%)`,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Wallet size={24} color="white" />
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Volume:</span>
                            <span style={{ fontWeight: '600' }}>{formatCurrency(stat.totalVolume, stat._id)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Fees (5%):</span>
                            <span style={{ fontWeight: '600', color: '#22c55e' }}>
                              {formatCurrency(stat.totalFees, stat._id)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Total Bets:</span>
                            <span style={{ fontWeight: '600' }}>{formatNumber(stat.totalBets)}</span>
                          </div>
                          
                          <div style={{
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Avg Bet:</span>
                            <span style={{ fontWeight: '600' }}>
                              {formatCurrency(stat.totalVolume / stat.totalBets, stat._id)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '4rem 2rem',
                      color: 'rgba(255, 255, 255, 0.4)'
                    }}>
                      <PieChart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p>No revenue data available yet</p>
                    </div>
                  )}
                </div>
                
                {/* Total Revenue Summary */}
                {stats?.revenueStats?.length > 0 && (
                  <motion.div 
                    style={{
                      marginTop: '2rem',
                      padding: '1.5rem',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                      border: '2px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div>
                      <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                        Total Platform Fees Earned
                      </p>
                      <p style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {formatNumber(
                          stats?.totalPlatformFees?.toFixed(6)
                        )}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 197, 94, 0.3)'
                    }}>
                      <TrendingUp size={20} color="#22c55e" />
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>+23.5%</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'useranalytics' && (
            <motion.div
              key="useranalytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={styles.contentContainer}
            >
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>User Analytics</h2>
                <p style={styles.sectionSubtitle}>Comprehensive user behavior and engagement metrics</p>
              </div>

              {/* Player Net Profitability Section */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <BarChart3 size={24} color="#00ff88" />
                  <h3 style={styles.cardTitle}>Player Net Profitability</h3>
                </div>
                
                {/* Time Period Selector */}
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['ALL', '1D', '1W', '1M'].map((period) => (
                    <button
                      key={period}
                      onClick={() => handleTimePeriodChange(period)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: selectedTimePeriod === period ? '#00ff88' : 'rgba(255, 255, 255, 0.1)',
                        color: selectedTimePeriod === period ? '#000' : '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {period === 'ALL' ? 'All Time' : period}
                    </button>
                  ))}
                </div>

                {profitabilityLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
                    <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '1rem' }}>Loading player data...</p>
                  </div>
                ) : playerProfitabilityData ? (
                  <>
                    {/* Summary Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={styles.card}>
                        <div style={styles.cardHeader}>
                          <Users size={20} color="#00ff88" />
                          <h4 style={styles.cardTitle}>Total Players</h4>
                        </div>
                        <div style={styles.cardContent}>
                          <div style={styles.statValue}>{formatNumber(playerProfitabilityData.summary.totalPlayers)}</div>
                        </div>
                      </div>
                      <div style={styles.card}>
                        <div style={styles.cardHeader}>
                          <TrendingUp size={20} color="#00ff88" />
                          <h4 style={styles.cardTitle}>Profitable Players</h4>
                        </div>
                        <div style={styles.cardContent}>
                          <div style={styles.statValue}>{formatNumber(playerProfitabilityData.summary.profitablePlayers)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={styles.card}>
                        <div style={styles.cardHeader}>
                          <TrendingDown size={20} color="#ff4444" />
                          <h4 style={styles.cardTitle}>Losing Players</h4>
                        </div>
                        <div style={styles.cardContent}>
                          <div style={styles.statValue}>{formatNumber(playerProfitabilityData.summary.losingPlayers)}</div>
                        </div>
                      </div>
                      <div style={styles.card}>
                        <div style={styles.cardHeader}>
                          <DollarSign size={20} color={playerProfitabilityData.summary.totalNetPL >= 0 ? "#00ff88" : "#ff4444"} />
                          <h4 style={styles.cardTitle}>Total Net P/L</h4>
                        </div>
                        <div style={styles.cardContent}>
                          <div style={{...styles.statValue, color: playerProfitabilityData.summary.totalNetPL >= 0 ? "#00ff88" : "#ff4444"}}>
                            ${formatNumber(playerProfitabilityData.summary.totalNetPL)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Players Table */}
                    <div style={{ marginTop: '2rem' }}>
                      <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>Player Details</h4>
                      <div style={{ 
                        overflowX: 'auto', 
                        overflowY: 'auto',
                        maxHeight: '400px',
                        borderRadius: '0.5rem', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.02)'
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Player</th>
                              <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Total Bets</th>
                              <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Wins</th>
                              <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Losses</th>
                              <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Net P/L</th>
                              <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Win Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {playerProfitabilityData.players.map((player, index) => (
                              <tr 
                                key={player.walletAddress}
                                style={{ 
                                  cursor: 'pointer',
                                  background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                                  transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.parentElement.style.background = 'rgba(255, 255, 255, 0.05)'}
                                onMouseLeave={(e) => e.target.parentElement.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'}
                                onClick={() => handlePlayerClick(player)}
                              >
                                <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <div>
                                    <div style={{ fontWeight: '500' }}>{player.username}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                                      {player.walletAddress.substring(0, 10)}...
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  {formatNumber(player.totalBets)}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#00ff88' }}>
                                  ${formatNumber(player.totalWins)}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#ff4444' }}>
                                  ${formatNumber(player.totalLosses)}
                                </td>
                                <td style={{ 
                                  padding: '1rem', 
                                  textAlign: 'right', 
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                  color: player.netPL >= 0 ? '#00ff88' : '#ff4444',
                                  fontWeight: '500'
                                }}>
                                  ${formatNumber(player.netPL)}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  {player?.winRate?.toFixed(1)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
                    <p>No player data available</p>
                  </div>
                )}
              </div>

              {/* Net Revenue Box Section */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <DollarSign size={24} color="#00ff88" />
                  <h3 style={styles.cardTitle}>Net Revenue Analytics</h3>
                </div>
                
                {/* Time Period Selector */}
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['ALL', '1D', '1W', '1M'].map((period) => (
                    <button
                      key={period}
                      onClick={() => handleRevenueTimePeriodChange(period)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: selectedRevenueTimePeriod === period ? '#00ff88' : 'rgba(255, 255, 255, 0.1)',
                        color: selectedRevenueTimePeriod === period ? '#000' : '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {period === 'ALL' ? 'All Time' : period}
                    </button>
                  ))}
                </div>

                {netRevenueLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
                    <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '1rem' }}>Loading revenue data...</p>
                  </div>
                ) : netRevenueData ? (
                  <>
                    {/* Formula Display */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1rem' }}>Net Revenue Formula</h4>
                      <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                        Net Revenue = (Total Losses + Platform Fees) - Total Wins
                      </p>
                    </div>

                    {/* Overall Net Revenue */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Total Net Revenue</h4>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: netRevenueData.overall.netRevenue >= 0 ? '#00ff88' : '#ff4444'
                      }}>
                        ${formatNumber(netRevenueData.overall.netRevenue)}
                      </div>
                    </div>

                    {/* Token Breakdown */}
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>Revenue by Token</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {netRevenueData.tokenBreakdown.map((token) => (
                          <div key={token.token} style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            padding: '1rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}>
                            <h5 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1rem' }}>{token.token}</h5>
                            <div style={{ marginBottom: '0.5rem' }}>
                              <div style={{ color: '#888', fontSize: '0.8rem' }}>Net Revenue</div>
                              <div style={{
                                color: token.netRevenue >= 0 ? '#00ff88' : '#ff4444',
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                              }}>
                                ${formatNumber(token.netRevenue)}
                              </div>
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                              <div style={{ color: '#888', fontSize: '0.8rem' }}>Fees Earned</div>
                              <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                                ${formatNumber(token.totalFees)}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: '#888', fontSize: '0.8rem' }}>Volume</div>
                              <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                                ${formatNumber(token.totalVolume)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
                    <p>No revenue data available</p>
                  </div>
                )}
              </div>

              {/* Win/Loss Breakdown Section */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <BarChart3 size={24} color="#00ff88" />
                  <h3 style={styles.cardTitle}>Win/Loss Breakdown</h3>
                </div>

                {netRevenueLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
                    <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '1rem' }}>Loading breakdown data...</p>
                  </div>
                ) : netRevenueData ? (
                  <>
                    {/* Overall Breakdown */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      marginBottom: '1rem'
                    }}>
                      <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>Overall Breakdown</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#00ff88', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            ${formatNumber(netRevenueData.overall.totalWins)}
                          </div>
                          <div style={{ color: '#888', fontSize: '0.9rem' }}>Total Wins</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#ff4444', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            ${formatNumber(netRevenueData.overall.totalLosses)}
                          </div>
                          <div style={{ color: '#888', fontSize: '0.9rem' }}>Total Losses</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {netRevenueData?.overall?.winRate?.toFixed(1)}%
                          </div>
                          <div style={{ color: '#888', fontSize: '0.9rem' }}>Win Rate</div>
                        </div>
                      </div>
                    </div>

                    {/* Per Token Breakdown */}
                    <div>
                      <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>Breakdown by Token</h4>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Token</th>
                              <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Wins</th>
                              <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Losses</th>
                              <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Win Rate</th>
                              <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Volume</th>
                            </tr>
                          </thead>
                          <tbody>
                            {netRevenueData.tokenBreakdown.map((token, index) => (
                              <tr key={token.token} style={{
                                background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                              }}>
                                <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <div style={{ fontWeight: '500' }}>{token.token}</div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#00ff88' }}>
                                  ${formatNumber(token.totalWins)}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#ff4444' }}>
                                  ${formatNumber(token.totalLosses)}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  {token?.winRate?.toFixed(1)}%
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  ${formatNumber(token.totalVolume)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
                    <p>No breakdown data available</p>
                  </div>
                )}
              </div>

              {/* Profitability by Token Section */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <PieChart size={24} color="#00ff88" />
                  <h3 style={styles.cardTitle}>Profitability by Token</h3>
                </div>

                {netRevenueLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
                    <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '1rem' }}>Loading profitability data...</p>
                  </div>
                ) : netRevenueData ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {netRevenueData.tokenBreakdown.map((token) => (
                      <div key={token.token} style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h4 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>{token.token}</h4>
                          <div style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            background: token.netRevenue >= 0 ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                            color: token.netRevenue >= 0 ? '#00ff88' : '#ff4444',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {token.netRevenue >= 0 ? 'Profitable' : 'Loss'}
                          </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Net Revenue</div>
                            <div style={{
                              color: token.netRevenue >= 0 ? '#00ff88' : '#ff4444',
                              fontSize: '1.2rem',
                              fontWeight: 'bold'
                            }}>
                              ${formatNumber(token.netRevenue)}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Fees Earned</div>
                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                              ${formatNumber(token.totalFees)}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Total Volume</div>
                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                              ${formatNumber(token.totalVolume)}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Total Bets</div>
                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                              {formatNumber(token.totalBets)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
                    <p>No profitability data available</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && settings && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              {/* Token Settings */}
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
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Wallet size={20} color="white" />
                  </div>
                  Token Configuration
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem',
                  '@media (max-width: 768px)': {
                    gridTemplateColumns: '1fr',
                    gap: '0.75rem'
                  }
                }}>
                  {Object.keys(settings.enabledTokens).map((token) => (
                    <motion.label 
                      key={token}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        borderRadius: '16px',
                        border: '2px solid',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: settings.enabledTokens[token] 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(255, 255, 255, 0.02)',
                        borderColor: settings.enabledTokens[token] 
                          ? 'rgba(34, 197, 94, 0.3)' 
                          : 'rgba(255, 255, 255, 0.1)'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{token}</span>
                      <input
                        type="checkbox"
                        checked={settings.enabledTokens[token]}
                        onChange={(e) => updateSettings({
                          enabledTokens: {
                            ...settings.enabledTokens,
                            [token]: e.target.checked
                          }
                        })}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        ...styles.toggle,
                        background: settings.enabledTokens[token] ? '#22c55e' : 'rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{
                          ...styles.toggleThumb,
                          transform: settings.enabledTokens[token] ? 'translateX(28px)' : 'translateX(0)'
                        }} />
                      </div>
                    </motion.label>
                  ))}
                </div>
                 {/* New Matchmaking System Toggle */}
    <motion.div 
      style={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.02 }}
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 16.98h-5.99c-1.1 0-1.95.9-1.95 1.95v0" />
            <path d="M18 16.98h3.99c1.1 0 1.95-.9 1.95-1.95v0" />
            <path d="M18 13.98h.01" />
            <path d="M18 19.98h.01" />
            <path d="M3.67 17.98h7.36c.55 0 1-.45 1-1v-1.96c0-.55-.45-1-1-1H3.67a1 1 0 0 0-1 1v1.96c0 .55.45 1 1 1z" />
            <path d="M3.67 10.98h7.36c.55 0 1-.45 1-1V8.02c0-.55-.45-1-1-1H3.67a1 1 0 0 0-1 1v1.96c0 .55.45 1 1 1z" />
            <path d="M14.64 10.98h5.69c.55 0 1-.45 1-1V8.02c0-.55-.45-1-1-1h-5.69c-.55 0-1 .45-1 1v1.96c0 .55.45 1 1 1z" />
            <path d="M11.03 7V5.03a2.06 2.06 0 0 0-2.06-2.06h-1.3" />
            <path d="M17.03 7V5.03a2.06 2.06 0 0 0-2.06-2.06h-1.3" />
          </svg>
        </div>
        Matchmaking System
      </h3>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(236, 72, 153, 0.3)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 16.98h-5.99c-1.1 0-1.95.9-1.95 1.95v0" />
              <path d="M18 16.98h3.99c1.1 0 1.95-.9 1.95-1.95v0" />
              <path d="M18 13.98h.01" />
              <path d="M18 19.98h.01" />
              <path d="M3.67 17.98h7.36c.55 0 1-.45 1-1v-1.96c0-.55-.45-1-1-1H3.67a1 1 0 0 0-1 1v1.96c0 .55.45 1 1 1z" />
              <path d="M3.67 10.98h7.36c.55 0 1-.45 1-1V8.02c0-.55-.45-1-1-1H3.67a1 1 0 0 0-1 1v1.96c0 .55.45 1 1 1z" />
              <path d="M14.64 10.98h5.69c.55 0 1-.45 1-1V8.02c0-.55-.45-1-1-1h-5.69c-.55 0-1 .45-1 1v1.96c0 .55.45 1 1 1z" />
              <path d="M11.03 7V5.03a2.06 2.06 0 0 0-2.06-2.06h-1.3" />
              <path d="M17.03 7V5.03a2.06 2.06 0 0 0-2.06-2.06h-1.3" />
            </svg>
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Enable Matchmaking</h4>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.25rem' }}>
              Controls whether the system attempts to match bets at all
            </p>
          </div>
        </div>
        
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={settings.enableMatchmaking}
            onChange={(e) => updateSettings({
              enableMatchmaking: e.target.checked
            })}
            style={{ display: 'none' }}
          />
          <div style={{
            ...styles.toggle,
            background: settings.enableMatchmaking ? '#ec4899' : 'rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              ...styles.toggleThumb,
              transform: settings.enableMatchmaking ? 'translateX(28px)' : 'translateX(0)'
            }} />
          </div>
        </label>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          padding: '1.25rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          borderLeft: '3px solid #22c55e'
        }}>
          <div style={{
            minWidth: '32px',
            minHeight: '32px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Zap size={18} color="#22c55e" />
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>When Enabled</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
              The system will attempt to match bets according to your configuration (P2P, House Bot, or fallback).
              This is the normal operating mode where bets are paired based on your settings.
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          padding: '1.25rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          borderLeft: '3px solid #ef4444'
        }}>
          <div style={{
            minWidth: '32px',
            minHeight: '32px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>When Disabled</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
              <strong>All bets will automatically match with House Bot</strong> - no P2P matching will occur.
              This bypasses all matchmaking logic and immediately pairs every bet with the house bot.
            </p>
          </div>
        </div>
        
        <div style={{
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          borderLeft: '3px solid #f59e0b',
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <strong>Testing Note:</strong> When testing P2P matchmaking integrity, disable this setting to verify 
          that all bets are automatically matching with House Bot as expected. This allows you to isolate and 
          test P2P functionality when re-enabled.
        </div>
      </div>
    </motion.div>
                {/* New Betting Mode Toggle Section */}
                <AnimatePresence>
      {settings.enableMatchmaking && (
    <motion.div 
      style={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
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
          background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        Betting Mode
      </h3>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginBottom: '1rem'
      }}>
        {/* P2P Option */}
        <motion.div 
          style={{
            padding: '1.25rem',
            background: settings.bettingMode === 'p2p' 
              ? 'rgba(59, 130, 246, 0.15)' 
              : 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            border: settings.bettingMode === 'p2p'
              ? '1px solid rgba(59, 130, 246, 0.5)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          whileHover={{ 
            background: settings.bettingMode === 'p2p' 
              ? 'rgba(59, 130, 246, 0.2)'
              : 'rgba(255, 255, 255, 0.05)'
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateSettings({ bettingMode: 'p2p' })}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: settings.bettingMode === 'p2p' 
              ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
              : 'transparent'
          }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <Users size={24} color="#3b82f6" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Peer-to-Peer (P2P)</h4>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.25rem' }}>
                  Users match bets with each other  Fallback to House Bet if no bets match .
                </p>
              </div>
            </div>
            
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: settings.bettingMode === 'p2p'
                ? '7px solid #3b82f6'
                : '2px solid rgba(255, 255, 255, 0.3)',
              background: settings.bettingMode === 'p2p' ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
            }} />
          </div>
        </motion.div>
        
        {/* House Bot Option */}
        <motion.div 
          style={{
            padding: '1.25rem',
            background: settings.bettingMode === 'house-bot' 
              ? 'rgba(139, 92, 246, 0.15)' 
              : 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            border: settings.bettingMode === 'house-bot'
              ? '1px solid rgba(139, 92, 246, 0.5)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          whileHover={{ 
            background: settings.bettingMode === 'house-bot' 
              ? 'rgba(139, 92, 246, 0.2)'
              : 'rgba(255, 255, 255, 0.05)'
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateSettings({ bettingMode: 'house-bot' })}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: settings.bettingMode === 'house-bot' 
              ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)'
              : 'transparent'
          }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  <path d="M9 10h1" />
                  <path d="M9 14h1" />
                  <path d="M12 10h4" />
                  <path d="M12 14h2" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>House Bot</h4>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.25rem' }}>
                  Users bet against the House Bot
                </p>
              </div>
            </div>
            
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: settings.bettingMode === 'house-bot'
                ? '7px solid #8b5cf6'
                : '2px solid rgba(255, 255, 255, 0.3)',
              background: settings.bettingMode === 'house-bot' ? 'rgba(139, 92, 246, 0.2)' : 'transparent'
            }} />
          </div>
        </motion.div>
      </div>
      
      <p style={{
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        borderLeft: '3px solid #f59e0b',
        fontSize: '0.875rem',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        <strong>Note:</strong> Switching modes will affect new bets only. Existing unmatched bets will still be processed in the original mode.
      </p>
    </motion.div>
    )}
    </AnimatePresence>
     {/* New House Bot Fallback Section - Always visible */}
     <AnimatePresence>
      {settings.enableMatchmaking && settings.bettingMode === 'p2p' && (
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
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        House Bot Fallback
      </h3>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="M9 10h1" />
              <path d="M9 14h1" />
              <path d="M12 10h4" />
              <path d="M12 14h2" />
            </svg>
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Enable House Bot Fallback</h4>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.25rem' }}>
              When ON: Match with house bot if no P2P opponent found.
              When OFF : Match Timed Out if no P2P opponent found.
            </p>
          </div>
        </div>
        
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={settings.enableHouseBotFallback}
            onChange={(e) => updateSettings({
              enableHouseBotFallback: e.target.checked
            })}
            style={{ display: 'none' }}
          />
          <div style={{
            ...styles.toggle,
            background: settings.enableHouseBotFallback ? '#8b5cf6' : 'rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              ...styles.toggleThumb,
              transform: settings.enableHouseBotFallback ? 'translateX(28px)' : 'translateX(0)'
            }} />
          </div>
        </label>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        
      </div>
    </motion.div>
     )}
    </AnimatePresence>
       {/* New Timeout Setting Section - Only visible when fallback is enabled */}
   <AnimatePresence>
      {settings.enableMatchmaking && settings.bettingMode === 'p2p' && settings.enableHouseBotFallback && (
      <motion.div 
        style={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
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
            background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={20} color="white" />
          </div>
          Fallback Timeout Settings
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <label style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Clock size={18} />
                P2P Search Timeout
              </label>
              <span style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {settings.houseBotFallbackTimeout}s
              </span>
            </div>
            
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '1.5rem'
            }}>
              How long to search for a P2P match before falling back to House Bot
            </p>
            
            <input
              type="range"
              min="3"
              max="60"
              step="1"
              value={settings.houseBotFallbackTimeout}
              onChange={(e) => updateSettings({
                houseBotFallbackTimeout: Number(e.target.value)
              })}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${(settings.houseBotFallbackTimeout - 3) / (60 - 3) * 100}%, rgba(255, 255, 255, 0.1) ${(settings.houseBotFallbackTimeout - 3) / (60 - 3) * 100}%, rgba(255, 255, 255, 0.1) 100%)`,
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none'
              }}
            />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '0.5rem'
            }}>
              <span>3s</span>
              <span>30s</span>
              <span>60s</span>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{
              padding: '1rem',
              background: 'rgba(14, 165, 233, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(14, 165, 233, 0.2)'
            }}>
              <h4 style={{
                fontWeight: '600',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Zap size={16} color="#0ea5e9" />
                Short Timeout (3-10s)
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Faster matches but may miss potential P2P opponents
              </p>
            </div>
            
            <div style={{
              padding: '1rem',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <h4 style={{
                fontWeight: '600',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Settings size={16} color="#8b5cf6" />
                Medium Timeout (11-30s)
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Balance between match speed and finding P2P opponents
              </p>
            </div>
            
            <div style={{
              padding: '1rem',
              background: 'rgba(236, 72, 153, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(236, 72, 153, 0.2)'
            }}>
              <h4 style={{
                fontWeight: '600',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Users size={16} color="#ec4899" />
                Long Timeout (31-60s)
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Better chance for P2P matches but users wait longer
              </p>
            </div>
          </div>
          
          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            borderLeft: '3px solid #f59e0b',
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            <strong>Note:</strong> This setting only applies when both P2P mode and House Bot Fallback are enabled.
            The timer starts when a bet is placed and searches for P2P matches before falling back to House Bot.
          </div>
        </div>
      </motion.div>
    )}
    </AnimatePresence>
                {/* Bet Limits */}
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Shield size={20} style={{ color: '#a855f7' }} />
                  Bet Limits
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {Object.keys(localBetLimits).map((token) => (
                    <div key={token} style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr 1fr',
                      gap: '1rem',
                      alignItems: 'center',
                      '@media (max-width: 768px)': {
                        gridTemplateColumns: '1fr',
                        gap: '0.75rem'
                      }
                    }}>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: settings.enabledTokens[token] ? '#22c55e' : '#ef4444'
                        }} />
                        {token}
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          marginBottom: '0.5rem'
                        }}>
                          Minimum
                        </label>
                        <input
                          type="number"
                          value={localBetLimits[token]?.min || 0}
                          onChange={(e) => handleBetLimitChange(token, 'min', e.target.value)}
                          style={styles.input}
                          step="0.000001"
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          marginBottom: '0.5rem'
                        }}>
                          Maximum
                        </label>
                        <input
                          type="number"
                          value={localBetLimits[token]?.max || 0}
                          onChange={(e) => handleBetLimitChange(token, 'max', e.target.value)}
                          style={styles.input}
                          step="0.000001"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Save Button */}
                <motion.button
                  style={{
                    ...styles.neonButton,
                    borderColor: '#22c55e',
                    color: '#22c55e',
                    background: 'rgba(34, 197, 94, 0.1)',
                    marginTop: '2rem',
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    padding: '1rem 2rem'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveBetLimits}
                >
                  <Check size={20} />
                  Save Token Settings
                </motion.button>
              </motion.div>

              {/* Referral Settings */}
              <motion.div 
                style={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="hover-lift"
              >
                <div style={styles.cardGlow} />
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem'
                }}>
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
                      background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={20} color="white" />
                    </div>
                    Referral Program
                  </h3>
                  
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    <span style={{ fontWeight: '500' }}>
                      {settings.referralBonus.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.referralBonus.enabled}
                      onChange={(e) => updateSettings({
                        referralBonus: {
                          ...settings.referralBonus,
                          enabled: e.target.checked
                        }
                      })}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      ...styles.toggle,
                      background: settings.referralBonus.enabled ? '#22c55e' : 'rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{
                        ...styles.toggleThumb,
                        transform: settings.referralBonus.enabled ? 'translateX(28px)' : 'translateX(0)'
                      }} />
                    </div>
                  </label>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '0.5rem'
                    }}>
                      Bonus Token
                    </label>
                    <select
                      value={settings.referralBonus.tokenType}
                      onChange={(e) => updateSettings({
                        referralBonus: {
                          ...settings.referralBonus,
                          tokenType: e.target.value
                        }
                      })}
                      style={{
                        ...styles.input,
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '3rem'
                      }}
                    >
                      {Object.keys(settings.enabledTokens)
                        .filter(token => settings.enabledTokens[token])
                        .map(token => (
                          <option key={token} value={token} style={{ background: '#1a1a1a' }}>
                            {token}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '0.5rem'
                    }}>
                      Withdrawable
                    </label>
                    <select
                      value={settings.referralBonus.isWithdrawable ? 'yes' : 'no'}
                      onChange={(e) => updateSettings({
                        referralBonus: {
                          ...settings.referralBonus,
                          isWithdrawable: e.target.value === 'yes'
                        }
                      })}
                      style={{
                        ...styles.input,
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '3rem'
                      }}
                    >
                      <option value="no" style={{ background: '#1a1a1a' }}>No - In-game use only</option>
                      <option value="yes" style={{ background: '#1a1a1a' }}>Yes - Can withdraw</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '0.5rem'
                    }}>
                      Referrer Bonus
                    </label>
                    <input
                      type="number"
                      value={settings.referralBonus.referrerAmount}
                      onChange={(e) => updateSettings({
                        referralBonus: {
                          ...settings.referralBonus,
                          referrerAmount: Number(e.target.value)
                        }
                      })}
                      style={styles.input}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '0.5rem'
                    }}>
                      Referee Bonus
                    </label>
                    <input
                      type="number"
                      value={settings.referralBonus.refereeAmount}
                      onChange={(e) => updateSettings({
                        referralBonus: {
                          ...settings.referralBonus,
                          refereeAmount: Number(e.target.value)
                        }
                      })}
                      style={styles.input}
                    />
                  </div>
                </div>
                
                {/* Save Button */}
                <motion.button
                  style={{
                    ...styles.neonButton,
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    background: 'rgba(59, 130, 246, 0.1)',
                    marginTop: '2rem',
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    padding: '1rem 2rem'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSuccess('Referral settings saved successfully!');
                    setTimeout(() => setSuccess(''), 3000);
                  }}
                >
                  <Check size={20} />
                  Save Referral Settings
                </motion.button>
              </motion.div>

              {/* House Settings */}
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
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Database size={20} color="white" />
                  </div>
                  House Configuration
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '0.5rem'
                    }}>
                      House Wallet Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={settings.houseWalletAddress}
                        readOnly
                        // onChange={(e) => updateSettings({ houseWalletAddress: e.target.value })}
                        style={{
                          ...styles.input,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          paddingRight: '3rem'
                        }}
                      />
                      <button
                        onClick={() => copyToClipboard(settings.houseWalletAddress, 'house')}
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
                          justifyContent: 'center'
                        }}
                      >
                        {copiedCode === 'house' ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>House Fee Percentage</span>
                      <span style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#a855f7'
                      }}>
                        {localHouseSettings.houseFeePercentage}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="0.5"
                      value={localHouseSettings.houseFeePercentage}
                      onChange={(e) => handleHouseFeeChange(Number(e.target.value))}
                      style={{
                        width: '100%',
                        height: '8px',
                        borderRadius: '4px',
                        background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${localHouseSettings.houseFeePercentage * 2}%, rgba(255, 255, 255, 0.1) ${localHouseSettings.houseFeePercentage * 2}%, rgba(255, 255, 255, 0.1) 100%)`,
                        outline: 'none',
                        cursor: 'pointer',
                        WebkitAppearance: 'none'
                      }}
                    />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.4)',
                      marginTop: '0.5rem'
                    }}>
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                    </div>
                  </div>
                </div>
                
                {/* Save Button */}
                <motion.button
                  style={{
                    ...styles.neonButton,
                    borderColor: '#8b5cf6',
                    color: '#8b5cf6',
                    background: 'rgba(139, 92, 246, 0.1)',
                    marginTop: '2rem',
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    padding: '1rem 2rem'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveHouseSettings}
                >
                  <Check size={20} />
                  Save House Settings
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'walletanalytics' && (
            <motion.div
              key="walletanalytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              {/* User Analytics Header */}
              <motion.div
                style={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div style={styles.cardGlow} />
                
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Users size={24} color="white" />
                  </div>
                  User Analytics
                </h2>

                {/* Filter Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '2rem',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { id: 'all', label: 'All Users' },
                    // { id: 'high-volume', label: 'High Volume' },
                    // { id: 'top-referrers', label: 'Top Referrers' }
                  ].map((filter) => (
                    <motion.button
                      key={filter.id}
                      onClick={() => {
                        setUserAnalyticsFilter(filter.id);
                        fetchUserAnalytics(filter.id);
                      }}
                      style={{
                        ...styles.neonButton,
                        background: userAnalyticsFilter === filter.id 
                          ? 'rgba(59, 130, 246, 0.2)' 
                          : 'rgba(59, 130, 246, 0.1)',
                        borderColor: userAnalyticsFilter === filter.id 
                          ? 'rgba(59, 130, 246, 0.5)' 
                          : 'rgba(59, 130, 246, 0.3)',
                        color: userAnalyticsFilter === filter.id ? '#3b82f6' : 'rgba(59, 130, 246, 0.8)',
                        padding: '0.75rem 1.5rem'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {filter.label}
                    </motion.button>
                  ))}
                </div>

                {/* Summary Statistics */}
                {userAnalyticsData.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                        {userAnalyticsData.length}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Total Users
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '8px',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                        {userAnalyticsData.filter(user => user.totalGames > 0).length}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Active Players
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      borderRadius: '8px',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a855f7' }}>
                        {userAnalyticsData.filter(user => user.totalVolume >= 100).length}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        High Volume Users
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '8px',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                        {userAnalyticsData.filter(user => user.referredUsersCount > 0).length}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Referrers
                      </div>
                    </div>
                  </div>
                )}

                {/* Responsive Table Container */}
                <div style={{
                  width: '100%',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
                }}>
                  {/* User Analytics Table */}
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    minWidth: '1300px' // Increased to accommodate wider username column
                  }}>
                    {/* Table Container with fixed width for responsiveness */}
                    <div style={{
                      width: '100%'
                    }}>
                      {/* Table Header */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr',
                        gap: '0.75rem',
                        padding: '1rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10
                      }}>
                        <div>Wallet Address</div>
                        <div>Username</div>
                        <div>Type</div>
                        <div>Games</div>
                        <div>Volume</div>
                        <div>Wins</div>
                        <div>Losses</div>
                        <div>Net P/L</div>
                        <div>Referrer</div>
                        <div>Join Date</div>
                        <div>Actions</div>
                      </div>

                      {/* Table Content */}
                      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {userAnalyticsLoading ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3rem',
                            color: 'rgba(255, 255, 255, 0.6)'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              border: '4px solid rgba(59, 130, 246, 0.3)',
                              borderTop: '4px solid #3b82f6',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }} />
                            <span style={{ marginLeft: '1rem' }}>Loading user analytics...</span>
                          </div>
                        ) : userAnalyticsData.length === 0 ? (
                          <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            color: 'rgba(255, 255, 255, 0.6)'
                          }}>
                            No user data available
                          </div>
                        ) : (
                          userAnalyticsData.map((user, index) => (
                            <motion.div
                              key={user.walletAddress || index}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1.5fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr',
                              gap: '0.75rem',
                              padding: '1rem',
                              borderBottom: index < userAnalyticsData.length - 1 ? '1px solid rgba(59, 130, 246, 0.1)' : 'none',
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: '0.8rem',
                              transition: 'background-color 0.2s ease',
                              cursor: 'pointer'
                            }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                              }}
                            >
                              <div style={{
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                minWidth: '120px' // Ensure minimum width for wallet address
                              }}>
                                {user.walletAddress ? 
                                  `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 6)}` 
                                  : 'N/A'
                                }
                              </div>
                              <div style={{ fontSize: '0.75rem', minWidth: '150px' }}>
                                {user.loginType === 'registered' ? (user.userName || 'N/A') : '--'}
                              </div>
                              <div style={{ 
                                fontSize: '0.75rem',
                                color: user.loginType === 'registered' ? '#10b981' : '#f59e0b',
                                fontWeight: 'bold',
                                minWidth: '60px'
                              }}>
                                {user.loginType === 'registered' ? 'Registered' : 'Guest'}
                              </div>
                              <div style={{ minWidth: '50px' }}>{user.totalGames || 0}</div>
                              <div style={{ minWidth: '80px' }}>{formatCurrency(user.totalVolume || 0)}</div>
                              <div style={{ color: '#10b981', minWidth: '50px' }}>{user.wins || 0}</div>
                              <div style={{ color: '#ef4444', minWidth: '50px' }}>{user.losses || 0}</div>
                              <div style={{ 
                                color: (user.netPL || 0) >= 0 ? '#10b981' : '#ef4444',
                                fontWeight: 'bold',
                                minWidth: '80px'
                              }}>
                                {formatCurrency(user.netPL || 0)}
                              </div>
                              <div style={{ fontSize: '0.75rem', minWidth: '60px' }}>
                                {user.referrer ? 
                                  `${user.referrer.substring(0, 4)}...` 
                                  : 'Direct'
                                }
                              </div>
                              <div style={{ fontSize: '0.75rem', minWidth: '80px' }}>
                                {user.joinDate ? 
                                  new Date(user.joinDate).toLocaleDateString() 
                                  : 'N/A'
                                }
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px' }}>
                                {user.loginType === 'registered' && (
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openPasswordModal(user);
                                    }}
                                    style={{
                                      background: 'rgba(59, 130, 246, 0.1)',
                                      border: '1px solid rgba(59, 130, 246, 0.3)',
                                      borderRadius: '6px',
                                      padding: '0.25rem 0.5rem',
                                      color: '#3b82f6',
                                      fontSize: '0.7rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      whiteSpace: 'nowrap'
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Key size={12} />
                                    Change Password
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'ambassadors' && (
            <motion.div
              key="ambassadors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >

{/* Create Ambassador */}
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
      background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Award size={20} color="white" />
    </div>
    Create New Ambassador
  </h3>
  
  <form 
    onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      createAmbassador({
        walletAddress: formData.get('walletAddress'),
        ambassadorCode: formData.get('ambassadorCode'),
        commissionPercentage: Number(formData.get('commissionPercentage')),
        username: formData.get('username'),
        password: formData.get('password')
      });
      e.target.reset();
    }} 
    style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '1.5rem',
      alignItems: 'end'
    }}
  >
    {/* Wallet Address - Full Width */}
    <div style={{ gridColumn: '1 / -1' }}>
      <label style={{
        display: 'block',
        fontSize: '0.875rem',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: '0.5rem'
      }}>
        User Wallet Address
      </label>
      <input
        name="walletAddress"
        placeholder="0x..."
        style={styles.input}
        required
      />
    </div>
    
    {/* Username - Left Column */}
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          Username
        </label>
        
        <motion.button
          type="button"
          onClick={() => {
            const randomUser = `user_${Math.random().toString(36).substring(2, 8)}`;
            if (usernameRef.current) usernameRef.current.value = randomUser;
            setSuccess('Username generated!');
            setTimeout(() => setSuccess(''), 2000);
          }}
          style={{
            ...styles.neonButton,
            padding: '0.5rem 0.75rem',
            fontSize: '0.75rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            color: '#3b82f6',
            whiteSpace: 'nowrap'
          }}
          whileHover={{ 
            scale: 1.05,
            background: 'rgba(59, 130, 246, 0.2)',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={14} />
          Generate
        </motion.button>
      </div>
      
      <input
        name="username"
        ref={usernameRef}
        placeholder="Enter username"
        style={styles.input}
        required
      />
    </div>
    
    {/* Password - Right Column */}
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          Password
        </label>
        
        <motion.button
          type="button"
          onClick={() => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
            let password = '';
            for (let i = 0; i < 12; i++) {
              password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            if (passwordRef.current) passwordRef.current.value = password;
            setSuccess('Password generated!');
            setTimeout(() => setSuccess(''), 2000);
          }}
          style={{
            ...styles.neonButton,
            padding: '0.5rem 0.75rem',
            fontSize: '0.75rem',
            background: 'rgba(236, 72, 153, 0.1)',
            borderColor: 'rgba(236, 72, 153, 0.3)',
            color: '#ec4899',
            whiteSpace: 'nowrap'
          }}
          whileHover={{ 
            scale: 1.05,
            background: 'rgba(236, 72, 153, 0.2)',
            boxShadow: '0 0 15px rgba(236, 72, 153, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={14} />
          Generate
        </motion.button>
      </div>
      
      <div style={{ position: 'relative' }}>
        <input
          name="password"
          ref={passwordRef}
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          style={{
            ...styles.input,
            paddingRight: '3rem'  // Make space for the eye button
          }}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '0.75rem',
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
    
    {/* Ambassador Code - Left Column */}
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          Ambassador Code
        </label>
        
        <motion.button
          type="button"
          onClick={generateUniqueCode}
          style={{
            ...styles.neonButton,
            padding: '0.5rem 0.75rem',
            fontSize: '0.75rem',
            background: 'rgba(168, 85, 247, 0.1)',
            borderColor: 'rgba(168, 85, 247, 0.3)',
            color: '#a855f7',
            whiteSpace: 'nowrap'
          }}
          whileHover={{ 
            scale: 1.05,
            background: 'rgba(168, 85, 247, 0.2)',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={14} />
          Generate
        </motion.button>
      </div>
      
      <input
        name="ambassadorCode"
        ref={ambassadorCodeRef}
        placeholder="PULSE2025"
        style={{ ...styles.input, textTransform: 'uppercase' }}
        required
      />
    </div>
    
    {/* Commission Percentage - Right Column */}
    <div>
      <label style={{
        display: 'block',
        fontSize: '0.875rem',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: '0.5rem'
      }}>
        Commission %
      </label>
      <input
        name="commissionPercentage"
        type="number"
        placeholder="10"
        min="0"
        max="50"
        style={styles.input}
        required
      />
    </div>
    
    {/* Submit Button - Full Width */}
    <motion.button 
      type="submit"
      style={{
        ...styles.neonButton,
        gridColumn: '1 / -1',
        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        border: 'none',
        color: 'white',
        padding: '1rem',
        fontSize: '1rem',
        fontWeight: '600',
        marginTop: '0.5rem',
        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
      }}
      whileHover={{ scale: 1.02, boxShadow: '0 6px 30px rgba(245, 158, 11, 0.6)' }}
      whileTap={{ scale: 0.98 }}
    >
      CREATE AMBASSADOR
    </motion.button>
  </form>
</motion.div>

{/* Pending Commission Requests */}
<motion.div 
  style={styles.card}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
>
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
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Clock size={20} color="white" />
    </div>
    Pending Commission Requests
  </h3>
  
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    {(!pendingRequests || pendingRequests.length === 0) ? (
      <div style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '1rem'
      }}>
        No pending commission requests
      </div>
    ) : (
      (pendingRequests || []).map((request) => (
        <div key={request.id} style={{
          background: 'rgba(39, 23, 65, 0.4)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                fontWeight: '600',
                fontSize: '1.1rem',
                color: '#f59e0b'
              }}>
                {request.ambassadorUsername}
              </div>
              <div style={{
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#a855f7',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.85rem'
              }}>
                {request.ambassadorCode}
              </div>
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '0.25rem'
            }}>
              Amount: <span style={{ color: '#10b981', fontWeight: '600' }}>
                ${request?.amount?.toFixed(2)}
              </span>
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.6)',
              wordBreak: 'break-all'
            }}>
              Payout Wallet Address: {request.payoutWalletAddress}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '0.5rem'
            }}>
              Requested: {new Date(request.requestedAt).toLocaleDateString()} at {new Date(request.requestedAt).toLocaleTimeString()}
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center'
          }}>
            <motion.button
              onClick={() => handleApproveRequest(request.requestId)}
              style={{
                ...styles.neonButton,
                background: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem'
              }}
              whileHover={{ 
                scale: 1.05,
                background: 'rgba(16, 185, 129, 0.2)',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Check size={16} style={{ marginRight: '0.5rem' }} />
              Approve
            </motion.button>
            
            <motion.button
              onClick={() => handleRejectRequest(request.requestId)}
              style={{
                ...styles.neonButton,
                background: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem'
              }}
              whileHover={{ 
                scale: 1.05,
                background: 'rgba(239, 68, 68, 0.2)',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={16} style={{ marginRight: '0.5rem' }} />
              Reject
            </motion.button>
          </div>
        </div>
      ))
    )}
  </div>
</motion.div>

{/* Approved Commission Requests */}
<motion.div 
  style={styles.card}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.3 }}
>
  <div style={styles.cardGlow} />
  
  <h3 style={{
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'white'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Check size={20} color="white" />
    </div>
    Approved Commission Requests
  </h3>
  
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    {approvedRequestsLoading ? (
      <div style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '1rem'
      }}>
        Loading approved requests...
      </div>
    ) : (!approvedRequests || approvedRequests.length === 0) ? (
      <div style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '1rem'
      }}>
        No approved commission requests
      </div>
    ) : (
      (approvedRequests || []).map((request) => (
        <div key={request.id} style={{
          background: 'rgba(39, 23, 65, 0.4)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem'
          }}>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                {request.ambassadorUsername}
              </h4>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                marginBottom: '0.25rem'
              }}>
                Code: {request.ambassadorCode} | Rate: {request.commissionRate}%
              </p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                marginBottom: '0.25rem'
              }}>
                Amount: {request?.amount?.toFixed(2)} sol
              </p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                marginBottom: '0.25rem'
              }}>
                payout wallet: {request.payoutWalletAddress.substring(0, 8)}...{request.payoutWalletAddress.substring(request.payoutWalletAddress.length - 8)}
              </p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem'
              }}>
                Approved: {new Date(request.processedAt).toLocaleDateString()}
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center'
            }}>
              <motion.button
                onClick={() => handleProcessPaymentClick(request)}
                style={{
                  ...styles.neonButton,
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem'
                }}
                whileHover={{ 
                  scale: 1.05,
                  background: 'rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Check size={16} style={{ marginRight: '0.5rem' }} />
                Process Payment
              </motion.button>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</motion.div>

              {/* Ambassadors List */}
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
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <Globe size={24} style={{ color: '#a855f7' }} />
                  Active Ambassadors
                </h3>
                
                {ambassadors.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {ambassadors.map((amb) => (
                      <motion.div
                        key={amb._id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '20px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                        whileHover={{ 
                          scale: 1.01,
                          background: 'rgba(255, 255, 255, 0.04)'
                        }}
                      >
                        <div 
                          style={{
                            padding: '1.5rem',
                            cursor: 'pointer'
                          }}
                          onClick={() => setExpandedAmbassador(
                            expandedAmbassador === amb._id ? null : amb._id
                          )}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)'
                              }}>
                                <Award size={28} color="white" />
                              </div>
                              
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <h4 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold'
                                  }}>
                                    {amb.ambassadorCode}
                                  </h4>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(amb.ambassadorCode, amb._id);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'rgba(255, 255, 255, 0.6)',
                                      cursor: 'pointer',
                                      padding: '0.25rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    {copiedCode === amb._id ? <Check size={18} /> : <Copy size={18} />}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAmbassador(amb);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'rgba(255, 255, 255, 0.6)',
                                      cursor: 'pointer',
                                      padding: '0.25rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: '4px',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.color = '#a855f7';
                                      e.target.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                                      e.target.style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <Edit3 size={18} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAmbassador(amb);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'rgba(255, 255, 255, 0.6)',
                                      cursor: 'pointer',
                                      padding: '0.25rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: '4px',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.color = '#ef4444';
                                      e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                                      e.target.style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                                <p style={{
                                  fontSize: '0.875rem',
                                  color: 'rgba(255, 255, 255, 0.5)',
                                  fontFamily: 'monospace'
                                }}>
                                  {amb.userId.slice(0, 8)}...{amb.userId.slice(-6)}
                                </p>
                              </div>
                            </div>
                            
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1.5rem',
                              flexWrap: 'wrap'
                            }}>
                              <div style={{ textAlign: 'center' }}>
                                <p style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  marginBottom: '0.25rem'
                                }}>
                                  Commission
                                </p>
                                <p style={{
                                  fontSize: '1.25rem',
                                  fontWeight: 'bold',
                                  color: '#3b82f6'
                                }}>
                                  {amb.commissionPercentage}%
                                </p>
                              </div>
                              
                              <div style={{ textAlign: 'center' }}>
                                <p style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  marginBottom: '0.25rem'
                                }}>
                                  Referrals
                                </p>
                                <p style={{
                                  fontSize: '1.25rem',
                                  fontWeight: 'bold',
                                  color: '#a855f7'
                                }}>
                                  {amb?.referredUsers?.length}
                                </p>
                              </div>
                              
                              <div style={{ textAlign: 'center' }}>
                                <p style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  marginBottom: '0.25rem'
                                }}>
                                  Total Losses
                                </p>
                                <p style={{
                                  fontSize: '1.25rem',
                                  fontWeight: 'bold',
                                  color: '#ef4444'
                                }}>
                                  ${formatNumber(amb?.totalLossesGenerated?.toFixed(6))}
                                </p>
                              </div>
                              
                              <div style={{ textAlign: 'center' }}>
                                <p style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  marginBottom: '0.25rem'
                                }}>
                                  Total Wins
                                </p>
                                <p style={{
                                  fontSize: '1.25rem',
                                  fontWeight: 'bold',
                                  color: '#22c55e'
                                }}>
                                  ${formatNumber(amb?.totalWinsGenerated?.toFixed(6))}
                                </p>
                              </div>
                              
                              <div style={{ textAlign: 'center' }}>
                                <p style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  marginBottom: '0.25rem'
                                }}>
                                  Net Loss
                                </p>
                                <p style={{
                                  fontSize: '1.25rem',
                                  fontWeight: 'bold',
                                  color: amb.totalNetLoss > 0 ? '#ef4444' : '#22c55e'
                                }}>
                                  ${formatNumber(amb?.totalNetLoss?.toFixed(6))}
                                </p>
                              </div>
                              
                              <div style={{ textAlign: 'center' }}>
                                <p style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  marginBottom: '0.25rem'
                                }}>
                                  Total Earnings
                                </p>
                                <p style={{
                                  fontSize: '1.25rem',
                                  fontWeight: 'bold',
                                  color: amb.totalEarnings < 0 ? '#ef4444' : '#f59e0b'
                                }}>
                                  ${amb?.totalEarnings < 0 ? '0.00' : formatNumber(amb?.totalEarnings?.toFixed(6))}
                                </p>
                              </div>
                              
                              <div style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: amb.isActive 
                                  ? 'rgba(34, 197, 94, 0.1)' 
                                  : 'rgba(239, 68, 68, 0.1)',
                                color: amb.isActive ? '#22c55e' : '#ef4444',
                                border: `1px solid ${amb.isActive 
                                  ? 'rgba(34, 197, 94, 0.3)' 
                                  : 'rgba(239, 68, 68, 0.3)'}`
                              }}>
                                {amb.isActive ? 'Active' : 'Inactive'}
                              </div>
                              
                              <div style={{
                                transition: 'transform 0.3s ease',
                                transform: expandedAmbassador === amb._id ? 'rotate(180deg)' : 'rotate(0)'
                              }}>
                                <ChevronDown size={20} />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedAmbassador === amb._id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                overflow: 'hidden',
                                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                              }}
                            >
                              <div style={{ padding: '1.5rem' }}>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '1.5rem'
                                }}>
                                  <h5 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                  }}>
                                    <Clock size={18} style={{ color: '#a855f7' }} />
                                    Recent Loss Bets
                                  </h5>
                                  <motion.button
                                    onClick={() => refreshAmbassadorData(amb._id)}
                                    style={{
                                      ...styles.neonButton,
                                      borderColor: '#3b82f6',
                                      color: '#3b82f6',
                                      padding: '0.5rem 1.25rem',
                                      fontSize: '0.875rem'
                                    }}
                                    whileHover={{ scale: 1.02, borderColor: '#60a5fa' }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    Refresh Data
                                  </motion.button>
                                </div>
                                
                                                                {amb.recentLossBets && amb.recentLossBets.length > 0 ? (
                                  <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                  }} className="admin-scrollbar">
                                    {amb.recentLossBets.map((bet, idx) => (
                                      <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          padding: '1rem',
                                          background: 'rgba(255, 255, 255, 0.02)',
                                          borderRadius: '12px',
                                          border: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}
                                      >
                                        <div>
                                          <p style={{
                                            fontSize: '0.875rem',
                                            marginBottom: '0.25rem'
                                          }}>
                                            User: {bet.userId.slice(0, 8)}...
                                          </p>
                                          <p style={{
                                            fontSize: '0.75rem',
                                            color: 'rgba(255, 255, 255, 0.5)'
                                          }}>
                                            {bet.formattedDate || 'Date not available'}
                                          </p>
                                        </div>
                                        
                                        <div style={{ textAlign: 'right' }}>
                                          <p style={{
                                            fontSize: '0.875rem',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            marginBottom: '0.25rem'
                                          }}>
                                            Loss: {formatCurrency(bet.amount, bet.token)} {bet.token}
                                          </p>
                                          <p style={{
                                            color: '#22c55e',
                                            fontWeight: '600'
                                          }}>
                                            +{formatCurrency((bet.amount * amb.commissionPercentage / 100), bet.token)} {bet.token}
                                          </p>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                ) : (
                                  <div style={{
                                    textAlign: 'center',
                                    padding: '3rem 2rem',
                                    color: 'rgba(255, 255, 255, 0.4)'
                                  }}>
                                    <Wallet size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <p>No loss bets found yet</p>
                                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                      Loss bets from referred users will appear here
                                    </p>
                                  </div>
                                )}
                              </div>
                              {/* Referred Users Section */}
                              <div style={{ marginTop: '2.5rem' }}>
                                <h5 style={{
                                  fontSize: '1.1rem',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  marginBottom: '1rem'
                                }}>
                                  <Users size={18} style={{ color: '#a855f7' }} />
                                  Referred Users
                                </h5>
                                {amb.referredUserDetails && amb.referredUserDetails.length > 0 ? (
                                  <div style={{
                                    overflowX: 'auto',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    background: 'rgba(255,255,255,0.01)',
                                    marginBottom: '1rem'
                                  }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.95rem' }}>
                                      <thead>
                                        <tr style={{ background: 'rgba(168,85,247,0.07)' }}>
                                          <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Wallet Address</th>
                                          <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Username / Email</th>
                                          <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {amb.referredUserDetails.map((user, idx) => (
                                          <tr key={user._id || user.walletAddress || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{user.walletAddress ? `${user.walletAddress.slice(0,8)}...${user.walletAddress.slice(-6)}` : '-'}</td>
                                            <td style={{ padding: '0.75rem' }}>{user.username || user.email || '-'}</td>
                                            <td style={{ padding: '0.75rem' }}>{user.loginType === 'registered' ? 'Registered' : 'Guest'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div style={{
                                    textAlign: 'center',
                                    padding: '2rem 1rem',
                                    color: 'rgba(255,255,255,0.4)'
                                  }}>
                                    <Users size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <p>No users have registered with this ambassador's code yet.</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    color: 'rgba(255, 255, 255, 0.4)'
                  }}>
                    <Award size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
                    <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                      No ambassadors created yet
                    </p>
                    <p style={{ fontSize: '0.875rem' }}>
                      Create your first ambassador to start the referral program
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
          // Add the new tab content
{activeTab === 'activebetqueue' && (
  <motion.div
    key="activebetqueue"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
  >
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
        <Activity size={24} style={{ color: '#a855f7' }} />
        Active Bet Queue (Unmatched Bets)
      </h3>
      
      {stats?.allActiveBets?.length > 0 ? (
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
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Stake</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Direction</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.allActiveBets.map((bet, index) => (
                <tr 
                  key={`${bet.userId}-${index}`} 
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>
                    {bet.userId.slice(0, 8)}...{bet.userId.slice(-6)}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>
                    {bet.amount} {bet.token}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: bet.direction === 'up' ? '#22c55e' : '#ef4444'
                    }}>
                      {bet.direction === 'up' ? (
                        <>
                          <ArrowUp size={16} /> Up
                        </>
                      ) : (
                        <>
                          <ArrowDown size={16} /> Down
                        </>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} />
                    {new Date(bet.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
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
          <Activity size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
          <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            No active unmatched bets
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            All bets are currently matched
          </p>
        </div>
      )}
    </motion.div>
  </motion.div>
)}
{activeTab === 'treasury' && <TreasuryManagement />}
        </AnimatePresence>

        {/* Edit Ambassador Modal */}
        <AnimatePresence>
          {showEditModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={handleCloseEditModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '2rem',
                  maxWidth: '600px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: 0
                  }}>
                    Edit Ambassador
                  </h2>
                  <button
                    onClick={handleCloseEditModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Wallet Address */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: '500'
                    }}>
                      Wallet Address
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editForm.walletAddress}
                        onChange={(e) => handleEditFormChange('walletAddress', e.target.value)}
                        disabled={!editingFields.walletAddress}
                        style={{
                          ...styles.input,
                          flex: 1,
                          opacity: editingFields.walletAddress ? 1 : 0.7
                        }}
                      />
                      <button
                        onClick={() => toggleFieldEdit('walletAddress')}
                        style={{
                          background: editingFields.walletAddress ? '#10b981' : '#6b7280',
                          border: 'none',
                          color: 'white',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: '500'
                    }}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      disabled={true}
                      style={{
                        ...styles.input,
                        opacity: 0.7,
                        cursor: 'not-allowed'
                      }}
                    />
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: '0.25rem',
                      fontStyle: 'italic'
                    }}>
                      Username cannot be changed (unique identifier)
                    </p>
                  </div>

                  {/* Password */}
                  {/* <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: '500'
                    }}>
                      Password
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="password"
                        value={editForm.password}
                        onChange={(e) => handleEditFormChange('password', e.target.value)}
                        disabled={!editingFields.password}
                        placeholder="Leave empty to keep current password"
                        style={{
                          ...styles.input,
                          flex: 1,
                          opacity: editingFields.password ? 1 : 0.7
                        }}
                      />
                      <button
                        onClick={() => toggleFieldEdit('password')}
                        style={{
                          background: editingFields.password ? '#10b981' : '#6b7280',
                          border: 'none',
                          color: 'white',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </div> */}

                  {/* Ambassador Code */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: '500'
                    }}>
                      Ambassador Code
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editForm.ambassadorCode}
                        onChange={(e) => handleEditFormChange('ambassadorCode', e.target.value)}
                        disabled={!editingFields.ambassadorCode}
                        style={{
                          ...styles.input,
                          flex: 1,
                          opacity: editingFields.ambassadorCode ? 1 : 0.7
                        }}
                      />
                      <button
                        onClick={() => toggleFieldEdit('ambassadorCode')}
                        style={{
                          background: editingFields.ambassadorCode ? '#10b981' : '#6b7280',
                          border: 'none',
                          color: 'white',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Commission Rate */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: '500'
                    }}>
                      Commission Rate (%)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={editForm.commissionRate}
                        onChange={(e) => handleEditFormChange('commissionRate', e.target.value)}
                        disabled={!editingFields.commissionRate}
                        min="0"
                        max="50"
                        step="0.1"
                        style={{
                          ...styles.input,
                          flex: 1,
                          opacity: editingFields.commissionRate ? 1 : 0.7
                        }}
                      />
                      <button
                        onClick={() => toggleFieldEdit('commissionRate')}
                        style={{
                          background: editingFields.commissionRate ? '#10b981' : '#6b7280',
                          border: 'none',
                          color: 'white',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Payout Wallet Address */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: '500'
                    }}>
                      Payout Wallet Address
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editForm.payoutWalletAddress}
                        onChange={(e) => handleEditFormChange('payoutWalletAddress', e.target.value)}
                        disabled={!editingFields.payoutWalletAddress}
                        placeholder="Enter payout wallet address"
                        style={{
                          ...styles.input,
                          flex: 1,
                          opacity: editingFields.payoutWalletAddress ? 1 : 0.7
                        }}
                      />
                      <button
                        onClick={() => toggleFieldEdit('payoutWalletAddress')}
                        style={{
                          background: editingFields.payoutWalletAddress ? '#10b981' : '#6b7280',
                          border: 'none',
                          color: 'white',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: '0.25rem',
                      fontStyle: 'italic'
                    }}>
                      This is where commissions will be paid to the ambassador
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '2rem',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={handleCloseEditModal}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={editLoading}
                    style={{
                      background: editLoading ? 'rgba(168, 85, 247, 0.5)' : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      cursor: editLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {editLoading && <RefreshCw size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Ambassador Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={handleCancelDelete}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '2rem',
                  maxWidth: '500px',
                  width: '100%',
                  textAlign: 'center'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    border: '2px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <Trash2 size={32} color="#ef4444" />
                  </div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Delete Ambassador
                  </h2>
                  <p style={{
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Do you want to delete this ambassador <strong style={{ color: '#ef4444' }}>{deletingAmbassador?.ambassadorCode}</strong>?
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: '1rem 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    This action cannot be undone. All associated data will be permanently removed.
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={handleCancelDelete}
                    disabled={deleteLoading}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      cursor: deleteLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      opacity: deleteLoading ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!deleteLoading) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deleteLoading) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleteLoading}
                    style={{
                      background: deleteLoading ? 'rgba(239, 68, 68, 0.5)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      cursor: deleteLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {deleteLoading && <RefreshCw size={16} className="animate-spin" />}
                    Yes, Delete It
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player Details Modal */}
        <AnimatePresence>
          {showPlayerDetailsModal && selectedPlayer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={() => setShowPlayerDetailsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '2rem',
                  maxWidth: '600px',
                  width: '100%',
                  maxHeight: '80vh',
                  overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: 0
                  }}>
                    Player Details
                  </h2>
                  <button
                    onClick={() => setShowPlayerDetailsModal(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Player Info */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>Player Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ color: '#888', fontSize: '0.9rem' }}>Username</label>
                        <div style={{ color: '#fff', fontWeight: '500' }}>{selectedPlayer.username}</div>
                      </div>
                      <div>
                        <label style={{ color: '#888', fontSize: '0.9rem' }}>Wallet Address</label>
                        <div style={{ color: '#fff', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                          {selectedPlayer.walletAddress}
                        </div>
                      </div>
                      <div>
                        <label style={{ color: '#888', fontSize: '0.9rem' }}>Login Type</label>
                        <div style={{ color: '#fff', fontWeight: '500' }}>{selectedPlayer.loginType}</div>
                      </div>
                      <div>
                        <label style={{ color: '#888', fontSize: '0.9rem' }}>Referred By</label>
                        <div style={{ color: '#fff', fontWeight: '500' }}>
                          {selectedPlayer.referredBy || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Betting Statistics */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem'
                  }}>
                    <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>Betting Statistics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ color: '#00ff88', fontSize: '1.5rem', fontWeight: 'bold' }}>
                          {formatNumber(selectedPlayer.totalBets)}
                        </div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Total Bets</div>
                      </div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ color: '#00ff88', fontSize: '1.5rem', fontWeight: 'bold' }}>
                          ${formatNumber(selectedPlayer.totalWins)}
                        </div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Total Wins</div>
                      </div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ color: '#ff4444', fontSize: '1.5rem', fontWeight: 'bold' }}>
                          ${formatNumber(selectedPlayer.totalLosses)}
                        </div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Total Losses</div>
                      </div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          color: selectedPlayer.netPL >= 0 ? '#00ff88' : '#ff4444', 
                          fontSize: '1.5rem', 
                          fontWeight: 'bold' 
                        }}>
                          ${formatNumber(selectedPlayer.netPL)}
                        </div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Net P/L</div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                          {selectedPlayer?.winRate?.toFixed(1)}%
                        </div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Win Rate</div>
                      </div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                          ${formatNumber(selectedPlayer.totalVolume)}
                        </div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Total Volume</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
              borderRadius: '16px',
              padding: '2rem',
              width: '100%',
              maxWidth: '500px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Key size={20} color="#3b82f6" />
                </div>
                Change Password
              </h3>
              <button
                onClick={closePasswordModal}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {selectedUser && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                  User Details:
                </div>
                <div style={{ fontSize: '0.875rem', color: 'white', marginBottom: '0.25rem' }}>
                  <strong>Username:</strong> {selectedUser.userName || 'N/A'}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'white', fontFamily: 'monospace' }}>
                  <strong>Wallet:</strong> {selectedUser.walletAddress ? 
                    `${selectedUser.walletAddress.substring(0, 8)}...${selectedUser.walletAddress.substring(selectedUser.walletAddress.length - 8)}` 
                    : 'N/A'
                  }
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '0.5rem'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '0.5rem'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              {passwordMessage.text && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  background: passwordMessage.type === 'success' 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${passwordMessage.type === 'success' 
                    ? 'rgba(16, 185, 129, 0.3)' 
                    : 'rgba(239, 68, 68, 0.3)'}`,
                  color: passwordMessage.type === 'success' ? '#10b981' : '#ef4444',
                  fontSize: '0.875rem'
                }}>
                  {passwordMessage.text}
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={passwordLoading}
                  style={{
                    background: 'rgba(107, 114, 128, 0.1)',
                    border: '1px solid rgba(107, 114, 128, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    cursor: passwordLoading ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    background: passwordLoading 
                      ? 'rgba(59, 130, 246, 0.5)' 
                      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    color: 'white',
                    cursor: passwordLoading ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {passwordLoading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Key size={16} />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        show={showPaymentConfirmation}
        onClose={() => {
          setShowPaymentConfirmation(false);
          setPaymentRequest(null);
        }}
        request={paymentRequest}
        onConfirm={handleProcessPayment}
        loading={paymentLoading}
      />
    </div>
  );
};

// Enhanced Stats Card Component
const StatCard = ({ title, value, icon: Icon, color, trend, pulse, data }) => {
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
      {pulse && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem'
        }}>
          <span style={{
            position: 'relative',
            display: 'flex',
            width: '12px',
            height: '12px'
          }}>
            <span style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: '#22c55e',
              opacity: 0.75,
              animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
            <span style={{
              position: 'relative',
              display: 'inline-flex',
              borderRadius: '50%',
              width: '12px',
              height: '12px',
              background: '#22c55e'
            }} />
          </span>
        </div>
      )}
      
      <div style={{
        ...styles.iconBox,
        background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
        boxShadow: `0 0 30px ${color}40`
      }}>
        <Icon size={28} color="white" />
      </div>
      
      <h3 style={{
        fontSize: '0.875rem',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: '0.5rem'
      }}>
        {title}
      </h3>
      
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <p style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          background: `linear-gradient(135deg, white 0%, ${color} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
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
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {typeof trend === 'number' ? `${Math.abs(trend)}%` : trend}
          </div>
        )}
      </div>
      
      {data && <MiniChart data={data} color={color} />}
    </motion.div>
  );
};

// Payment Confirmation Modal
const PaymentConfirmationModal = ({ 
  show, 
  onClose, 
  request, 
  onConfirm, 
  loading 
}) => {
  if (!show || !request) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(39, 23, 65, 0.95) 0%, rgba(20, 15, 35, 0.95) 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '450px',
            width: '90%',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            ×
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              fontSize: '1.2rem'
            }}>
              💰
            </div>
            <h2 style={{
              color: 'white',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              Confirm Payment
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.85rem',
              margin: '0.25rem 0 0'
            }}>
              Review details before proceeding
            </p>
          </div>

          {/* Payment Details */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginBottom: '0.75rem'
            }}>
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Ambassador
                </label>
                <div style={{
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}>
                  {request.ambassadorUsername}
                </div>
              </div>

              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Amount
                </label>
                <div style={{
                  color: '#10b981',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  {request?.amount?.toFixed(2)} sol
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Payout Wallet
              </label>
              <div style={{
                color: 'white',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '0.4rem',
                borderRadius: '4px',
                wordBreak: 'break-all'
              }}>
                {request.payoutWalletAddress}
              </div>
            </div>

            <div>
              <label style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Commission Rate
              </label>
              <div style={{
                color: 'white',
                fontSize: '0.9rem'
              }}>
                {request.commissionRate}%
              </div>
            </div>
          </div>

          {/* Warning */}
          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              color: '#ffc107',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              ⚠️ This will send real funds and cannot be undone.
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center'
          }}>
            <motion.button
              onClick={onClose}
              disabled={loading}
              style={{
                background: 'rgba(108, 117, 125, 0.2)',
                border: '1px solid rgba(108, 117, 125, 0.3)',
                color: 'rgba(255, 255, 255, 0.8)',
                padding: '0.6rem 1.5rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
              whileHover={!loading ? { scale: 1.05 } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
            >
              Cancel
            </motion.button>

            <motion.button
              onClick={onConfirm}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                padding: '0.6rem 1.5rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              whileHover={!loading ? { 
                scale: 1.05,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.2) 100%)'
              } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(16, 185, 129, 0.3)',
                    borderTop: '2px solid #10b981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Processing...
                </>
              ) : (
                <>
                  💰 Confirm
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminDashboard;