import React, { createContext, useContext, useState, useEffect } from 'react';

const TOSContext = createContext(undefined);

export const useTOS = () => {
  const context = useContext(TOSContext);
  if (!context) {
    throw new Error('useTOS must be used within a TOSProvider');
  }
  return context;
};

export const TOSProvider = ({ children }) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const TOS_STORAGE_KEY = 'tosAccepted';

  const checkTOSStatus = () => {
    try {
      const accepted = localStorage.getItem(TOS_STORAGE_KEY);
      const tosAccepted = accepted === 'true';
      setIsAccepted(tosAccepted);
      setShowModal(!tosAccepted);
    } catch (error) {
      console.error('Error checking TOS status:', error);
      // If localStorage fails, show modal to be safe
      setShowModal(true);
      setIsAccepted(false);
    }
  };

  const acceptTerms = () => {
    try {
      localStorage.setItem(TOS_STORAGE_KEY, 'true');
      setIsAccepted(true);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving TOS acceptance:', error);
      // Still allow acceptance even if localStorage fails
      setIsAccepted(true);
      setShowModal(false);
    }
  };

  const declineTerms = () => {
    // Don't save anything, just keep showing the modal
    // The modal will show an error message
  };

  const resetTOSStatus = () => {
    try {
      localStorage.removeItem(TOS_STORAGE_KEY);
      setIsAccepted(false);
      setShowModal(true);
    } catch (error) {
      console.error('Error resetting TOS status:', error);
    }
  };

  useEffect(() => {
    checkTOSStatus();
  }, []);

  const value = {
    isAccepted,
    showModal,
    acceptTerms,
    declineTerms,
    checkTOSStatus,
    resetTOSStatus,
  };

  return (
    <TOSContext.Provider value={value}>
      {children}
    </TOSContext.Provider>
  );
};
