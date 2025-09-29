import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Lock, Eye, EyeOff, ArrowLeft, Save, AlertCircle, CheckCircle,
  Shield, Mail, Calendar, Key
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const AccountOverview = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [editingPassword, setEditingPassword] = useState(false);

  // Create axios instance with auth
  const adminApi = axios.create({
    baseURL: `${API_URL}api/admin`,
    headers: {
      'Authorization': localStorage.getItem('adminToken') ? `Bearer ${localStorage.getItem('adminToken')}` : ''
    }
  });

  // Function to update API headers with new token
  const updateApiToken = (newToken) => {
    adminApi.defaults.headers['Authorization'] = `Bearer ${newToken}`;
  };

  // Fetch admin data
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/profile');
      if (response.data.success) {
        setAdminData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await adminApi.post('/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.data.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setEditingPassword(false);
        
        // Update token in localStorage and API headers if provided
        if (response.data.data?.token) {
          localStorage.setItem('adminToken', response.data.data.token);
          updateApiToken(response.data.data.token);
          console.log('Token updated successfully');
        }
      } else {
        setPasswordMessage({ type: 'error', text: response.data.message || 'Failed to change password' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setPasswordMessage({ type: 'error', text: errorMessage });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Clear password message after 5 seconds
  useEffect(() => {
    if (passwordMessage.text) {
      const timer = setTimeout(() => {
        setPasswordMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordMessage]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundEffects: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 1
    },
    glowOrb: {
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(100px)',
      opacity: 0.3,
      animation: 'float 6s ease-in-out infinite'
    },
    content: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '800px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem'
    },
    backButton: {
      background: 'rgba(168, 85, 247, 0.1)',
      border: '1px solid rgba(168, 85, 247, 0.3)',
      borderRadius: '12px',
      padding: '0.75rem',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s ease'
    },
    card: {
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(168, 85, 247, 0.2)',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    },
    cardGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: 'linear-gradient(90deg, #a855f7, #ec4899, #a855f7)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 3s linear infinite'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    infoItem: {
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(168, 85, 247, 0.1)'
    },
    infoLabel: {
      fontSize: '0.875rem',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    infoValue: {
      fontSize: '1.125rem',
      color: 'white',
      fontWeight: '500'
    },
    passwordSection: {
      marginTop: '2rem'
    },
    passwordHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    editButton: {
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '8px',
      padding: '0.5rem 1rem',
      color: '#10b981',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.875rem',
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: '500'
    },
    input: {
      background: 'rgba(30, 41, 59, 0.8)',
      border: '1px solid rgba(168, 85, 247, 0.2)',
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    inputWithIcon: {
      position: 'relative'
    },
    passwordToggle: {
      position: 'absolute',
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: 'rgba(255, 255, 255, 0.6)',
      cursor: 'pointer',
      padding: '0.25rem'
    },
    button: {
      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      border: 'none',
      borderRadius: '12px',
      padding: '0.75rem 2rem',
      color: 'white',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s ease',
      marginTop: '1rem'
    },
    message: {
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem'
    },
    messageSuccess: {
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      color: '#10b981'
    },
    messageError: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#ef4444'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      color: 'rgba(255, 255, 255, 0.6)'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(168, 85, 247, 0.3)',
            borderTop: '4px solid #a855f7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ marginLeft: '1rem' }}>Loading account data...</span>
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
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
          top: '-200px',
          left: '-200px'
        }} />
        <div style={{
          ...styles.glowOrb,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
          bottom: '-150px',
          right: '-150px'
        }} />
      </div>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <motion.button
            onClick={() => navigate('/admin')}
            style={styles.backButton}
            whileHover={{ scale: 1.05, background: 'rgba(168, 85, 247, 0.2)' }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </motion.button>
          <h1 style={styles.title}>
            <User size={32} />
            Account Overview
          </h1>
        </div>

        {/* Admin Information */}
        <motion.div
          style={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={styles.cardGlow} />
          
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Shield size={24} />
            Admin Information
          </h2>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>
                <User size={16} />
                Username
              </div>
              <div style={styles.infoValue}>
                {adminData?.username || 'N/A'}
              </div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>
                <Mail size={16} />
                Email
              </div>
              <div style={styles.infoValue}>
                {adminData?.email || 'N/A'}
              </div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>
                <Shield size={16} />
                Role
              </div>
              <div style={styles.infoValue}>
                {adminData?.role || 'Administrator'}
              </div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>
                <Calendar size={16} />
                Last Login
              </div>
              <div style={styles.infoValue}>
                {adminData?.lastLogin ? new Date(adminData.lastLogin).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div style={styles.passwordSection}>
            <div style={styles.passwordHeader}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Lock size={20} />
                Password Management
              </h3>
              
              {!editingPassword && (
                <motion.button
                  onClick={() => setEditingPassword(true)}
                  style={styles.editButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Key size={16} />
                  Change Password
                </motion.button>
              )}
            </div>

            <AnimatePresence>
              {editingPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {passwordMessage.text && (
                    <div style={{
                      ...styles.message,
                      ...(passwordMessage.type === 'success' ? styles.messageSuccess : styles.messageError)
                    }}>
                      {passwordMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      {passwordMessage.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} style={styles.form}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Current Password</label>
                      <div style={styles.inputWithIcon}>
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          style={styles.input}
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          style={styles.passwordToggle}
                        >
                          {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>New Password</label>
                      <div style={styles.inputWithIcon}>
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          style={styles.input}
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          style={styles.passwordToggle}
                        >
                          {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Confirm New Password</label>
                      <div style={styles.inputWithIcon}>
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          style={styles.input}
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          style={styles.passwordToggle}
                        >
                          {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <motion.button
                        type="submit"
                        disabled={passwordLoading}
                        style={{
                          ...styles.button,
                          opacity: passwordLoading ? 0.7 : 1,
                          cursor: passwordLoading ? 'not-allowed' : 'pointer'
                        }}
                        whileHover={passwordLoading ? {} : { scale: 1.05 }}
                        whileTap={passwordLoading ? {} : { scale: 0.95 }}
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
                            <Save size={16} />
                            Save Changes
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={() => {
                          setEditingPassword(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setPasswordMessage({ type: '', text: '' });
                        }}
                        style={{
                          ...styles.button,
                          background: 'rgba(107, 114, 128, 0.1)',
                          border: '1px solid rgba(107, 114, 128, 0.3)',
                          color: 'rgba(255, 255, 255, 0.8)'
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        input:focus {
          outline: none;
          border-color: #a855f7;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AccountOverview;
