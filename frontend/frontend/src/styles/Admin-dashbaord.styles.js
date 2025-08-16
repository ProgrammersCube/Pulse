export const styles={
    container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #16001e 100%)',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
      minHeight: '100vh'
    }
  },
  backgroundEffects: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none'
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.3,
    animation: 'float 20s infinite ease-in-out'
  },
  header: {
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '@media (max-width: 768px)': {
      padding: '0.75rem 1rem',
      flexDirection: 'column',
      gap: '1rem'
    }
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  logoText: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '2px',
    textShadow: '0 0 30px rgba(168, 85, 247, 0.5)'
  },
  neonButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    border: '2px solid',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  },
  logoutButton: {
    borderColor: '#ef4444',
    color: '#ef4444',
    background: 'rgba(239, 68, 68, 0.1)'
  },
  tabContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(168, 85, 247, 0.3) transparent',
    '@media (max-width: 768px)': {
      gap: '0.25rem',
      marginBottom: '1.5rem',
      paddingBottom: '0.25rem'
    }
  },
  tab: {
    padding: '0.875rem 1.75rem',
    borderRadius: '16px',
    border: '2px solid',
    background: 'rgba(255, 255, 255, 0.02)',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(10px)',
    '@media (max-width: 768px)': {
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      gap: '0.25rem'
    }
  },
  activeTab: {
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
    borderColor: '#a855f7',
    color: '#a855f7',
    boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.1)'
  },
  inactiveTab: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.6)'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    overflow: 'hidden'
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), transparent)',
    animation: 'shimmer 3s infinite'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '1rem'
    }
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '1.75rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  iconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    position: 'relative'
  },
  input: {
    width: '100%',
    padding: '0.875rem 1.25rem',
    borderRadius: '12px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.03)',
    color: 'white',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  inputFocus: {
    borderColor: '#a855f7',
    background: 'rgba(168, 85, 247, 0.05)',
    boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)'
  },
  toggle: {
    width: '56px',
    height: '28px',
    borderRadius: '14px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  toggleThumb: {
    position: 'absolute',
    top: '2px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'white',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
  },
  alert: {
    position: 'fixed',
    top: '100px',
    right: '24px',
    padding: '1rem 1.5rem',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    zIndex: 100,
    minWidth: '300px'
  },
  loginCard: {
    maxWidth: '480px',
    width: '100%',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    borderRadius: '32px',
    padding: '3rem',
    border: '2px solid rgba(168, 85, 247, 0.3)',
    boxShadow: '0 20px 60px rgba(168, 85, 247, 0.3)',
    position: 'relative',
    overflow: 'hidden'
  },
  shimmerAnimation: `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `,
  floatAnimation: `
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-20px) rotate(1deg); }
      75% { transform: translateY(20px) rotate(-1deg); }
    }
  `,
  pulseAnimation: `
    @keyframes pulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.05); }
    }
  `,
  glowAnimation: `
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
      50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); }
    }
  `,
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
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    width: '100%'
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
  
  statLoading: {
    height: '60px',
    display: 'flex',
    alignItems: 'center'
  },
  
  loadingBar: {
    height: '12px',
    width: '100%',
    background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.4), rgba(168, 85, 247, 0.2))',
    backgroundSize: '200%',
    borderRadius: '6px',
    animation: 'loading 1.5s infinite'
  },
  
  statChange: (isPositive, isNegativeGood) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.75rem',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: isPositive 
      ? (isNegativeGood ? '#ef4444' : '#10b981') 
      : (isNegativeGood ? '#10b981' : '#ef4444')
  }),
  
  glowOrbPurple: {
    position: 'fixed',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
    top: '-200px',
    left: '-200px',
    zIndex: 1
  },
  
  glowOrbPink: {
    position: 'fixed',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
    bottom: '-300px',
    right: '-300px',
    zIndex: 1
  },
  panel: {
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '20px',
    padding: '1.5rem',
    marginTop: '2rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  
  panelTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  },
  
  filterContainer: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  
  filterLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    paddingLeft: '0.5rem'
  },
  
  filterSelect: {
    background: 'rgba(39, 23, 65, 0.6)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '12px',
    padding: '0.6rem 1rem',
    color: 'white',
    minWidth: '140px',
    outline: 'none',
    cursor: 'pointer'
  },
  
  filterActions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end'
  },
  
  filterButton: {
    background: 'rgba(168, 85, 247, 0.15)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '12px',
    padding: '0.6rem 1.2rem',
    color: '#e9d5ff',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    height: 'fit-content'
  },
  
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(15, 10, 25, 0.7)'
  },
  
  playersTable: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    minWidth: '1000px'
  },
  
  tableHeader: {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    background: 'rgba(39, 23, 65, 0.5)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    
    '&:hover': {
      background: 'rgba(168, 85, 247, 0.2)'
    },
    
    '&:first-child': {
      borderTopLeftRadius: '16px'
    },
    
    '&:last-child': {
      borderTopRightRadius: '16px'
    }
  },
  
  headerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  
  tableRow: {
    background: 'rgba(23, 15, 35, 0.5)',
    
    '&:hover': {
      background: 'rgba(168, 85, 247, 0.1)'
    }
  },
  
  tableRowAlt: {
    background: 'rgba(30, 20, 45, 0.5)',
    
    '&:hover': {
      background: 'rgba(168, 85, 247, 0.1)'
    }
  },
  
  tableCell: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.8)'
  },
  
  playerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  
  playerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    color: 'white'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '3rem',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '3rem',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  commissionPanel: {
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '20px',
    padding: '1.5rem',
    marginTop: '2rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  
  commissionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  
  commissionControls: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap'
  },
  
  toggleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  
  toggleLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500'
  },
  
  toggleContainer: {
    display: 'flex',
    background: 'rgba(39, 23, 65, 0.6)',
    borderRadius: '12px',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    overflow: 'hidden'
  },
  
  toggleButton: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  
  toggleActive: {
    background: 'rgba(168, 85, 247, 0.3)',
    color: 'white'
  },
  
  previewSection: {
    background: 'rgba(30, 20, 50, 0.6)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
    border: '1px solid rgba(168, 85, 247, 0.3)'
  },
  
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  
  previewTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    color: '#e9d5ff'
  },
  
  previewNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(101, 52, 255, 0.15)',
    color: '#c4b5fd',
    borderRadius: '999px',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem'
  },
  
  previewStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem'
  },
  
  previewStat: {
    background: 'rgba(39, 23, 65, 0.4)',
    borderRadius: '16px',
    padding: '1.25rem',
    textAlign: 'center',
    border: '1px solid rgba(168, 85, 247, 0.2)'
  },
  
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    marginBottom: '0.5rem'
  },
  
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: 'white'
  },
  
  statDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.85rem'
  },
  
  tokenList: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    margin: '0.5rem 0'
  },
  
  tokenBadge: {
    background: 'rgba(168, 85, 247, 0.2)',
    color: '#d8b4fe',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  
  tokenBadgeSmall: {
    background: 'rgba(168, 85, 247, 0.2)',
    color: '#d8b4fe',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    fontSize: '0.75rem'
  },
  
  commissionLogic: {
    background: 'rgba(15, 10, 30, 0.6)',
    borderRadius: '16px',
    padding: '1.25rem',
    marginTop: '1rem',
    border: '1px solid rgba(101, 52, 255, 0.3)'
  },
  
  logicTitle: {
    fontWeight: '600',
    color: '#d8b4fe',
    marginBottom: '1rem',
    fontSize: '1.1rem'
  },
  
  logicStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    color: 'rgba(255, 255, 255, 0.8)'
  },
  
  logicNumber: {
    background: 'rgba(168, 85, 247, 0.3)',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600'
  },
  
  logicExampleBox: {
    background: 'rgba(30, 20, 50, 0.6)',
    borderRadius: '12px',
    padding: '1rem',
    marginTop: '1rem',
    border: '1px solid rgba(168, 85, 247, 0.2)'
  },
  
  logicWin: {
    color: '#10b981',
    fontWeight: '500'
  },
  
  logicLoss: {
    color: '#ef4444',
    fontWeight: '500'
  },
  
  logicPayout: {
    color: '#d8b4fe',
    fontWeight: '600'
  },
  
  commissionTableContainer: {
    background: 'rgba(30, 20, 50, 0.6)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(168, 85, 247, 0.3)'
  },
  
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  
  tableTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: 0,
    color: '#e9d5ff'
  },
  
  adminNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#fecaca',
    borderRadius: '999px',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem'
  },
  
  commissionsTable: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0
  },
  
  commissionHeaderCell: {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    background: 'rgba(39, 23, 65, 0.5)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  
  commissionCell: {
    padding: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.8)'
  },
  
  statusPaid: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  
  statusPending: {
    background: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.3)'
  },
  
  previewLoading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '2rem',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  funnelPanel: {
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '20px',
    padding: '1.5rem',
    marginTop: '2rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  
  funnelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  
  timeFilters: {
    display: 'flex',
    gap: '0.75rem',
    background: 'rgba(39, 23, 65, 0.6)',
    borderRadius: '12px',
    padding: '0.25rem',
    border: '1px solid rgba(168, 85, 247, 0.3)'
  },
  
  timeFilterButton: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    fontSize: '0.9rem'
  },
  
  activeTimeFilter: {
    background: 'rgba(168, 85, 247, 0.3)',
    color: 'white',
    boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)'
  },
  
  funnelContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  
  funnelVisualization: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    padding: '1rem'
  },
  
  funnelStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '160px'
  },
  
  funnelStepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  
  stepIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(168, 85, 247, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d8b4fe'
  },
  
  stepTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    margin: 0,
    color: 'white'
  },
  
  funnelBar: (widthPercent) => ({
    width: `${widthPercent}%`,
    maxWidth: '300px',
    background: 'linear-gradient(90deg, #7e22ce, #a855f7)',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 5px 15px rgba(168, 85, 247, 0.4)',
    position: 'relative',
    overflow: 'hidden',
    
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #ec4899, #f97316)',
      animation: 'progress 1.5s infinite'
    }
  }),
  
  funnelValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'white',
    textAlign: 'center'
  },
  
  funnelArrow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#a855f7'
  },
  
  conversionRate: {
    background: 'rgba(168, 85, 247, 0.2)',
    color: '#e9d5ff',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginTop: '0.5rem'
  },
  
  funnelStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  
  funnelStatCard: {
    background: 'rgba(39, 23, 65, 0.5)',
    borderRadius: '16px',
    padding: '1.25rem',
    textAlign: 'center',
    border: '1px solid rgba(168, 85, 247, 0.2)'
  },
  
  statNumber: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1rem',
    marginBottom: '0.25rem'
  },
  
  statChange: {
    color: '#a78bfa',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  
  funnelLoading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '3rem',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  
  // Animation keyframes
  '@keyframes progress': {
    '0%': { width: '0%' },
    '50%': { width: '100%' },
    '100%': { width: '0%', left: '100%' }
  },
  sharePanel: {
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '20px',
    padding: '2rem',
    marginTop: '2rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  
  shareDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1.05rem',
    maxWidth: '800px',
    marginBottom: '2rem',
    lineHeight: 1.6
  },
  
  referralShareContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  
  referralShareCard: {
    background: 'rgba(30, 20, 50, 0.6)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(168, 85, 247, 0.3)'
  },
  
  shareCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  
  shareCardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d8b4fe'
  },
  
  shareCardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: 0,
    color: 'white'
  },
  
  referralInputGroup: {
    display: 'flex',
    gap: '0.75rem'
  },
  
  referralInput: {
    flex: 1,
    background: 'rgba(39, 23, 65, 0.6)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '12px',
    padding: '0.875rem 1.25rem',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none'
  },
  
  referralCodeDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(39, 23, 65, 0.6)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '12px',
    padding: '0.875rem 1.25rem',
  },
  
  referralCodeText: {
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '1px',
    color: '#d8b4fe'
  },
  
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(168, 85, 247, 0.15)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '12px',
    padding: '0.6rem 1.2rem',
    color: '#e9d5ff',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '120px',
    justifyContent: 'center'
  },
  
  copiedButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981'
  },
  
  shareButtonsContainer: {
    marginBottom: '2rem'
  },
  
  shareSectionTitle: {
    fontSize: '1.35rem',
    fontWeight: '600',
    margin: '0 0 1.5rem 0',
    color: '#e9d5ff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  
  shareButtonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem'
  },
  
  shareButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1.25rem 0.5rem',
    borderRadius: '16px',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  
  shareButtonIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  shareButtonText: {
    fontWeight: '500',
    fontSize: '0.95rem'
  },
  
  qrSection: {
    background: 'rgba(30, 20, 50, 0.6)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(168, 85, 247, 0.3)'
  },
  
  qrContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  
  qrCodePlaceholder: {
    position: 'relative',
    width: '160px',
    height: '160px',
    background: 'white',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  
  qrCodePattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 
      `linear-gradient(45deg, #eee 25%, transparent 25%), 
       linear-gradient(-45deg, #eee 25%, transparent 25%),
       linear-gradient(45deg, transparent 75%, #eee 75%),
       linear-gradient(-45deg, transparent 75%, #eee 75%)`,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
  },
  
  qrCodeLogo: {
    position: 'relative',
    zIndex: 2,
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  
  qrText: {
    flex: 1,
    minWidth: '200px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1.05rem',
    lineHeight: 1.6
  },
  calculatorPanel: {
    background: 'rgba(23, 15, 35, 0.8)',
    borderRadius: '20px',
    padding: '2rem',
    marginTop: '2rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  
  calculatorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem'
  },
  
  calculatorIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(101, 52, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#a78bfa'
  },
  
  calculatorDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1.05rem',
    maxWidth: '600px',
    marginBottom: '2rem',
    lineHeight: 1.6
  },
  
  calculatorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  
  calculatorCard: {
    background: 'rgba(30, 20, 50, 0.6)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(168, 85, 247, 0.3)'
  },
  
  inputHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  
  inputIconRed: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(239, 68, 68, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f87171'
  },
  
  inputIconGreen: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(16, 185, 129, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#34d399'
  },
  
  inputIconPurple: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(168, 85, 247, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d8b4fe'
  },
  
  inputTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    margin: 0,
    color: 'white'
  },
  
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem'
  },
  
  stepperButton: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(39, 23, 65, 0.6)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    color: '#e9d5ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    
    '&:hover': {
      background: 'rgba(168, 85, 247, 0.3)'
    }
  },
  
  currencyInputContainer: {
    flex: 1,
    position: 'relative'
  },
  
  currencySymbol: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    pointerEvents: 'none'
  },
  
  currencyInput: {
    width: '100%',
    background: 'rgba(39, 23, 65, 0.6)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '12px',
    padding: '0.875rem 1.25rem 0.875rem 2.5rem',
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: '600',
    outline: 'none',
    
    '&:focus': {
      borderColor: '#a855f7',
      boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.3)'
    }
  },
  
  inputHelpText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem',
    paddingLeft: '0.25rem'
  },
  
  rateSliderContainer: {
    marginBottom: '1rem'
  },
  
  rateSlider: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    background: 'linear-gradient(90deg, #7e22ce, #a855f7)',
    outline: 'none',
    
    '&::-webkit-slider-thumb': {
      appearance: 'none',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: '#d8b4fe',
      border: '2px solid #a855f7',
      cursor: 'pointer',
      boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
    }
  },
  
  rateValue: {
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
    marginTop: '0.5rem',
    color: '#d8b4fe'
  },
  
  rateNote: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem',
    textAlign: 'center'
  },
  
  calculationVisualization: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
    background: 'rgba(30, 20, 50, 0.6)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    marginBottom: '1.5rem'
  },
  
  calculationStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  
  stepLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    marginBottom: '0.5rem'
  },
  
  stepValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'white'
  },
  
  stepValueRed: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ef4444'
  },
  
  stepValueGreen: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#10b981'
  },
  
  calculationOperator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#a855f7'
  },
  
  operatorText: {
    marginTop: '0.5rem',
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  
  commissionResult: {
    gridColumn: '1 / -1',
    background: 'linear-gradient(135deg, #7e22ce, #a855f7)',
    borderRadius: '16px',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 5px 20px rgba(168, 85, 247, 0.4)'
  },
  
  resultLabel: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '0.5rem'
  },
  
  resultValue: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '1rem',
    color: 'white',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
  },
  
  resultNote: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#e9d5ff'
  },
  
  formulaCard: {
    background: 'rgba(30, 20, 50, 0.6)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(168, 85, 247, 0.3)'
  },
  
  formulaHeader: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#d8b4fe',
    marginBottom: '1rem'
  },
  
  formulaText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    fontSize: '1.25rem',
    marginBottom: '1rem'
  },
  
  formulaPart: {
    background: 'rgba(168, 85, 247, 0.2)',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    border: '1px solid rgba(168, 85, 247, 0.3)'
  },
  
  formulaOperator: {
    fontWeight: '700',
    color: '#d8b4fe'
  },
  
  formulaResult: {
    fontWeight: '700',
    color: '#d8b4fe'
  },
  
  formulaExample: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic'
  },
  
}