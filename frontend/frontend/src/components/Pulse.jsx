import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, Zap, User, UserPlus, ArrowLeft, Mail, Lock, RefreshCw } from 'lucide-react';
import axios from 'axios';
import appKit from './reown';
import { useAppKitAccount } from '@reown/appkit/react';
import { useNavigate } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL || "https://api.casino.com";
const PulseAccount = () => {
  const { address, isConnected } = useAppKitAccount()
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetEmail, setResetEmail] = useState('');
  
  const pulseApi = axios.create({
    baseURL: `${API_URL}api/wallet`,
  });

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    const existingToken = localStorage.getItem('pulseToken');
    if (existingToken) {
      navigate('/pulse-dashboard');
    }
  }, [navigate]);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  
  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralcode:""
  });

  // Reset password form state
  const [resetForm, setResetForm] = useState({
    newPassword: '',
    confirmNewPassword: ''
  });

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    backgroundEffects: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none'
    },
    glowOrb: {
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(40px)',
      animation: 'float 6s ease-in-out infinite'
    },
    loginCard: {
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '24px',
      padding: '3rem',
      width: '100%',
      maxWidth: '450px',
      position: 'relative',
      overflow: 'hidden'
    },
    cardGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
      borderRadius: '24px',
      filter: 'blur(20px)',
      zIndex: -1
    },
    input: {
      width: '100%',
      padding: '1rem 1.25rem',
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: '12px',
      color: 'white',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#6366f1',
      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
      background: 'rgba(30, 41, 59, 0.8)'
    },
    neonButton: {
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      outline: 'none',
      fontFamily: 'inherit'
    },
    secondaryButton: {
      background: 'transparent',
      border: '1px solid rgba(99, 102, 241, 0.5)',
      color: '#6366f1',
      padding: '0.875rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    backButton: {
      position: 'absolute',
      top: '1.5rem',
      left: '1.5rem',
      background: 'rgba(30, 41, 59, 0.8)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      color: '#6366f1',
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    otpContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '0.5rem',
      marginBottom: '1.5rem'
    },
    otpInput: {
      width: '50px',
      height: '60px',
      textAlign: 'center',
      fontSize: '1.5rem',
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: '12px',
      color: 'white',
      outline: 'none',
      transition: 'all 0.3s ease'
    }
  };

  const handleLogin = async(e) => {
    e.preventDefault();
    setError('');
    
    if (!loginForm.username || !loginForm.password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const login = await pulseApi.post("/pulse/pulse-login", {userName: loginForm?.username, password: loginForm?.password})
      
      if(!login?.data?.success) {
        setError('Invalid username or password');
        return
      }
      
      localStorage.setItem("pulseToken", login?.data?.data?.token)
      setSuccess('Login successful! Redirecting...');
      
      // Redirect immediately to dashboard after successful login
      navigate('/pulse-dashboard');
    } catch(error) {
      setError('Invalid username or password');
      console.log(error)
    }
  };

  const handleRegister = async(e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!registerForm.username  || !registerForm.password || !registerForm.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if(!address) {
      setError('Please Connect To A Wallet');
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      const registerUser = await pulseApi.post("/pulse/create-pulse-account", {
        userName: registerForm?.username,
        password: registerForm?.password,
        walletAddress: address,
        referral: registerForm?.referralcode
      })
      
      setSuccess('Account created successfully! You can now log in.');
      setIsCreatingAccount(false);
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '', referralcode: '' });    
    } catch(error) {
      setError(error?.response?.data?.error)
      console.log(error?.response?.data?.error)
    }
  };

  const handleWalletConnect = async() => {
    await appKit.open()
    console.log(address)
  }

  // Forgot password - Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!resetEmail) {
      setError('Please enter your username or email');
      return;
    }
    
    try {
      // Replace with your actual API endpoint
      const response = await pulseApi.post("/reset/send-reset-password-otp", {
        username: resetEmail
      });
      
      if (response?.data?.success) {
        setOtpSent(true);
        setSuccess('OTP sent to your email!');
      } else {
        setError(response?.data?.message);
      }
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to send OTP. Please try again.');
      console.error(error);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    
    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    
    try {
      // Replace with your actual API endpoint
      const response = await pulseApi.post("/reset/verify-reset-password-otp", {
        email: resetEmail,
        otp: enteredOtp
      });
      
      if (response?.data?.success) {
        setOtpVerified(true);
        setSuccess('OTP verified successfully!');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Invalid OTP. Please try again.');
      console.error(error);
    }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!resetForm.newPassword || !resetForm.confirmNewPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (resetForm.newPassword !== resetForm.confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (resetForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      // Replace with your actual API endpoint
      const response = await pulseApi.post("/reset/reset-password", {
        email: resetEmail,
        newPassword: resetForm.newPassword
      });
      
      if (response?.data?.success) {
        setSuccess('Password reset successfully! You can now login with your new password.');
        // Reset all states and go back to login
        setForgotPasswordMode(false);
        setOtpSent(false);
        setOtpVerified(false);
        setResetEmail('');
        setOtp(['', '', '', '', '', '']);
        setResetForm({ newPassword: '', confirmNewPassword: '' });
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (error) {
      setError('Failed to reset password. Please try again.');
      console.error(error);
    }
  };

  // Reset the forgot password flow
  const resetForgotPasswordFlow = () => {
    setForgotPasswordMode(false);
    setOtpSent(false);
    setOtpVerified(false);
    setResetEmail('');
    setOtp(['', '', '', '', '', '']);
    setResetForm({ newPassword: '', confirmNewPassword: '' });
    setError('');
    setSuccess('');
  };

  // If user has token, redirect immediately (no intermediate screen)
  if (token) {
    return null; // This will be handled by useEffect redirect
  }

  // Registration form
  if (isCreatingAccount) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundEffects}>
          <div style={{
            ...styles.glowOrb,
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            top: '-200px',
            left: '-200px'
          }} />
          <div style={{
            ...styles.glowOrb,
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
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
          <div style={styles.loginCard}>
            <div style={styles.cardGlow} />
            
            <button
              style={styles.backButton}
              onClick={() => {
                setIsCreatingAccount(false);
                setError('');
                setSuccess('');
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
              }}
            >
              <ArrowLeft size={20} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)'
              }}>
                <UserPlus size={40} color="white" />
              </div>
              
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                CREATE PULSE ACCOUNT
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Join the Pulse community today
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  Email
                </label>
                <input
                  type="text"
                  placeholder="Enter Your Email"
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'reg-username' ? styles.inputFocus : {})
                  }}
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                  onFocus={() => setFocusedInput('reg-username')}
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
                  Wallet Address
                </label>
                {!address &&
                 <button onClick={handleWalletConnect}>
                  Connect Wallet
                </button>
                }
               
                <input
                  type="text"
                  placeholder="Connect Or Enter Your Wallet Address"
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'walletaddress' ? styles.inputFocus : {})
                  }}
                  value={address}
                  onChange={(e) => setRegisterForm({...registerForm, walletaddress: e.target.value})}
                  onFocus={() => setFocusedInput('walletaddress')}
                  onBlur={() => setFocusedInput('')}
                  required
                  readOnly
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
                    placeholder="Create a password"
                    style={{
                      ...styles.input,
                      paddingRight: '3rem',
                      ...(focusedInput === 'reg-password' ? styles.inputFocus : {})
                    }}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    onFocus={() => setFocusedInput('reg-password')}
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
                    onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    style={{
                      ...styles.input,
                      paddingRight: '3rem',
                      ...(focusedInput === 'confirm-password' ? styles.inputFocus : {})
                    }}
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                    onFocus={() => setFocusedInput('confirm-password')}
                    onBlur={() => setFocusedInput('')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  Referred By (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter a referral Code"
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'reg-referralcode' ? styles.inputFocus : {})
                  }}
                  value={registerForm.referralcode}
                  onChange={(e) => setRegisterForm({...registerForm, referralcode: e.target.value})}
                  onFocus={() => setFocusedInput('reg-referralcode')}
                  onBlur={() => setFocusedInput('')}
                  required
                />
              </div>
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ef4444'
                }}>
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#22c55e'
                }}>
                  <Zap size={20} />
                  <span>{success}</span>
                </div>
              )}
              
              <button 
                onClick={handleRegister}
                style={{
                  ...styles.neonButton,
                  background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 6px 30px rgba(99, 102, 241, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)';
                }}
              >
                CREATE PULSE ACCOUNT
              </button>
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    );
  }

  // Forgot Password - Reset Password Screen
  if (forgotPasswordMode && otpVerified) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundEffects}>
          <div style={{
            ...styles.glowOrb,
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            top: '-200px',
            left: '-200px'
          }} />
          <div style={{
            ...styles.glowOrb,
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
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
          <div style={styles.loginCard}>
            <div style={styles.cardGlow} />
            
            <button
              style={styles.backButton}
              onClick={resetForgotPasswordFlow}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
              }}
            >
              <ArrowLeft size={20} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)'
              }}>
                <Lock size={40} color="white" />
              </div>
              
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                RESET PASSWORD
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Enter your new password
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    style={{
                      ...styles.input,
                      paddingRight: '3rem',
                      ...(focusedInput === 'new-password' ? styles.inputFocus : {})
                    }}
                    value={resetForm.newPassword}
                    onChange={(e) => setResetForm({...resetForm, newPassword: e.target.value})}
                    onFocus={() => setFocusedInput('new-password')}
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
                    onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    style={{
                      ...styles.input,
                      paddingRight: '3rem',
                      ...(focusedInput === 'confirm-new-password' ? styles.inputFocus : {})
                    }}
                    value={resetForm.confirmNewPassword}
                    onChange={(e) => setResetForm({...resetForm, confirmNewPassword: e.target.value})}
                    onFocus={() => setFocusedInput('confirm-new-password')}
                    onBlur={() => setFocusedInput('')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ef4444'
                }}>
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#22c55e'
                }}>
                  <Zap size={20} />
                  <span>{success}</span>
                </div>
              )}
              
              <button 
                onClick={handleResetPassword}
                style={{
                  ...styles.neonButton,
                  background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 6px 30px rgba(99, 102, 241, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)';
                }}
              >
                RESET PASSWORD
              </button>
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    );
  }

  // Forgot Password - OTP Verification Screen
  if (forgotPasswordMode && otpSent) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundEffects}>
          <div style={{
            ...styles.glowOrb,
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            top: '-200px',
            left: '-200px'
          }} />
          <div style={{
            ...styles.glowOrb,
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
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
          <div style={styles.loginCard}>
            <div style={styles.cardGlow} />
            
            <button
              style={styles.backButton}
              onClick={() => {
                setOtpSent(false);
                setOtp(['', '', '', '', '', '']);
                setError('');
                setSuccess('');
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
              }}
            >
              <ArrowLeft size={20} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)'
              }}>
                <Mail size={40} color="white" />
              </div>
              
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                VERIFY OTP
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Enter the 6-digit code sent to your email
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={styles.otpContainer}>
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    style={{
                      ...styles.otpInput,
                      ...(focusedInput === `otp-${index}` ? styles.inputFocus : {})
                    }}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onFocus={() => setFocusedInput(`otp-${index}`)}
                    onBlur={() => setFocusedInput('')}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !e.target.value && index > 0) {
                        // Focus previous input on backspace
                        e.target.previousSibling.focus();
                      }
                    }}
                  />
                ))}
              </div>
              
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ef4444'
                }}>
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#22c55e'
                }}>
                  <Zap size={20} />
                  <span>{success}</span>
                </div>
              )}
              
              <button 
                onClick={handleVerifyOtp}
                style={{
                  ...styles.neonButton,
                  background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 6px 30px rgba(99, 102, 241, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)';
                }}
              >
                VERIFY OTP
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button 
                  onClick={handleSendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6366f1',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    margin: '0 auto'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  <RefreshCw size={16} />
                  Resend OTP
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    );
  }

  // Forgot Password - Initial Screen
  if (forgotPasswordMode) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundEffects}>
          <div style={{
            ...styles.glowOrb,
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            top: '-200px',
            left: '-200px'
          }} />
          <div style={{
            ...styles.glowOrb,
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
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
          <div style={styles.loginCard}>
            <div style={styles.cardGlow} />
            
            <button
              style={styles.backButton}
              onClick={() => {
                setForgotPasswordMode(false);
                setError('');
                setSuccess('');
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
              }}
            >
              <ArrowLeft size={20} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)'
              }}>
                <Lock size={40} color="white" />
              </div>
              
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                FORGOT PASSWORD
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Enter your username or email to reset your password
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  Username or Email
                </label>
                <input
                  type="text"
                  placeholder="Enter your username or email"
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'reset-email' ? styles.inputFocus : {})
                  }}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onFocus={() => setFocusedInput('reset-email')}
                  onBlur={() => setFocusedInput('')}
                  required
                  autoFocus
                />
              </div>
              
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ef4444'
                }}>
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#22c55e'
                }}>
                  <Zap size={20} />
                  <span>{success}</span>
                </div>
              )}
              
              <button 
                onClick={handleSendOtp}
                style={{
                  ...styles.neonButton,
                  background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 6px 30px rgba(99, 102, 241, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)';
                }}
              >
                SEND OTP
              </button>
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    );
  }

  // Login screen
  return (
    <div style={styles.container}>
      <div style={styles.backgroundEffects}>
        <div style={{
          ...styles.glowOrb,
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          top: '-200px',
          left: '-200px'
        }} />
        <div style={{
          ...styles.glowOrb,
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
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
        <div style={styles.loginCard}>
          <div style={styles.cardGlow} />
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)'
            }}>
              <Zap size={40} color="white" />
            </div>
            
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              PULSE ACCESS
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Sign in to your Pulse account
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Email
              </label>
              <input
                type="text"
                placeholder="Enter your email"
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
                  onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#ef4444'
              }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
            
            <button 
              onClick={handleLogin}
              style={{
                ...styles.neonButton,
                background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                border: 'none',
                color: 'white',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: '600',
                marginTop: '0.5rem',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 6px 30px rgba(99, 102, 241, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)';
              }}
            >
              SIGN IN TO PULSE
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                Don't have an account?
              </span>
            </div>
            
            <button 
              onClick={() => setIsCreatingAccount(true)}
              style={{
                ...styles.neonButton,
                ...styles.secondaryButton
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = 'transparent';
                e.target.style.boxShadow = 'none';
              }}
            >
              CREATE NEW PULSE ACCOUNT
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button 
                onClick={() => setForgotPasswordMode(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Forgot your password?
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default PulseAccount;