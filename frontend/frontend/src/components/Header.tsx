import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAppContext } from '../context/AppContext';

const Header: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { user, btcPrice } = useAppContext();
  
  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/">
          <h1 className="neon-text pulse-animation">PULSE</h1>
        </Link>
      </div>
      
      <div className="btc-price-container">
        {btcPrice ? (
          <div className="price-display">
            <span>BTC:</span>
            <span className="price-text btc-price">
              ${btcPrice.price.toLocaleString(undefined, { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        ) : (
          <div className="loading-price">Loading price...</div>
        )}
      </div>
      
      <div className="wallet-container">
        {connected && publicKey ? (
          <div className="connected-wallet">
            <Link to="/wallet" className="wallet-link">
              <div className="wallet-display">
                <span className="wallet-label">Wallet:</span>
                <span className="wallet-address">{publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}</span>
              </div>
            </Link>
            
            {user && user.tokens && (
              <div className="token-balances">
                <div className="token-balance">
                  <span className="token-icon">B</span>
                  <span className="token-amount">{user.tokens.BeTyche.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <WalletMultiButton className="neon-button" />
        )}
      </div>
    </header>
  );
};

export default Header;
