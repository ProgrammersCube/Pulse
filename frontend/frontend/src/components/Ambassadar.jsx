import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import CommissionCalculator from "./CommisionCalculator";
import axios from "axios";
import { 
  Home, Users, PieChart, BarChart2, Share2, Calculator, LogOut, 
  Copy, Check, Eye, EyeOff, ArrowUp, ArrowDown, ChevronDown, ChevronUp,
  Zap, Shield, Database, Globe, Wallet, Clock, Award, RefreshCw,AlertCircle,
  Twitter, Facebook, Instagram, MessageCircle, MessageSquareText, Mail, Smartphone,TrendingDown,TrendingUp,BarChart3,Settings,Headset,MessageSquare,Phone,Edit3,X
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
    width: '100%',
  },
  
  dashboardLayoutMobile: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    padding: '1rem',
    position: 'relative',
    zIndex: 2,
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  
  dashboardLayoutSmallMobile: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    padding: '0.5rem',
    position: 'relative',
    zIndex: 2,
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
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
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    // Mobile responsive
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
      padding: '1rem',
      marginBottom: '1.5rem',
    },
    '@media (max-width: 480px)': {
      padding: '0.75rem',
      borderRadius: '16px',
    }
  },
  
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    // Mobile responsive
    '@media (max-width: 768px)': {
      alignItems: 'center',
      textAlign: 'center',
    }
  },
  
  dashboardTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    // Mobile responsive
    '@media (max-width: 768px)': {
      fontSize: '1.5rem',
    },
    '@media (max-width: 480px)': {
      fontSize: '1.3rem',
    }
  },
  
  referralCodeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    // Mobile responsive
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
    }
  },
  
  referralCodeLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    // Mobile responsive
    '@media (max-width: 480px)': {
      fontSize: '0.85rem',
    }
  },
  
  referralCodeBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(39, 23, 65, 0.6)',
    borderRadius: '12px',
    padding: '0.5rem 1rem',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    // Mobile responsive
    '@media (max-width: 768px)': {
      width: '100%',
      justifyContent: 'center',
    },
    '@media (max-width: 480px)': {
      padding: '0.4rem 0.8rem',
    }
  },
  
  referralCodeText: {
    fontWeight: '600',
    letterSpacing: '1px',
    color: '#d8b4fe',
    marginRight: '0.75rem',
    // Mobile responsive
    '@media (max-width: 480px)': {
      fontSize: '0.9rem',
      marginRight: '0.5rem',
    }
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
    transition: 'all 0.3s ease',
    // Mobile responsive
    '@media (max-width: 480px)': {
      padding: '0.3rem 0.6rem',
      fontSize: '0.8rem',
    }
  },
  
  headerActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    // Mobile responsive
    '@media (max-width: 768px)': {
      justifyContent: 'center',
      width: '100%',
    }
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
    color: '#e9d5ff',
    // Mobile responsive
    '@media (max-width: 480px)': {
      width: '38px',
      height: '38px',
    }
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
    transition: 'all 0.3s ease',
    // Mobile responsive
    '@media (max-width: 480px)': {
      padding: '0.5rem 1rem',
      fontSize: '0.9rem',
    }
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
    backdropFilter: 'blur(10px)',
  },
  
  tabContainerMobile: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.25rem',
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '16px',
    padding: '0.4rem',
    marginBottom: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  
  tabContainerSmallMobile: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.25rem',
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '16px',
    padding: '0.4rem',
    marginBottom: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
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
    fontSize: '0.95rem',
  },
  
  tabButtonMobile: {
    padding: '0.6rem 1rem',
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
    fontSize: '0.85rem',
    minWidth: 'auto',
    flex: '1 1 auto',
    justifyContent: 'center',
  },
  
  tabButtonSmallMobile: {
    padding: '0.5rem 0.8rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    transition: 'all 0.3s ease',
    fontSize: '0.8rem',
    minWidth: 'auto',
    flex: '1 1 auto',
    justifyContent: 'center',
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
    minHeight: '500px',
    // Mobile responsive
    '@media (max-width: 768px)': {
      padding: '1.5rem',
      borderRadius: '16px',
    },
    '@media (max-width: 480px)': {
      padding: '1rem',
      borderRadius: '12px',
      minHeight: '400px',
    }
  },
  
  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    marginBottom: '2rem',
  },
  
  statsGridMobile: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
    width: '100%',
    marginBottom: '1.5rem',
  },
  
  statsGridSmallMobile: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.75rem',
    width: '100%',
    marginBottom: '1rem',
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
    overflow: 'hidden',
  },
  
  statCardMobile: {
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '16px',
    padding: '1.25rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  
  statCardSmallMobile: {
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '12px',
    padding: '1rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  
  statCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem',
    // Mobile responsive
    '@media (max-width: 480px)': {
      gap: '0.5rem',
      marginBottom: '1rem',
    }
  },
  
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d8b4fe',
    // Mobile responsive
    '@media (max-width: 480px)': {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
    }
  },
  
  statTitle: {
    fontSize: '1rem',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
    // Mobile responsive
    '@media (max-width: 480px)': {
      fontSize: '0.9rem',
    }
  },
  
  statValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    margin: '0.5rem 0',
    color: 'white',
    // Mobile responsive
    '@media (max-width: 768px)': {
      fontSize: '1.6rem',
    },
    '@media (max-width: 480px)': {
      fontSize: '1.4rem',
    }
  },
  
  statSubtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '0.25rem',
    // Mobile responsive
    '@media (max-width: 480px)': {
      fontSize: '0.8rem',
    }
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
    zIndex: 10,
    // Mobile responsive
    '@media (max-width: 768px)': {
      padding: '2rem',
      borderRadius: '20px',
      maxWidth: '90%',
    },
    '@media (max-width: 480px)': {
      padding: '1.5rem',
      borderRadius: '16px',
      maxWidth: '95%',
    }
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
    transition: 'all 0.3s ease',
    // Mobile responsive
    '@media (max-width: 480px)': {
      padding: '0.875rem',
      fontSize: '0.9rem',
    }
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
    transition: 'all 0.3s ease',
    // Mobile responsive
    '@media (max-width: 480px)': {
      padding: '0.75rem 1rem',
      fontSize: '0.9rem',
    }
  },
  
  inputFocus: {
    borderColor: '#a855f7',
    boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.3)'
  },
  
  // Modal Styles
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
    zIndex: 1000,
    padding: '1rem'
  },

  contactModal: {
    background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '600px',
    padding: '2rem',
    boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    position: 'relative',
    // Mobile responsive
    '@media (max-width: 768px)': {
      padding: '1.5rem',
      borderRadius: '20px',
      maxWidth: '95%',
    },
    '@media (max-width: 480px)': {
      padding: '1rem',
      borderRadius: '16px',
      maxWidth: '100%',
    }
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
    alignItems: 'center',
    // Mobile responsive
    '@media (max-width: 480px)': {
      fontSize: '1.25rem',
    }
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
    gap: '2rem',
    // Mobile responsive
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
    }
  },

  contactInfo: {
    background: 'rgba(39, 23, 65, 0.5)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    // Mobile responsive
    '@media (max-width: 480px)': {
      padding: '1rem',
      borderRadius: '12px',
    }
  },

  contactMethod: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    // Mobile responsive
    '@media (max-width: 480px)': {
      fontSize: '1rem',
      gap: '0.75rem',
      marginBottom: '1rem',
    }
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
    minHeight: '150px',
    // Mobile responsive
    '@media (max-width: 480px)': {
      padding: '0.75rem',
      fontSize: '0.9rem',
      minHeight: '120px',
    }
  },

  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    // Mobile responsive
    '@media (max-width: 480px)': {
      flexDirection: 'column',
      gap: '0.75rem',
    }
  },

  cancelButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '0.8rem 1.5rem',
    color: '#fecaca',
    fontWeight: '500',
    cursor: 'pointer',
    // Mobile responsive
    '@media (max-width: 480px)': {
      padding: '0.75rem 1rem',
      fontSize: '0.9rem',
    }
  },

  submitButton: {
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '0.8rem 1.5rem',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    // Mobile responsive
    '@media (max-width: 480px)': {
      padding: '0.75rem 1rem',
      fontSize: '0.9rem',
    }
  },

  // Flagged Banner
  flaggedBanner: {
    background: 'linear-gradient(135deg, #7e22ce, #dc2626)',
    borderRadius: '16px',
    padding: '1rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    // Mobile responsive
    '@media (max-width: 768px)': {
      padding: '0.75rem',
      marginBottom: '1rem',
    }
  },

  flaggedContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1.5rem',
    position: 'relative',
    zIndex: 2,
    // Mobile responsive
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '1rem',
    }
  },

  flaggedHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    minWidth: '200px',
    // Mobile responsive
    '@media (max-width: 768px)': {
      justifyContent: 'center',
      minWidth: 'auto',
    }
  },

  flaggedTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: 0,
    color: 'white',
    // Mobile responsive
    '@media (max-width: 480px)': {
      fontSize: '1.1rem',
    }
  },

  flaggedDetails: {
    flex: 1,
    minWidth: '300px',
    color: 'rgba(255, 255, 255, 0.9)',
    // Mobile responsive
    '@media (max-width: 768px)': {
      minWidth: 'auto',
      textAlign: 'center',
    }
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
    minWidth: '180px',
    // Mobile responsive
    '@media (max-width: 768px)': {
      minWidth: 'auto',
      display: 'flex',
      justifyContent: 'center',
    }
  },

  contactButton: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '0.8rem 1.5rem',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    // Mobile responsive
    '@media (max-width: 480px)': {
      padding: '0.75rem 1rem',
      fontSize: '0.9rem',
    }
  },

  // Mobile-specific responsive styles
  mobileTableContainer: {
    overflowX: 'auto',
    // Mobile responsive
    '@media (max-width: 768px)': {
      borderRadius: '12px',
      border: '1px solid rgba(168, 85, 247, 0.3)',
    }
  },

  mobileTable: {
    width: '100%',
    borderCollapse: 'collapse',
    // Mobile responsive
    '@media (max-width: 768px)': {
      minWidth: '600px', // Ensure table doesn't get too cramped
    }
  },

  mobileTableHeader: {
    background: 'rgba(168, 85, 247, 0.1)',
    // Mobile responsive
    '@media (max-width: 768px)': {
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }
  },

  mobileTableCell: {
    padding: '1rem',
    // Mobile responsive
    '@media (max-width: 768px)': {
      padding: '0.75rem 0.5rem',
      fontSize: '0.85rem',
    },
    '@media (max-width: 480px)': {
      padding: '0.5rem 0.25rem',
      fontSize: '0.8rem',
    }
  },

  // Mobile-friendly form layouts
  mobileFormGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '2rem',
    // Mobile responsive
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '1rem',
      marginBottom: '1.5rem',
    }
  },

  mobileShareGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '1rem',
    // Mobile responsive
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '0.75rem',
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
      gap: '0.5rem',
    }
  },

  // Mobile-friendly chart container
  mobileChartContainer: {
    height: '300px',
    background: 'rgba(39, 23, 65, 0.4)',
    borderRadius: '16px',
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    padding: '1rem',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    // Mobile responsive
    '@media (max-width: 768px)': {
      height: '250px',
      padding: '0.75rem',
    },
    '@media (max-width: 480px)': {
      height: '200px',
      padding: '0.5rem',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-around',
    }
  },

  mobileChartBar: {
    width: '40px',
    background: 'linear-gradient(to top, #a855f7, #ec4899)',
    borderRadius: '8px 8px 0 0',
    // Mobile responsive
    '@media (max-width: 480px)': {
      width: '30px',
    }
  },

  // Mobile-friendly funnel layout
  mobileFunnelContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '300px',
    padding: '2rem',
    background: 'rgba(39, 23, 65, 0.4)',
    borderRadius: '16px',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    // Mobile responsive
    '@media (max-width: 768px)': {
      height: '250px',
      padding: '1.5rem',
    },
    '@media (max-width: 480px)': {
      height: '200px',
      padding: '1rem',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-around',
    }
  },

  mobileFunnelBar: {
    width: '80px',
    // Mobile responsive
    '@media (max-width: 768px)': {
      width: '60px',
    },
    '@media (max-width: 480px)': {
      width: '50px',
    }
  },

  // Mobile-friendly filter controls
  mobileFilterContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    // Mobile responsive
    '@media (max-width: 768px)': {
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    '@media (max-width: 480px)': {
      gap: '0.5rem',
      flexDirection: 'column',
    }
  },

  mobileFilterSelect: {
    minWidth: '180px',
    // Mobile responsive
    '@media (max-width: 768px)': {
      minWidth: '150px',
    },
    '@media (max-width: 480px)': {
      minWidth: '100%',
    }
  },

  // Mobile-friendly commission layout
  mobileCommissionGrid: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    // Mobile responsive
    '@media (max-width: 768px)': {
      gap: '0.75rem',
      marginBottom: '1.5rem',
    },
    '@media (max-width: 480px)': {
      gap: '0.5rem',
      flexDirection: 'column',
    }
  },

  mobileCommissionCard: {
    flex: 1,
    minWidth: '300px',
    // Mobile responsive
    '@media (max-width: 768px)': {
      minWidth: '250px',
    },
    '@media (max-width: 480px)': {
      minWidth: 'auto',
    }
  },

  // Mobile-friendly referral link layout
  mobileReferralGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '2rem',
    // Mobile responsive
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '1rem',
      marginBottom: '1.5rem',
    }
  },

  // Mobile-friendly settings layout
  mobileSettingsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '2rem',
    // Mobile responsive
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '1rem',
      marginBottom: '1.5rem',
    }
  },

  // Mobile-friendly performance overview
  mobilePerformanceContainer: {
    textAlign: 'center',
    marginTop: '2rem',
    // Mobile responsive
    '@media (max-width: 768px)': {
      marginTop: '1.5rem',
    },
    '@media (max-width: 480px)': {
      marginTop: '1rem',
    }
  },

  mobilePerformanceTitle: {
    fontSize: '1.25rem',
    color: '#d8b4fe',
    // Mobile responsive
    '@media (max-width: 480px)': {
      fontSize: '1.1rem',
    }
  },

  // Mobile-friendly tab content spacing
  mobileTabContent: {
    // Mobile responsive
    '@media (max-width: 768px)': {
      padding: '1.5rem',
    },
    '@media (max-width: 480px)': {
      padding: '1rem',
    }
  },

  // Mobile-friendly heading sizes
  mobileHeading: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: '#e9d5ff',
    // Mobile responsive
    '@media (max-width: 768px)': {
      fontSize: '1.3rem',
      marginBottom: '1.25rem',
    },
    '@media (max-width: 480px)': {
      fontSize: '1.2rem',
      marginBottom: '1rem',
    }
  },

  mobileSubheading: {
    color: '#d8b4fe',
    marginBottom: '1rem',
    // Mobile responsive
    '@media (max-width: 480px)': {
      fontSize: '0.95rem',
      marginBottom: '0.75rem',
    }
  },

  // Mobile-friendly commission history
  mobileCommissionHistory: {
    maxHeight: '300px',
    overflowY: 'auto',
    // Mobile responsive
    '@media (max-width: 768px)': {
      maxHeight: '250px',
    },
    '@media (max-width: 480px)': {
      maxHeight: '200px',
    }
  },

  mobileCommissionItem: {
    background: 'rgba(39, 23, 65, 0.4)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    // Mobile responsive
    '@media (max-width: 768px)': {
      padding: '0.75rem',
      marginBottom: '0.5rem',
    },
    '@media (max-width: 480px)': {
      padding: '0.5rem',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '0.5rem',
      textAlign: 'center',
    }
  },

  // Mobile-friendly status badges
  mobileStatusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    // Mobile responsive
    '@media (max-width: 480px)': {
      fontSize: '0.8rem',
      padding: '0.2rem 0.6rem',
    }
  },

  // Mobile-friendly input groups
  mobileInputGroup: {
    display: 'flex',
    gap: '0.5rem',
    // Mobile responsive
    '@media (max-width: 480px)': {
      flexDirection: 'column',
      gap: '0.25rem',
    }
  },

  // Mobile-friendly button groups
  mobileButtonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    // Mobile responsive
    '@media (max-width: 480px)': {
      flexDirection: 'column',
      gap: '0.75rem',
      justifyContent: 'stretch',
    }
  },

  // Mobile-friendly save button
  mobileSaveButton: {
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '0.8rem 2rem',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    // Mobile responsive
    '@media (max-width: 480px)': {
      padding: '0.75rem 1.5rem',
      fontSize: '0.9rem',
      width: '100%',
    }
  }
};

