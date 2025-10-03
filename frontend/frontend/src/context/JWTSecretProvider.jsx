import React, { createContext, useContext, useState, useEffect } from 'react';

const JWTSecretContext = createContext();

// Error component for when JWT_SECRET is missing
const JWTSecurityErrorScreen = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        padding: '2rem',
        backgroundColor: '#2a2a2a',
        borderRadius: '10px',
        border: '2px solid #ff4444',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h1 style={{ 
          color: '#ff4444', 
          marginBottom: '1rem',
          fontSize: '2rem'
        }}>
          Security Configuration Error
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '1.5rem',
          lineHeight: '1.5'
        }}>
          The backend server is missing required security configuration.
        </p>
        <div style={{
          backgroundColor: '#333',
          padding: '1rem',
          borderRadius: '5px',
          marginBottom: '1.5rem',
          fontFamily: 'monospace',
          fontSize: '0.9rem'
        }}>
          Missing: JWT_SECRET environment variable
        </div>
        <p style={{ fontSize: '1rem', color: '#aaa' }}>
          Please contact your system administrator to configure the server properly.
          The application cannot run without this essential security setting.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};

// Loading component
const JWTLoadingScreen = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <h2>Checking Security Configuration...</h2>
        <p>Verifying server configuration</p>
      </div>
    </div>
  );
};

export const JWTSecretProvider = ({ children }) => {
  const [jwtValid, setJwtValid] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);

  const checkJWTSecret = async () => {
    try {
      setChecking(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}api/admin/health/jwt-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setJwtValid(true);
        } else {
          setError(data.message || 'JWT_SECRET validation failed');
        }
      } else {
        const errorData = await response.json();
        setError(errorData?.message || 'JWT_SECRET validation failed');
      }
    } catch (err) {
        setError(err?.message || 'JWT_SECRET validation failed');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkJWTSecret();
  }, []);

  // Show loading screen while checking
  if (checking) {
    return <JWTLoadingScreen />;
  }

  // Show error screen if JWT_SECRET is invalid/missing
  if (!jwtValid || error) {
    return <JWTSecurityErrorScreen />;
  }

  // All checks passed, render the app
  return (
    <JWTSecretContext.Provider value={{ jwtValid, checkJWTSecret }}>
      {children}
    </JWTSecretContext.Provider>
  );
};

export const useJWTSecret = () => {
  const context = useContext(JWTSecretContext);
  if (!context) {
    throw new Error('useJWTSecret must be used within a JWTSecretProvider');
  }
  return context;
};
