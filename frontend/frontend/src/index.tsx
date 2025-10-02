import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { JWTSecretProvider } from './context/JWTSecretProvider';
import './styles/tron.css';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <JWTSecretProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </JWTSecretProvider>
  </React.StrictMode>
);
