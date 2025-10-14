import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, ScrollText, Shield } from 'lucide-react';
import { useTOS } from '../context/TOSContext';

const TermsOfServiceModal = () => {
  const { showModal, acceptTerms, declineTerms } = useTOS();
  const [showError, setShowError] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const handleDecline = () => {
    setShowError(true);
    declineTerms();
    
    // Auto-hide error after 3 seconds
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  const handleAccept = () => {
    setShowError(false);
    acceptTerms();
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const threshold = 50; // Allow 50px from bottom to be considered "scrolled to bottom"
    setIsScrolledToBottom(scrollTop + clientHeight >= scrollHeight - threshold);
  };

  // Reset scroll position when modal opens
  useEffect(() => {
    if (showModal) {
      setIsScrolledToBottom(false);
      setShowError(false);
    }
  }, [showModal]);

  // ThePulse.bet Terms of Service
  const termsContent = `
    TERMS OF SERVICE (TOS) — THEPULSE.BET

    1. NATURE OF SERVICES
    ThePulse.bet is a crypto-based prediction platform where users forecast short-term price movements of digital assets (e.g., whether Bitcoin's price will rise or fall within the next 60 seconds). ThePulse.bet is a prediction market technology service, not gambling, gaming, or a financial advisor. All outcomes are determined by on-chain smart contracts and third-party oracle price feeds.

    2. ELIGIBILITY & AGE RESTRICTIONS
    By using ThePulse.bet, you confirm that: You meet the minimum legal age requirement in your jurisdiction: 21+ in the United States (all states), Canada (Ontario), United Kingdom, Singapore, and Australia. 18+ in the European Union, Canada (outside Ontario), Brazil, Argentina, Mexico, Chile, Japan, Nigeria, South Africa. You are not located in restricted jurisdictions, including: China, South Korea, UAE, Saudi Arabia, Qatar, Turkey, or other countries prohibiting prediction/gaming services. You are accessing ThePulse.bet voluntarily and in compliance with all applicable laws.

    3. ACCOUNTS & WALLETS
    ThePulse.bet operates via non-custodial crypto wallets (e.g., Phantom, MetaMask, Trust Wallet). You are solely responsible for maintaining control of your wallet, private keys, and security credentials. ThePulse.bet does not hold custody of user funds. All transactions occur directly on the blockchain.

    4. PLATFORM RULES
    Predictions are resolved using independent oracle price feeds (e.g., Pyth). Oracle data is final and binding. Each prediction is final once placed. Transactions cannot be reversed or canceled. Platform Fee: ThePulse.bet collects a 5% service fee on winning predictions (calculated on total winnings plus original stake). This fee is subject to change in real time at ThePulse.bet's discretion, and may increase or decrease in the future. While we anticipate it will remain at 5%, ThePulse.bet reserves the right to adjust the fee without prior notice. Users may receive referral or ambassador rewards, subject to anti-abuse monitoring.

    5. DISCLAIMERS
    No Gambling: ThePulse.bet is a prediction market platform, not gambling. Participation is based on forecasting public price data. No Investment Advice: ThePulse.bet does not provide financial, legal, or investment advice. No Guarantees: ThePulse.bet does not guarantee uninterrupted service, oracle accuracy, or smart contract uptime. Technical issues, delays, or data discrepancies may occur. Finality of Results: All outcomes are executed by blockchain smart contracts and are final, binding, and irreversible. ThePulse.bet cannot manually alter or reverse outcomes.

    6. LIMITATION OF LIABILITY
    To the fullest extent permitted by law: ThePulse.bet and its affiliates are not liable for any direct, indirect, incidental, or consequential damages, including loss of funds, inability to access the platform, or reliance on oracle data. You agree that your use of ThePulse.bet is at your own risk. ThePulse.bet is a technology service provider only and not responsible for prediction outcomes, liquidity, or payouts.

    7. USER RESPONSIBILITIES
    You agree not to: Use ThePulse.bet for unlawful purposes, including fraud or money laundering. Circumvent jurisdictional restrictions using VPNs or false credentials. Exploit bugs, vulnerabilities, or referral systems. You agree not to abuse the platform, including but not limited to arbitrage exploits, manipulation, hacking, or taking advantage of smart contract or system loopholes. You agree not to abuse the referral system, including creating duplicate or fraudulent accounts to generate bonuses, or otherwise attempting to unfairly gain referral rewards.

    8. TERMINATION OF SERVICE
    ThePulse.bet may suspend or terminate access if you violate these Terms or applicable laws. Any predictions placed before termination will be resolved automatically via smart contracts.

    9. DISPUTE RESOLUTION
    All disputes shall be resolved via binding arbitration under the laws of Delaware, USA. You waive your right to class actions or jury trials. Claims must be filed individually.

    10. UPDATES TO TERMS
    ThePulse.bet reserves the right to update these Terms at any time. Continued use of the platform after updates constitutes acceptance.

    11. ACKNOWLEDGMENT
    By using ThePulse.bet, you acknowledge and agree that: ThePulse.bet is a prediction market technology platform, not gambling. You assume all risks related to your participation. Oracle data and smart contract execution are final and binding. ThePulse.bet bears no liability for user losses, oracle discrepancies, or technical issues.

    Last Updated: ${new Date().toLocaleDateString()}
  `;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    },
    modal: {
      backgroundColor: '#1a1a1a',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'visible',
      border: '1px solid #333',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      padding: '24px 24px 16px',
      borderBottom: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      color: '#fff',
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    content: {
      padding: '24px',
      maxHeight: '300px',
      overflowY: 'auto',
      backgroundColor: '#1a1a1a',
      flex: '1',
    },
    termsText: {
      color: '#e5e5e5',
      fontSize: '14px',
      lineHeight: '1.6',
      whiteSpace: 'pre-line',
      fontFamily: 'monospace',
    },
    footer: {
      padding: '20px 24px',
      borderTop: '1px solid #333',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      gap: '16px',
      justifyContent: 'flex-end',
    },
    button: {
      padding: '12px 24px',
      borderRadius: '12px',
      border: '2px solid #fff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: '120px',
      justifyContent: 'center',
      position: 'relative',
      zIndex: 1,
    },
    acceptButton: {
      backgroundColor: '#10b981',
      color: '#fff',
    },
    declineButton: {
      backgroundColor: '#ef4444',
      color: '#fff',
    },
    errorMessage: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid #ef4444',
      color: '#fca5a5',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
    },
    scrollIndicator: {
      position: 'absolute',
      bottom: '120px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      border: '1px solid #10b981',
      color: '#10b981',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      opacity: isScrolledToBottom ? 0 : 1,
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: '#666',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
    },
  };

  return (
    <AnimatePresence>
        {showModal && (
        <motion.div
          style={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            style={styles.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            {/* Header */}
            <div style={styles.header}>
              <h2 style={styles.title}>
                <Shield size={28} />
                Terms of Service
              </h2>
              <button
                style={styles.closeButton}
                onClick={() => {/* Modal cannot be closed without accepting */}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                disabled
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div 
              style={styles.content}
              onScroll={handleScroll}
            >
              {showError && (
                <div style={styles.errorMessage}>
                  <AlertCircle size={16} />
                  You must accept the Terms of Service to continue using this website.
                </div>
              )}
              
              <div style={styles.termsText}>
                {termsContent}
              </div>
            </div>

            {/* Scroll Indicator */}
            {!isScrolledToBottom && (
              <div style={styles.scrollIndicator}>
                Please scroll down to read all terms
              </div>
            )}

            {/* Footer */}
            <div style={styles.footer}>
              {showError && (
                <div style={styles.errorMessage}>
                  <AlertCircle size={16} />
                  You must accept the Terms of Service to continue using this website.
                </div>
              )}
              
              <button
                style={{
                  ...styles.button,
                  ...styles.declineButton,
                }}
                onClick={handleDecline}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ef4444';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <X size={16} />
                Decline
              </button>
              
              <button
                style={{
                  ...styles.button,
                  ...styles.acceptButton,
                  opacity: isScrolledToBottom ? 1 : 0.5,
                  cursor: isScrolledToBottom ? 'pointer' : 'not-allowed',
                }}
                onClick={handleAccept}
                disabled={!isScrolledToBottom}
                onMouseEnter={(e) => {
                  if (isScrolledToBottom) {
                    e.target.style.backgroundColor = '#059669';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isScrolledToBottom) {
                    e.target.style.backgroundColor = '#10b981';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                <CheckCircle size={16} />
                Accept & Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TermsOfServiceModal;
