import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Zap, User, UserPlus, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import appKit from './reown';
import { useAppKitAccount } from '@reown/appkit/react';
const API_URL = process.env.REACT_APP_API_URL || "https://api.casino.com";
const PulseAccount = () => {
  const { address, isConnected } = useAppKitAccount()
  const [token, setToken] = useState(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
    const pulseApi = axios.create({
    baseURL: `${API_URL}api/wallet`,
    // headers: {
    //   'Authorization': token ? `Bearer ${token}` : ''
    // }
  });
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
    confirmPassword: ''
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
    }
  };

  const handleLogin = async(e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!loginForm.username || !loginForm.password) {
      setError('Please fill in all fields');
      return;
    }
     try
    {
const login=await pulseApi.post("/pulse/pulse-login",{userName:loginForm?.username,password:loginForm?.password})
console.log(login?.data?.success)   
if(!login?.data?.success)
    {
      setError('Invalid username or password');
      return
    }
    console.log(login?.data)
    localStorage.setItem("pulseToken",login?.data?.data?.token)
    setSuccess('Login successful!');
    setToken(login?.data?.data?.token)
    }
    catch(error)
    {
      setError('Invalid username or password');
      console.log(error)
    }
    // // Simulate login process
    // if (loginForm.username === 'pulse' && loginForm.password === 'demo123') {
    //   setToken('pulse-token-123');
    //   setSuccess('Login successful!');
    // } else {
    //   setError('Invalid username or password');
    // }
  };

  const handleRegister = async(e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!registerForm.username  || !registerForm.password || !registerForm.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if(!address)
    {
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
    
   
    try{
const registerUser=await pulseApi.post("/pulse/create-pulse-account",{userName:registerForm?.username,password:registerForm?.password,walletAddress:address})
 setSuccess('Account created successfully! You can now log in.');
setIsCreatingAccount(false);
      //setSuccess('');
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });    
}
    catch(error)
    {
      alert(error)
    }

      
  };
const handleWalletConnect=async()=>{
await appKit.open()
console.log(address)
}
  // Dashboard view after login
  if (token) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundEffects}>
          <div style={{
            ...styles.glowOrb,
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            top: '10%',
            right: '10%'
          }} />
        </div>
        
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            ...styles.loginCard,
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            <div style={styles.cardGlow} />
            
            <div style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 2rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)'
            }}>
              <Zap size={50} color="white" />
            </div>
            
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Welcome to Pulse
            </h1>
            
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '1.1rem',
              marginBottom: '2rem' 
            }}>
              Your account is now active and ready to use!
            </p>
            
            <button
              style={{
                ...styles.neonButton,
                background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                border: 'none',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                marginRight: '1rem'
              }}
              onClick={() => setToken(null)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 6px 30px rgba(99, 102, 241, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
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
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Choose a username"
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