const API_URL = process.env.REACT_APP_API_URL;

const Ambassador = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('ambassadorToken') || null);
  const [ambassadorData, setAmbassadorData] = useState(null);
  const [ambassadarId, setAmbassadarId] = useState(null);
  const [referralPlayers, setReferralPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copiedCode, setCopiedCode] = useState(false);
  const [payoutWallet, setPayoutWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [tempWalletAddress, setTempWalletAddress] = useState("");
  const [walletMessage, setWalletMessage] = useState({ type: '', text: '' });
  const [payoutRequestLoading, setPayoutRequestLoading] = useState(false);
  const [payoutRequestMessage, setPayoutRequestMessage] = useState({ type: '', text: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [commissionHistory, setCommissionHistory] = useState([]);
  const [commissionHistoryLoading, setCommissionHistoryLoading] = useState(false);

  // Toast notification function
  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'error' });
    }, 5000);
  };

  // Add to the Ambassador component
  const [accountStatus, setAccountStatus] = useState('active'); // 'active', 'flagged'
  const [showContactModal, setShowContactModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Funnel analytics state
  const [funnelData, setFunnelData] = useState(null);
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [selectedFunnelPeriod, setSelectedFunnelPeriod] = useState('1W');
  
  // Change password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  
  // Password visibility states for change password modal
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Handle mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const adminApi = axios.create({
    baseURL: `${API_URL}api/admin`,
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  // Function to get ambassador ID from stored token
  const getAmbassadorIdFromToken = async () => {
    if (token && !ambassadarId) {
      try {
        setLoading(true);
        // Try to get ambassador info from the token
        const response = await adminApi.post('/get-ambassadar-from-token',
          {
            headers: {  
              'Authorization': token ? `Bearer ${token}` : ''
            }
          }
        );
        console.log(response?.data?.user)
          setAmbassadarId(response?.data?.user?._id);
      } catch (e) {
        setLoading(false);
        console.log('Error getting ambassador ID:', e);
      } finally {
      }
    }
  };

  // Fetch ambassador data when ambassadorId changes
  useEffect(() => {
    const fetchData = async () => {
      if (!ambassadarId) return; // Only proceed if we have a valid ambassadorId
      
      try {
        // setLoading(true);
        const ambassadors = await adminApi.post("ambassadors/dashboard-stats", {ambassadorId: ambassadarId })
        console.log(ambassadors?.data?.userName)
        setAmbassadorData({
          walletAddress: ambassadors?.data?.walletAddress,
          id: ambassadors?.data?.id,
          totalLoss: ambassadors?.data?.totalLoss,
          totalWins: ambassadors?.data?.totalWins,
          netLoss: ambassadors?.data?.netLoss,
          name: ambassadors?.data?.userName,
          referralCode: ambassadors?.data?.referralCode,
          totalReferrals: ambassadors?.data?.totalReferrals,
          wagerVolume: ambassadors?.data?.wagerVolume,
          commissionRate: ambassadors?.data?.commissionRate,
          netLosses: ambassadors?.data?.netLoss,
          totalCommissions: ambassadors?.data?.totalCommissions,
          totalEarnings: ambassadors?.data?.totalEarnings,
          hasPendingRequest: ambassadors?.data?.hasPendingRequest,
          status: 'active' // Default to active status
        });
        
        // Fetch commission history
        await fetchCommissionHistory();
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false);
      }
    }
    
    fetchData()
  }, [ambassadarId]);

  // Try to get ambassador ID when component mounts with token
  useEffect(() => {
    if (token && !ambassadarId) {
      console.log("token",token)
      getAmbassadorIdFromToken();
    }
  }, [token]);
  useEffect(()=>{
referredPlayersStats()
  },[ambassadorData])

  // Fetch funnel data when funnel tab is active
  useEffect(() => {
    if (activeTab === 'funnel' && ambassadarId && !funnelData) {
      fetchFunnelData(selectedFunnelPeriod);
    }
  }, [activeTab, ambassadarId]);

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
      const login = await adminApi.post("/ambassadar-login", {username: loginForm?.username,password:loginForm?.password})
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
    setAmbassadarId(null);
  };

  const handleSaveWalletAddress = async () => {
    if (!tempWalletAddress.trim()) {
      setWalletMessage({ type: 'error', text: 'Please enter a valid wallet address' });
      return;
    }

    try {
      setLoading(true);
      setWalletMessage({ type: '', text: '' }); // Clear previous messages
      const response = await adminApi.post('/change-ambassadar-payout-wallet', {
        payoutWalletAddress: tempWalletAddress.trim()
      });

      if (response.data.success) {
        // Update the ambassador data with the new wallet address
        setAmbassadorData(prev => ({
          ...prev,
          walletAddress: tempWalletAddress.trim()
        }));
        setIsEditingWallet(false);
        setTempWalletAddress('');
        setWalletMessage({ type: 'success', text: 'Wallet address updated successfully!' });
      } else {
        setWalletMessage({ type: 'error', text: 'Failed to update wallet address. Please try again.' });
      }
    } catch (error) {
      console.error('Error updating wallet address:', error);
      setWalletMessage({ type: 'error', text: 'Error updating wallet address. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle payout request
  const handlePayoutRequest = async () => {
    if (!ambassadorData?.totalCommissions || ambassadorData?.totalCommissions <= 0) {
      showToast('No commissions available for payout', 'error');
      return;
    }

    try {
      setPayoutRequestLoading(true);
      setPayoutRequestMessage({ type: '', text: '' });

      const response = await adminApi.post('/request-commission-payout', {
        ambassadorId: ambassadorData?.id,
        amount: ambassadorData?.totalCommissions,
        walletAddress: ambassadorData?.walletAddress
      });

      if (response.data.success) {
        setPayoutRequestMessage({ 
          type: 'success', 
          text: 'Payout request sent successfully! Admin will process your request.' 
        });
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setPayoutRequestMessage({ type: '', text: '' });
        }, 5000);
      } else {
        showToast(response.data.message || 'Failed to send payout request. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Payout request error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send payout request. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setPayoutRequestLoading(false);
    }
  };

  // Fetch commission history
  const fetchCommissionHistory = async () => {
    if (!ambassadarId) return;

    try {
      setCommissionHistoryLoading(true);
      const response = await adminApi.post('/commission-history', {
        ambassadorId: ambassadarId
      });

      if (response.data.success) {
        setCommissionHistory(response.data.data);
      } else {
        showToast('Failed to load commission history', 'error');
      }
    } catch (error) {
      console.error('Commission history error:', error);
      showToast('Failed to load commission history', 'error');
    } finally {
      setCommissionHistoryLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ambassadorData?.referralCode || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Handle change password modal close
  const handleChangePasswordModalClose = () => {
    setShowChangePasswordModal(false);
    setChangePasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setChangePasswordError('');
    setChangePasswordSuccess('');
    // Reset password visibility states
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // Fetch funnel analytics data
  const fetchFunnelData = async (timePeriod = '1W') => {
    if (!ambassadarId) return;
    
    setFunnelLoading(true);
    try {
      const response = await adminApi.post('/ambassadors/funnel-analytics', {
        ambassadorId: ambassadarId,
        timePeriod: timePeriod
      });
      setFunnelData(response.data.data);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
      setError('Failed to fetch funnel analytics');
    } finally {
      setFunnelLoading(false);
    }
  };

  // Handle funnel time period change
  const handleFunnelPeriodChange = (period) => {
    setSelectedFunnelPeriod(period);
    fetchFunnelData(period);
  };

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');
    
    if (!changePasswordForm.currentPassword || !changePasswordForm.newPassword || !changePasswordForm.confirmPassword) {
      setChangePasswordError('All fields are required');
      return;
    }
    
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setChangePasswordError('New password and confirm password do not match');
      return;
    }
    if (changePasswordForm.newPassword === changePasswordForm.currentPassword) {
      setChangePasswordError('New password cannot be the same as the current password');
      return;
    }
    
    if (changePasswordForm.newPassword.length < 6) {
      setChangePasswordError('New password must be at least 6 characters long');
      return;
    }
    
    try {
      setChangePasswordLoading(true);
      const response = await adminApi.post('/ambassadar-change-password', {
        currentPassword: changePasswordForm.currentPassword,
        newPassword: changePasswordForm.newPassword,
        confirmPassword: changePasswordForm.confirmPassword
      });
      
      if (response.data.success) {
        setChangePasswordSuccess('Password changed successfully!');
        localStorage.setItem('ambassadorToken', response?.data?.updatedToken);
        setToken(response?.data?.updatedToken);
        setChangePasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Reset password visibility states
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setTimeout(() => {
          setShowChangePasswordModal(false);
          setChangePasswordSuccess('');
        }, 2000);
      }
    } catch (error) {
      setChangePasswordError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Login screen
  if (!token && !ambassadarId) {
    return (
      <div style={{...styles.container, position: 'relative', zIndex: 10}}>
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
                  <div style={{ fontSize: '20px' }}>!</div>
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

  // Show loading state if data is being fetched
  if (loading) {
    return (
      <div style={{...styles.container, position: 'relative', zIndex: 10}}>
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
          <div style={{
            textAlign: 'center',
            color: 'white'
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
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
            <p>Loading ambassador data...</p>
          </div>
        </div>
      </div>
    );
  }
function truncateMiddle(str, startChars, endChars) {
  if (str.length <= startChars + endChars + 3) {
    // If the string is short enough, just return it as is
    return str;
  }
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}
  // Format currency
  const formatCurrency = (amount) => {
    // Handle very small amounts with more precision
    if (amount && Math.abs(amount) < 0.01) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 6,
        maximumFractionDigits: 6
      }).format(amount);
    }
    
    // Regular formatting for larger amounts
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
    console.log(value)
    
    // Choose responsive style based on screen size
    const getCardStyle = () => {
      if (isMobile && window.innerWidth <= 480) {
        return styles.statCardSmallMobile;
      } else if (isMobile) {
        return styles.statCardMobile;
      }
      return styles.statCard;
    };
    
    return (
      <motion.div
        style={{...getCardStyle(), position: 'relative', zIndex: 16}}
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
              {title === "Total Commissions" && subtitle === "pending" && " pending"}
            </div>
            
            {subtitle && title !== "Total Commissions" && (
              <div style={styles.statSubtitle}>
                {isCurrency ? formatCurrency(subtitle) : subtitle}
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
            <div style={
              isMobile && window.innerWidth <= 480 ? styles.statsGridSmallMobile :
              isMobile ? styles.statsGridMobile : 
              styles.statsGrid
            }>
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
                title="Total Loss Amount"
                value={ambassadorData?.totalLoss || 0}
                change={-8}
                isCurrency={true}
                isNegativeGood={true}
              />
              
              <StatCard 
                icon={<TrendingUp size={24} />}
                title="Total Wins Amount"
                value={ambassadorData?.totalWins || 0}
                change={12}
                isCurrency={true}
                isNegativeGood={false}
              />
              
              <StatCard 
                icon={<BarChart3 size={24} />}
                title="Net Loss Generated"
                value={ambassadorData?.netLoss || 0}
                change={-8}
                isCurrency={true}
                isNegativeGood={true}
              />
              
              <StatCard 
                icon={<Wallet size={24} />}
                title="Total Earnings"
                value={ambassadorData?.netLoss >=0  ? 
                  (ambassadorData.netLoss * (ambassadorData.commissionRate / 100)) : 0}
                isCurrency={true}
              />
               <StatCard 
                icon={<Wallet size={24} />}
                title="Pending Commissions"
                value={ambassadorData?.netLoss >=0  ? 
                  (ambassadorData.netLoss * (ambassadorData.commissionRate / 100)) : 0}
                isCurrency={true}
              />
              <StatCard 
                icon={<Clock size={24} />}
                title="Last Payout Date"
                value={ambassadorData?.lastPayoutDate ? new Date(ambassadorData.lastPayoutDate).toLocaleDateString() : "No Payout Yet"}
                isCurrency={false}
              />
            </div>
            
            {/* <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                color: '#d8b4fe',
                // Mobile responsive
                ...(isMobile && { fontSize: '1.1rem' })
              }}>Performance Overview</h3>
              <div style={{
                ...styles.mobileChartContainer,
                // Override with inline styles for dynamic responsiveness
                height: isMobile ? '250px' : '300px',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'center' : 'flex-end',
                justifyContent: isMobile ? 'space-around' : 'space-around',
                padding: isMobile ? '0.75rem' : '1rem'
              }}>
                {[60, 80, 120, 90, 110, 85, 75].map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${isMobile ? height * 0.8 : height}px` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    style={{
                      width: isMobile ? '30px' : '40px',
                      background: 'linear-gradient(to top, #a855f7, #ec4899)',
                      borderRadius: '8px 8px 0 0'
                    }}
                  />
                ))}
              </div>
            </div> */}
          </div>
        );
      
      case 'players':
        return (
          <div style={styles.tabContent}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem', 
              color: '#e9d5ff',
              // Mobile responsive
              ...(isMobile && { fontSize: '1.3rem', marginBottom: '1.25rem' })
            }}>Referred Players</h2>
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '1.5rem', 
              flexWrap: 'wrap',
              // Mobile responsive
              ...(isMobile && { gap: '0.75rem', marginBottom: '1rem' }),
              ...(isMobile && window.innerWidth <= 480 && { flexDirection: 'column', gap: '0.5rem' })
            }}>
              <select style={{ 
                ...styles.input, 
                minWidth: isMobile ? '150px' : '180px',
                ...(isMobile && window.innerWidth <= 480 && { minWidth: '100%' })
              }}>
                <option>All Tokens</option>
                <option>SOL</option>
                <option>RADBRO</option>
                <option>BeTyche</option>
              </select>
              
              <select style={{ 
                ...styles.input, 
                minWidth: isMobile ? '150px' : '180px',
                ...(isMobile && window.innerWidth <= 480 && { minWidth: '100%' })
              }}>
                <option>All Activity</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              
              <button style={{
                ...styles.copyButton,
                ...(isMobile && window.innerWidth <= 480 && { width: '100%', justifyContent: 'center' })
              }}>
                Apply Filters
              </button>
            </div>
            
            <div style={{ 
              overflowX: 'auto',
              // Mobile responsive table container
              ...(isMobile && { 
                borderRadius: '12px',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              })
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                // Mobile responsive table
                ...(isMobile && { minWidth: '600px' })
              }}>
                <thead>
                  <tr style={{ 
                    background: 'rgba(168, 85, 247, 0.1)',
                    // Mobile responsive sticky header
                    ...(isMobile && { 
                      position: 'sticky',
                      top: 0,
                      zIndex: 10
                    })
                  }}>
                    <th style={{ 
                      padding: '1rem', 
                      textAlign: 'left',
                      // Mobile responsive cell padding
                      ...(isMobile && { padding: '0.75rem 0.5rem' }),
                      ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                    }}>Player</th>
                    <th style={{ 
                      padding: '1rem', 
                      textAlign: 'left',
                      ...(isMobile && { padding: '0.75rem 0.5rem' }),
                      ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                    }}>Referral Date</th>
                    <th style={{ 
                      padding: '1rem', 
                      textAlign: 'left',
                      ...(isMobile && { padding: '0.75rem 0.5rem' }),
                      ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                    }}>Total Games</th>
                    <th style={{ 
                      padding: '1rem', 
                      textAlign: 'left',
                      ...(isMobile && { padding: '0.75rem 0.5rem' }),
                      ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                    }}>Bet Volume</th>
                    <th style={{ 
                      padding: '1rem', 
                      textAlign: 'left',
                      ...(isMobile && { padding: '0.75rem 0.5rem' }),
                      ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                    }}>Wins</th>
                    <th style={{ 
                      padding: '1rem', 
                      textAlign: 'left',
                      ...(isMobile && { padding: '0.75rem 0.5rem' }),
                      ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                    }}>Losses</th>
                    <th style={{ 
                      padding: '1rem', 
                      textAlign: 'left',
                      ...(isMobile && { padding: '0.75rem 0.5rem' }),
                      ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                    }}>Net P&L</th>
                    <th style={{ 
                      padding: '1rem', 
                      textAlign: 'left',
                      ...(isMobile && { padding: '0.75rem 0.5rem' }),
                      ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                    }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {referralPlayers?.map((player, i) => (
                    <tr key={player.Player} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ 
                        padding: '1rem',
                        // Mobile responsive cell padding
                        ...(isMobile && { padding: '0.75rem 0.5rem' }),
                        ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                      }}>{truncateMiddle(player?.Player,8,12)}</td>
                      <td style={{ 
                        padding: '1rem',
                        ...(isMobile && { padding: '0.75rem 0.5rem' }),
                        ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                      }}>21-05-2025</td>
                      <td style={{ 
                        padding: '1rem',
                        ...(isMobile && { padding: '0.75rem 0.5rem' }),
                        ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                      }}>{player["Total Games"]}</td>
                      <td style={{ 
                        padding: '1rem',
                        ...(isMobile && { padding: '0.75rem 0.5rem' }),
                        ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                      }}>{player["Bet Volume"]}</td>
                      <td style={{ 
                        padding: '1rem', 
                        color: '#10b981',
                        ...(isMobile && { padding: '0.75rem 0.5rem' }),
                        ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                      }}>{player.Wins}</td>
                      <td style={{ 
                        padding: '1rem', 
                        color: '#ef4444', 
                        fontWeight: '500',
                        ...(isMobile && { padding: '0.75rem 0.5rem' }),
                        ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                      }}>
                        {player.Losses}
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        color: player["Net P&L"] >= 0 ? '#10b981' : '#ef4444', 
                        fontWeight: '500',
                        ...(isMobile && { padding: '0.75rem 0.5rem' }),
                        ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                      }}>
                        {player["Net P&L"] >= 0 
                          ? formatCurrency(player["Net P&L"]) 
                          : `-${formatCurrency(Math.abs(player["Net P&L"]))}`}
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        ...(isMobile && { padding: '0.75rem 0.5rem' }),
                        ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.25rem', fontSize: '0.85rem' })
                      }}>
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
                          fontSize: '0.85rem',
                          // Mobile responsive status badge
                          ...(isMobile && window.innerWidth <= 480 && { 
                            padding: '0.2rem 0.6rem',
                            fontSize: '0.8rem'
                          })
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
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem', 
              color: '#e9d5ff',
              // Mobile responsive
              ...(isMobile && { fontSize: '1.3rem', marginBottom: '1.25rem' })
            }}>Commissions</h2>
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '2rem', 
              flexWrap: 'wrap',
              // Mobile responsive
              ...(isMobile && { gap: '0.75rem', marginBottom: '1.5rem' }),
              ...(isMobile && window.innerWidth <= 480 && { flexDirection: 'column', gap: '0.5rem' })
            }}>
              <div style={{ 
                flex: 1, 
                minWidth: '300px',
                // Mobile responsive
                ...(isMobile && { minWidth: '250px' }),
                ...(isMobile && window.innerWidth <= 480 && { minWidth: 'auto' })
              }}>
                <h3 style={{ 
                  color: '#d8b4fe', 
                  marginBottom: '1rem',
                  // Mobile responsive
                  ...(isMobile && { fontSize: '0.95rem' })
                }}>Current Period Preview</h3>
                <div style={{ 
                  background: 'rgba(39, 23, 65, 0.4)', 
                  borderRadius: '12px', 
                  padding: '1.5rem',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  // Mobile responsive
                  ...(isMobile && { padding: '1rem' }),
                  ...(isMobile && window.innerWidth <= 480 && { padding: '0.75rem' })
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '1rem',
                    // Mobile responsive
                    ...(isMobile && window.innerWidth <= 480 && { flexDirection: 'column', gap: '0.5rem' })
                  }}>
                    <div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        fontSize: '0.9rem',
                        // Mobile responsive
                        ...(isMobile && { fontSize: '0.85rem' })
                      }}>Net Losses</div>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700',
                        // Mobile responsive
                        ...(isMobile && { fontSize: '1.3rem' }),
                        ...(isMobile && window.innerWidth <= 480 && { fontSize: '1.2rem' })
                      }}>{ambassadorData?.netLosses?formatCurrency(ambassadorData?.netLosses):'$0.00'}</div>
                    </div>
                    <div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        fontSize: '0.9rem',
                        // Mobile responsive
                        ...(isMobile && { fontSize: '0.85rem' })
                      }}>Commission Rate</div>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700',
                        // Mobile responsive
                        ...(isMobile && { fontSize: '1.3rem' }),
                        ...(isMobile && window.innerWidth <= 480 && { fontSize: '1.2rem' })
                      }}>{ambassadorData?.commissionRate}%</div>
                    </div>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(90deg, #7e22ce, #a855f7)', 
                    borderRadius: '8px', 
                    padding: '1rem',
                    textAlign: 'center',
                    fontWeight: '600',
                    // Mobile responsive
                    ...(isMobile && { padding: '0.75rem', fontSize: '0.9rem' })
                  }}>
                    Estimated Payout Available: {formatCurrency(ambassadorData?.totalCommissions)}
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(90deg, #059669, #10b981)', 
                    borderRadius: '8px', 
                    padding: '1rem',
                    textAlign: 'center',
                    fontWeight: '600',
                    marginTop: '0.5rem',
                    // Mobile responsive
                    ...(isMobile && { padding: '0.75rem', fontSize: '0.9rem' })
                  }}>
                    Already Paid: {formatCurrency(ambassadorData?.totalEarnings || 0)}
                  </div>
                  <button
                    onClick={handlePayoutRequest}
                    disabled={!ambassadorData?.totalCommissions || ambassadorData?.totalCommissions <= 0 || payoutRequestLoading || ambassadorData?.hasPendingRequest}
                    style={{
                      width: '100%',
                      background: (ambassadorData?.totalCommissions > 0 && !ambassadorData?.hasPendingRequest)
                        ? 'linear-gradient(90deg, #dc2626, #ef4444)' 
                        : 'linear-gradient(90deg, #6b7280, #9ca3af)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginTop: '0.5rem',
                      fontWeight: '600',
                      cursor: (ambassadorData?.totalCommissions > 0 && !ambassadorData?.hasPendingRequest) ? 'pointer' : 'not-allowed',
                      opacity: (ambassadorData?.totalCommissions > 0 && !ambassadorData?.hasPendingRequest) ? 1 : 0.6,
                      fontSize: '1rem',
                      // Mobile responsive
                      ...(isMobile && { padding: '0.75rem', fontSize: '0.9rem' })
                    }}
                  >
                    {payoutRequestLoading ? 'Sending Request...' : 
                     ambassadorData?.hasPendingRequest ? 'Request Already Pending' : 
                     'Request Commission Payout'}
                  </button>
                  {ambassadorData?.hasPendingRequest && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      fontWeight: '500'
                    }}>
                      You have a pending payout request. Please wait for admin approval.
                    </div>
                  )}
                  {payoutRequestMessage.text && payoutRequestMessage.type === 'success' && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      backgroundColor: '#10b981',
                      color: 'white',
                      fontWeight: '500'
                    }}>
                      {payoutRequestMessage.text}
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ 
                flex: 1, 
                minWidth: '300px',
                // Mobile responsive
                ...(isMobile && { minWidth: '250px' }),
                ...(isMobile && window.innerWidth <= 480 && { minWidth: 'auto' })
              }}>
                <h3 style={{ 
                  color: '#d8b4fe', 
                  marginBottom: '1rem',
                  // Mobile responsive
                  ...(isMobile && { fontSize: '0.95rem' })
                }}>Commission History</h3>
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  // Mobile responsive
                  ...(isMobile && { maxHeight: '250px' }),
                  ...(isMobile && window.innerWidth <= 480 && { maxHeight: '200px' })
                }}>
                  {commissionHistoryLoading ? (
                    <div style={{
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem',
                      padding: '2rem'
                    }}>
                      Loading commission history...
                    </div>
                  ) : commissionHistory.length === 0 ? (
                    <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem'}}>
                      No commission history
                    </p>
                  ) : (
                    commissionHistory.map((item) => (
                      <div key={item.id} style={{
                        background: 'rgba(39, 23, 65, 0.4)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        // Mobile responsive
                        ...(isMobile && { padding: '0.75rem', marginBottom: '0.5rem' }),
                        ...(isMobile && window.innerWidth <= 480 && { 
                          padding: '0.5rem', 
                          flexDirection: 'column', 
                          alignItems: 'stretch', 
                          gap: '0.5rem', 
                          textAlign: 'center' 
                        })
                      }}>
                        <div>
                          <div style={{ 
                            fontWeight: '500',
                            // Mobile responsive
                            ...(isMobile && { fontSize: '0.9rem' })
                          }}>{item.period}</div>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            color: 'rgba(255,255,255,0.7)',
                            // Mobile responsive
                            ...(isMobile && { fontSize: '0.85rem' })
                          }}>
                            {item.netLoss > 0 ? `${formatCurrency(item.netLoss)} net loss` : 'Commission request'}
                          </div>
                        </div>
                        <div style={{ 
                          textAlign: 'right',
                          // Mobile responsive
                          ...(isMobile && window.innerWidth <= 480 && { textAlign: 'center' })
                        }}>
                          <div style={{ 
                            fontWeight: '700',
                            // Mobile responsive
                            ...(isMobile && { fontSize: '0.9rem' })
                          }}>{formatCurrency(item.commissionAmount)}</div>
                          <div style={{
                            background: item.status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : 
                                       item.status === 'Pending' ? 'rgba(245, 158, 11, 0.15)' :
                                       item.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' :
                                       'rgba(107, 114, 128, 0.15)',
                            color: item.status === 'Paid' ? '#10b981' : 
                                   item.status === 'Pending' ? '#f59e0b' :
                                   item.status === 'Rejected' ? '#ef4444' :
                                   '#6b7280',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.85rem',
                            // Mobile responsive status badge
                            ...(isMobile && window.innerWidth <= 480 && { 
                              padding: '0.2rem 0.6rem',
                              fontSize: '0.8rem'
                            })
                          }}>
                            {item.status}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
       
      
      case 'funnel':
        return (
          <div style={styles.tabContent}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem', 
              color: '#e9d5ff',
              // Mobile responsive
              ...(isMobile && { fontSize: '1.3rem', marginBottom: '1.25rem' })
            }}>Referral Funnel</h2>
            
            {/* Time Period Filters */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '2rem', 
              flexWrap: 'wrap',
              // Mobile responsive
              ...(isMobile && { gap: '0.75rem', marginBottom: '1.5rem' }),
              ...(isMobile && window.innerWidth <= 480 && { gap: '0.5rem' })
            }}>
              {['1D', '1W', '1M', 'ALL'].map((period) => (
                <button
                  key={period}
                  onClick={() => handleFunnelPeriodChange(period)}
                  style={{
                    ...styles.copyButton,
                    ...(period === selectedFunnelPeriod ? styles.activeTab : {}),
                    // Mobile responsive
                    ...(isMobile && { padding: '0.6rem 1rem', fontSize: '0.85rem' }),
                    ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem 0.8rem', fontSize: '0.8rem' })
                  }}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Funnel Visualization */}
            {funnelLoading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: '#e9d5ff',
                fontSize: '1.1rem'
              }}>
                <div style={{ 
                  display: 'inline-block',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '1rem'
                }}>⟳</div>
                <div>Loading funnel analytics...</div>
              </div>
            ) : funnelData ? (
              <div style={{ 
                ...styles.mobileFunnelContainer,
                // Override with inline styles for dynamic responsiveness
                height: isMobile ? '350px' : '400px',
                flexDirection: isMobile && window.innerWidth <= 480 ? 'column' : 'row',
                alignItems: isMobile && window.innerWidth <= 480 ? 'center' : 'flex-end',
                justifyContent: isMobile && window.innerWidth <= 480 ? 'space-around' : 'space-between',
                padding: isMobile ? '1.5rem' : '2rem',
                gap: '1rem'
              }}>
                {/* Views */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: '#e9d5ff',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '1.1rem' }),
                    ...(isMobile && window.innerWidth <= 480 && { fontSize: '1rem' })
                  }}>Views</div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: isMobile ? '160px' : '200px' }}
                    transition={{ duration: 1 }}
                    style={{
                      width: isMobile ? '60px' : '80px',
                      background: 'linear-gradient(to top, #7e22ce, #a855f7)',
                      borderRadius: '8px 8px 0 0',
                      margin: '0 auto'
                    }}
                  />
                  <div style={{ 
                    marginTop: '0.5rem', 
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color: '#fff',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '0.9rem' })
                  }}>{funnelData.views || 0}</div>
                  <div style={{ 
                    color: '#a78bfa', 
                    fontSize: '0.9rem',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '0.8rem' })
                  }}>100%</div>
                </div>

                {/* Signups */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: '#e9d5ff',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '1.1rem' }),
                    ...(isMobile && window.innerWidth <= 480 && { fontSize: '1rem' })
                  }}>Signups</div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: isMobile ? '128px' : '160px' }}
                    transition={{ duration: 1, delay: 0.2 }}
                    style={{
                      width: isMobile ? '60px' : '80px',
                      background: 'linear-gradient(to top, #a855f7, #d946ef)',
                      borderRadius: '8px 8px 0 0',
                      margin: '0 auto'
                    }}
                  />
                  <div style={{ 
                    marginTop: '0.5rem', 
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color: '#fff',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '0.9rem' })
                  }}>{funnelData.signups || 0}</div>
                  <div style={{ 
                    color: '#a78bfa', 
                    fontSize: '0.9rem',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '0.8rem' })
                  }}>{funnelData.signups && funnelData.views ? ((funnelData.signups / funnelData.views) * 100).toFixed(1) : 0}%</div>
                </div>

                {/* First Bets */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: '#e9d5ff',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '1.1rem' }),
                    ...(isMobile && window.innerWidth <= 480 && { fontSize: '1rem' })
                  }}>First Bets</div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: isMobile ? '96px' : '120px' }}
                    transition={{ duration: 1, delay: 0.4 }}
                    style={{
                      width: isMobile ? '60px' : '80px',
                      background: 'linear-gradient(to top, #d946ef, #f97316)',
                      borderRadius: '8px 8px 0 0',
                      margin: '0 auto'
                    }}
                  />
                  <div style={{ 
                    marginTop: '0.5rem', 
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color: '#fff',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '0.9rem' })
                  }}>{funnelData.firstBets || 0}</div>
                  <div style={{ 
                    color: '#a78bfa', 
                    fontSize: '0.9rem',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '0.8rem' })
                  }}>{funnelData.firstBets && funnelData.views ? ((funnelData.firstBets / funnelData.views) * 100).toFixed(1) : 0}%</div>
                </div>

                {/* Conversions */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: '#e9d5ff',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '1.1rem' }),
                    ...(isMobile && window.innerWidth <= 480 && { fontSize: '1rem' })
                  }}>Conversions</div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: isMobile ? '64px' : '80px' }}
                    transition={{ duration: 1, delay: 0.6 }}
                    style={{
                      width: isMobile ? '60px' : '80px',
                      background: 'linear-gradient(to top, #f97316, #22c55e)',
                      borderRadius: '8px 8px 0 0',
                      margin: '0 auto'
                    }}
                  />
                  <div style={{ 
                    marginTop: '0.5rem', 
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color: '#fff',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '0.9rem' })
                  }}>{funnelData.conversions || 0}</div>
                  <div style={{ 
                    color: '#a78bfa', 
                    fontSize: '0.9rem',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '0.8rem' })
                  }}>{funnelData.conversions && funnelData.views ? ((funnelData.conversions / funnelData.views) * 100).toFixed(1) : 0}%</div>
                </div>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: '#a78bfa',
                fontSize: '1.1rem'
              }}>
                <div>No funnel data available</div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#8b5cf6' }}>
                  Data will appear once you start referring players
                </div>
              </div>
            )}

            {/* Funnel Summary Stats */}
            {funnelData && (
              <div style={{
                marginTop: '2rem',
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)',
                gap: '1rem'
              }}>
                <div style={{
                  background: 'rgba(39, 23, 65, 0.4)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#a78bfa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Signup Rate</div>
                  <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {funnelData.signups && funnelData.views ? ((funnelData.signups / funnelData.views) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div style={{
                  background: 'rgba(39, 23, 65, 0.4)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#a78bfa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>First Bet Rate</div>
                  <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {funnelData.firstBets && funnelData.signups ? ((funnelData.firstBets / funnelData.signups) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div style={{
                  background: 'rgba(39, 23, 65, 0.4)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#a78bfa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Conversion Rate</div>
                  <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {funnelData.conversions && funnelData.firstBets ? ((funnelData.conversions / funnelData.firstBets) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div style={{
                  background: 'rgba(39, 23, 65, 0.4)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#a78bfa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Overall Conversion</div>
                  <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {funnelData.conversions && funnelData.views ? ((funnelData.conversions / funnelData.views) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div style={{
                  background: 'rgba(39, 23, 65, 0.4)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#a78bfa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Bet Volume</div>
                  <div style={{ color: '#00ff88', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    ${funnelData.totalBetVolume ? funnelData.totalBetVolume.toLocaleString() : '0'}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'share':
        return (
          <div style={styles.tabContent}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem', 
              color: '#e9d5ff',
              // Mobile responsive
              ...(isMobile && { fontSize: '1.3rem', marginBottom: '1.25rem' })
            }}>Share Your Referral</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1.5rem',
              marginBottom: '2rem',
              // Mobile responsive
              ...(isMobile && { gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' })
            }}>
              <div style={{ 
                background: 'rgba(39, 23, 65, 0.4)', 
                borderRadius: '16px', 
                padding: '1.5rem',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                // Mobile responsive
                ...(isMobile && { padding: '1rem', borderRadius: '12px' })
              }}>
                <h3 style={{ 
                  color: '#d8b4fe', 
                  marginBottom: '1rem',
                  // Mobile responsive
                  ...(isMobile && { fontSize: '0.95rem' })
                }}>Your Referral Link</h3>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  // Mobile responsive
                  ...(isMobile && window.innerWidth <= 480 && { flexDirection: 'column', gap: '0.25rem' })
                }}>
                  <input
                    type="text"
                    value={`https://casino.com/ref/${ambassadorData?.referralCode || 'REFCODE'}`}
                    readOnly
                    style={styles.input}
                  />
                  <button style={{
                    ...styles.copyButton,
                    // Mobile responsive
                    ...(isMobile && window.innerWidth <= 480 && { width: '100%', justifyContent: 'center' })
                  }}>
                    <Copy size={16} /> Copy
                  </button>
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(39, 23, 65, 0.4)', 
                borderRadius: '16px', 
                padding: '1.5rem',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                // Mobile responsive
                ...(isMobile && { padding: '1rem', borderRadius: '12px' })
              }}>
                <h3 style={{ 
                  color: '#d8b4fe', 
                  marginBottom: '1rem',
                  // Mobile responsive
                  ...(isMobile && { fontSize: '0.95rem' })
                }}>Your Referral Code</h3>
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
            
            <h3 style={{ 
              color: '#d8b4fe', 
              marginBottom: '1rem',
              // Mobile responsive
              ...(isMobile && { fontSize: '0.95rem' })
            }}>Share Via</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
              gap: '1rem',
              // Mobile responsive
              ...(isMobile && { 
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '0.75rem'
              }),
              ...(isMobile && window.innerWidth <= 480 && { 
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '0.5rem'
              })
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
                    fontWeight: '500',
                    // Mobile responsive
                    ...(isMobile && { padding: '0.75rem', gap: '0.25rem' }),
                    ...(isMobile && window.innerWidth <= 480 && { padding: '0.5rem' })
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {platform.icon}
                  <span style={{
                    // Hide names on very small screens
                    ...(isMobile && window.innerWidth <= 480 && { display: 'none' })
                  }}>
                    {platform.name}
                  </span>
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
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem', 
              color: '#e9d5ff',
              // Mobile responsive
              ...(isMobile && { fontSize: '1.3rem', marginBottom: '1.25rem' })
            }}>Account Settings</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1.5rem',
              marginBottom: '2rem',
              // Mobile responsive
              ...(isMobile && { gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' })
            }}>
              {/* Wallet Information */}
              <div style={{ 
                background: 'rgba(39, 23, 65, 0.4)', 
                borderRadius: '16px', 
                padding: '1.5rem',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                // Mobile responsive
                ...(isMobile && { padding: '1rem', borderRadius: '12px' })
              }}>
                <h3 style={{ 
                  color: '#d8b4fe', 
                  marginBottom: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  // Mobile responsive
                  ...(isMobile && { fontSize: '0.95rem' })
                }}>
                  <Wallet size={20} /> Payout Wallet
                </h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: 'rgba(255,255,255,0.7)',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '0.9rem' })
                  }}>Wallet Address</label>
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem',
                    // Mobile responsive
                    ...(isMobile && window.innerWidth <= 480 && { flexDirection: 'column', gap: '0.25rem' })
                  }}>
                    <input
                      type="text"
                      placeholder="Enter your wallet address"
                      value={isEditingWallet ? tempWalletAddress : ambassadorData?.walletAddress}
                      onChange={(e) => isEditingWallet ? setTempWalletAddress(e.target.value) : {}}
                      disabled={!isEditingWallet}
                      style={{
                        ...styles.input,
                        opacity: isEditingWallet ? 1 : 0.7,
                        cursor: isEditingWallet ? 'text' : 'not-allowed'
                      }}
                    />
                    <button 
                      onClick={() => {
                        if (isEditingWallet) {
                          // Save the wallet address
                          handleSaveWalletAddress();
                        } else {
                          // Enter edit mode
                          setTempWalletAddress(ambassadorData?.walletAddress || '');
                          setIsEditingWallet(true);
                          setWalletMessage({ type: '', text: '' }); // Clear messages when entering edit mode
                        }
                      }}
                      style={{
                        ...styles.copyButton,
                        backgroundColor: isEditingWallet ? '#10b981' : '#8b5cf6',
                        // Mobile responsive
                        ...(isMobile && window.innerWidth <= 480 && { width: '100%', justifyContent: 'center' })
                      }}
                    >
                      {isEditingWallet ? <Check size={16} /> : <Edit3 size={16} />}
                    </button>
                    <button 
                      onClick={() => {
                        if (isEditingWallet) {
                          // Cancel edit mode
                          setIsEditingWallet(false);
                          setTempWalletAddress('');
                          setWalletMessage({ type: '', text: '' }); // Clear messages when canceling
                        } else {
                          // Copy wallet address
                          navigator.clipboard.writeText(ambassadorData?.walletAddress || '');
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }
                      }}
                      style={{
                        ...styles.copyButton,
                        backgroundColor: isEditingWallet ? '#ef4444' : '#6b7280',
                        // Mobile responsive
                        ...(isMobile && window.innerWidth <= 480 && { width: '100%', justifyContent: 'center' })
                      }}
                    >
                      {isEditingWallet ? <X size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  
                  {/* Success/Error Message */}
                  {walletMessage.text && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      backgroundColor: walletMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${walletMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
                      color: walletMessage.type === 'success' ? '#10b981' : '#ef4444',
                      // Mobile responsive
                      ...(isMobile && { fontSize: '0.85rem', padding: '0.5rem' })
                    }}>
                      {walletMessage.text}
                    </div>
                  )}
                  
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: 'rgba(255,255,255,0.5)', 
                    marginTop: '0.5rem',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '0.8rem' })
                  }}>
                    This is where your commissions will be paid . You Can Change it any time .
                  </p>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: 'rgba(255,255,255,0.7)',
                    // Mobile responsive
                    ...(isMobile && { fontSize: '0.9rem' })
                  }}>Network</label>
                  <select style={styles.input}>
                    <option>Solana (SOL)</option>
                  </select>
                </div>
              </div>
              
              {/* Security Settings */}
              <div style={{ 
                background: 'rgba(39, 23, 65, 0.4)', 
                borderRadius: '16px', 
                padding: '1.5rem',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                // Mobile responsive
                ...(isMobile && { padding: '1rem', borderRadius: '12px' })
              }}>
                <h3 style={{ 
                  color: '#d8b4fe', 
                  marginBottom: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  // Mobile responsive
                  ...(isMobile && { fontSize: '0.95rem' })
                }}>
                  <Shield size={20} /> Security
                </h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Display Name</label>
                  <input
                    type="text"
                    value={ambassadorData?.name}
                    onChange={() => {}}
                    style={styles.input}
                  />
                </div>
                
                {/* <div style={{ marginBottom: '1.5rem' }}>
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
                </div> */}
                
                <div>
                  <button 
                    style={{
                      ...styles.copyButton,
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#fecaca',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                    onClick={() => setShowChangePasswordModal(true)}
                  >
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Your Referral Code</label>
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
                    {ambassadorData?.referralCode || "AMB12345"}
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
                      value={`${process.env.REACT_APP_FRONTEND_URL || "http://pulse-testnet-frontend.netlify.app"}/ref/${ambassadorData?.referralCode}`}
                      readOnly
                      style={styles.input}
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${process.env.REACT_APP_FRONTEND_URL || "http://pulse-testnet-frontend.netlify.app"}/ref/${ambassadorData?.referralCode}`);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      style={styles.copyButton}
                    >
                      {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              // Mobile responsive
              ...(isMobile && window.innerWidth <= 480 && { flexDirection: 'column', gap: '0.75rem', justifyContent: 'stretch' })
            }}>
              {/* <motion.button
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.8rem 2rem',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  // Mobile responsive
                  ...(isMobile && { padding: '0.75rem 1.5rem', fontSize: '0.9rem' }),
                  ...(isMobile && window.innerWidth <= 480 && { width: '100%' })
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Save Changes
              </motion.button> */}
              {accountStatus === 'flagged' && (
                <motion.div
                  style={{
                    ...styles.flaggedBanner,
                    // Mobile responsive
                    ...(isMobile && { padding: '0.75rem', marginBottom: '1rem' })
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div style={{
                    ...styles.flaggedContent,
                    // Mobile responsive
                    ...(isMobile && { flexDirection: 'column', alignItems: 'stretch', gap: '1rem' })
                  }}>
                    <div style={{
                      ...styles.flaggedHeader,
                      // Mobile responsive
                      ...(isMobile && { justifyContent: 'center', minWidth: 'auto' })
                    }}>
                      <AlertCircle size={24} />
                      <h3 style={{
                        ...styles.flaggedTitle,
                        // Mobile responsive
                        ...(isMobile && { fontSize: '1.1rem' })
                      }}>Account Flagged</h3>
                    </div>
                    
                    <div style={{
                      ...styles.flaggedDetails,
                      // Mobile responsive
                      ...(isMobile && { minWidth: 'auto', textAlign: 'center' })
                    }}>
                      <div style={styles.flaggedReason}>
                        <strong>Status:</strong> Account Active
                      </div>
                      <div style={styles.flaggedDate}>
                        <strong>Commission Rate:</strong> {ambassadorData?.commissionRate || 0}%
                      </div>
                      <div style={styles.flaggedImpact}>
                        <strong>Total Referrals:</strong> {ambassadorData?.totalReferrals || 0}
                      </div>
                    </div>
                    
                    <div style={{
                      ...styles.flaggedActions,
                      // Mobile responsive
                      ...(isMobile && { minWidth: 'auto', display: 'flex', justifyContent: 'center' })
                    }}>
                      <motion.button
                        style={{
                          ...styles.contactButton,
                          // Mobile responsive
                          ...(isMobile && { padding: '0.75rem 1rem', fontSize: '0.9rem' })
                        }}
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
    <div style={{...styles.container, position: 'relative', zIndex: 10}}>
      <div style={styles.backgroundEffects}>
        <div style={styles.glowOrbPurple} />
        <div style={styles.glowOrbPink} />
      </div>
      
      <div style={{
        ...(isMobile && window.innerWidth <= 480 ? styles.dashboardLayoutSmallMobile :
            isMobile ? styles.dashboardLayoutMobile : 
            styles.dashboardLayout), 
        position: 'relative', 
        zIndex: 12
      }}>
        {/* Header */}
        <motion.header 
          style={{...styles.dashboardHeader, position: 'relative', zIndex: 13}}
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
        <div style={{
          ...(isMobile && window.innerWidth <= 480 ? styles.tabContainerSmallMobile :
              isMobile ? styles.tabContainerMobile : 
              styles.tabContainer), 
          position: 'relative', 
          zIndex: 14
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              style={{
                ...(isMobile && window.innerWidth <= 480 ? styles.tabButtonSmallMobile :
                    isMobile ? styles.tabButtonMobile : 
                    styles.tabButton),
                ...(activeTab === tab.id ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span style={{
                // Hide labels on very small screens
                ...(window.innerWidth <= 480 && { display: 'none' })
              }}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div style={{...styles.tabContent, position: 'relative', zIndex: 15}}>
          {renderTabContent()}
        </div>
      </div>
{showContactModal && (
  <motion.div
    style={{
      ...styles.modalBackdrop, 
      position: 'fixed', 
      zIndex: 1000,
      // Mobile responsive
      ...(isMobile && { padding: '1rem' })
    }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    onClick={() => setShowContactModal(false)}
  >
    <motion.div
      style={{
        ...styles.contactModal, 
        position: 'relative', 
        zIndex: 1001,
        // Mobile responsive
        ...(isMobile && { padding: '1.5rem', borderRadius: '20px', maxWidth: '95%' }),
        ...(isMobile && window.innerWidth <= 480 && { padding: '1rem', borderRadius: '16px', maxWidth: '100%' })
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={styles.modalHeader}>
        <h3 style={{
          ...styles.modalTitle,
          // Mobile responsive
          ...(isMobile && window.innerWidth <= 480 && { fontSize: '1.25rem' })
        }}>
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
      
      <div style={{
        ...styles.modalContent,
        // Mobile responsive
        ...(isMobile && { gridTemplateColumns: '1fr', gap: '1.5rem' })
      }}>
        <div style={{
          ...styles.contactInfo,
          // Mobile responsive
          ...(isMobile && window.innerWidth <= 480 && { padding: '1rem', borderRadius: '12px' })
        }}>
          <div style={{
            ...styles.contactMethod,
            // Mobile responsive
            ...(isMobile && window.innerWidth <= 480 && { fontSize: '1rem', gap: '0.75rem', marginBottom: '1rem' })
          }}>
            <Mail size={20} />
            <span>support@casino.com</span>
          </div>
          <div style={{
            ...styles.contactMethod,
            ...(isMobile && window.innerWidth <= 480 && { fontSize: '1rem', gap: '0.75rem', marginBottom: '1rem' })
          }}>
            <MessageSquare size={20} />
            <span>Live Chat (24/7)</span>
          </div>
          <div style={{
            ...styles.contactMethod,
            ...(isMobile && window.innerWidth <= 480 && { fontSize: '1rem', gap: '0.75rem', marginBottom: '1rem' })
          }}>
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
            style={{
              ...styles.messageInput,
              // Mobile responsive
              ...(isMobile && window.innerWidth <= 480 && { padding: '0.75rem', fontSize: '0.9rem', minHeight: '120px' })
            }}
            rows={5}
          />
          
          <div style={{
            ...styles.formActions,
            // Mobile responsive
            ...(isMobile && window.innerWidth <= 480 && { flexDirection: 'column', gap: '0.75rem' })
          }}>
            <button 
              style={{
                ...styles.cancelButton,
                // Mobile responsive
                ...(isMobile && window.innerWidth <= 480 && { padding: '0.75rem 1rem', fontSize: '0.9rem' })
              }}
              onClick={() => setShowContactModal(false)}
            >
              Cancel
            </button>
            <button 
              style={{
                ...styles.submitButton,
                // Mobile responsive
                ...(isMobile && window.innerWidth <= 480 && { padding: '0.75rem 1rem', fontSize: '0.9rem' })
              }}
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

      {/* Change Password Modal */}
      {showChangePasswordModal && (
          <motion.div
            style={{
              ...styles.modalBackdrop, 
              position: 'fixed', 
              zIndex: 1000,
              // Mobile responsive
              ...(isMobile && { padding: '1rem' })
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleChangePasswordModalClose}
          >
            <motion.div
              style={{
                ...styles.contactModal, 
                position: 'relative', 
                zIndex: 1001,
                // Mobile responsive
                ...(isMobile && { padding: '1.5rem', borderRadius: '20px', maxWidth: '95%' }),
                ...(isMobile && window.innerWidth <= 480 && { padding: '1rem', borderRadius: '16px', maxWidth: '100%' })
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3 style={{
                  ...styles.modalTitle,
                  // Mobile responsive
                  ...(isMobile && { fontSize: '1.1rem' })
                }}>
                  <Shield size={24} style={{ marginRight: '0.75rem' }} />
                  Change Password
                </h3>
                <button 
                  style={styles.modalClose}
                  onClick={handleChangePasswordModalClose}
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}>
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={changePasswordForm.currentPassword}
                      onChange={(e) => setChangePasswordForm({...changePasswordForm, currentPassword: e.target.value})}
                      style={styles.input}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={changePasswordForm.newPassword}
                      onChange={(e) => setChangePasswordForm({...changePasswordForm, newPassword: e.target.value})}
                      style={styles.input}
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
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
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                      value={changePasswordForm.confirmPassword}
                      onChange={(e) => setChangePasswordForm({...changePasswordForm, confirmPassword: e.target.value})}
                      style={styles.input}
                      placeholder="Confirm new password"
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
                        justifyContent: 'center'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                {changePasswordError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#fecaca',
                    fontSize: '0.875rem'
                  }}>
                    {changePasswordError}
                  </div>
                )}
                
                {changePasswordSuccess && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#6ee7b7',
                    fontSize: '0.875rem'
                  }}>
                    {changePasswordSuccess}
                  </div>
                )}
                
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end',
                  // Mobile responsive
                  ...(isMobile && window.innerWidth <= 480 && { flexDirection: 'column', gap: '0.75rem' })
                }}>
                  <button 
                    type="button"
                    style={{
                      ...styles.cancelButton,
                      // Mobile responsive
                      ...(isMobile && window.innerWidth <= 480 && { padding: '0.75rem 1rem', fontSize: '0.9rem' })
                    }}
                    onClick={handleChangePasswordModalClose}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{
                      ...styles.submitButton,
                      // Mobile responsive
                      ...(isMobile && window.innerWidth <= 480 && { padding: '0.75rem 1rem', fontSize: '0.9rem' })
                    }}
                    disabled={changePasswordLoading}
                  >
                    {changePasswordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        
        {/* Toast Notification */}
        {toast.show && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            maxWidth: '400px',
            fontSize: '0.9rem',
            fontWeight: '500',
            animation: 'slideInRight 0.3s ease-out',
            // Mobile responsive
            ...(isMobile && { 
              top: '10px', 
              right: '10px', 
              left: '10px', 
              maxWidth: 'none',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem'
            })
          }}>
            {toast.message}
          </div>
        )}
    </div>
  );
};

export default Ambassador;