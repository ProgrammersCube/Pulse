# Pulse - Crypto Micro Prediction Game

A blockchain-based micro prediction platform that allows users to wager tokens on real-time Bitcoin price movements. Built with a mobile-first approach and featuring a futuristic Tron-inspired design.

## 🚀 Overview

Pulse is a crypto-based micro prediction game where users can predict Bitcoin price movements in real-time (5-60 seconds) and win tokens. The platform features P2P matchmaking, multi-token support, referral systems, and comprehensive admin controls.

**Live Demo:** [https://thepulse.bet](https://thepulse.bet)

## ✨ Key Features

### 🎮 Core Gameplay
- **Real-time Bitcoin Price Predictions** - Predict UP/DOWN movements with 5-60 second durations
- **Multi-token Support** - Bet with BeTyche, SOL, ETH, and RADBRO tokens
- **P2P Matchmaking** - Automated player matching with treasury-bot fallback
- **Live Price Feeds** - Real-time BTC price data from Pyth Network
- **Instant Results** - Fast game resolution with immediate payouts

### 💰 Token & Wallet Integration
- **Multi-wallet Support** - Solana, Ethereum wallet connections via Reown AppKit
- **SPL Token Support** - Native support for Solana Program Library tokens
- **Balance Tracking** - Real-time token balance monitoring
- **Non-custodial** - Users maintain control of their funds

### 🎯 User Experience
- **Mobile-first Design** - Optimized for mobile devices with responsive desktop support
- **Tron-inspired UI** - Futuristic neon-themed interface with glow effects
- **Real-time Updates** - Socket.io powered live updates
- **Smooth Animations** - Framer Motion powered transitions

### 👥 Social Features
- **Referral System** - Invite friends and earn rewards
- **Ambassador Program** - Advanced referral tracking and payouts
- **Bet History** - Comprehensive game history and statistics
- **Leaderboards** - Track performance and rankings

### 🛡️ Admin & Security
- **Admin Dashboard** - Comprehensive control panel
- **Treasury Management** - Automated fund management
- **Security Features** - JWT authentication, encrypted data
- **Analytics** - Detailed game and user analytics

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Framer Motion** - Smooth animations and transitions
- **Reown AppKit** - Multi-wallet integration
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API calls

### Backend Stack
- **Node.js + Express** - RESTful API server
- **TypeScript** - Type-safe backend development
- **MongoDB + Mongoose** - Database and ODM
- **Socket.io** - Real-time WebSocket communication
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing

### Blockchain Integration
- **Solana Web3.js** - Solana blockchain interaction
- **SPL Token Program** - Token operations
- **Pyth Network** - Real-time price feeds
- **Multi-chain Support** - Ethereum integration ready

### Infrastructure
- **MongoDB Atlas** - Cloud database
- **Netlify** - Frontend hosting
- **Render/AWS** - Backend deployment
- **Docker** - Containerization ready

## 📁 Project Structure

```
Pulse_Updated/
├── frontend/
│   └── frontend/
│       ├── src/
│       │   ├── components/          # React components
│       │   │   ├── Pulse.jsx        # Main game component
│       │   │   ├── PulseDashboard.jsx # User dashboard
│       │   │   ├── AdminDashboard.jsx # Admin panel
│       │   │   └── ...
│       │   ├── screens/             # Screen components
│       │   ├── services/            # API services
│       │   ├── context/             # React context
│       │   └── styles/              # Styling files
│       ├── public/                  # Static assets
│       └── package.json
├── backend/
│   └── backend/
│       ├── src/
│       │   ├── controllers/         # Route controllers
│       │   ├── models/              # Database models
│       │   ├── routes/              # API routes
│       │   ├── services/            # Business logic
│       │   ├── middleware/          # Express middleware
│       │   └── scripts/             # Utility scripts
│       ├── house-wallet.json        # House wallet config
│       └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Solana CLI tools (for development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Pulse_Updated.git
   cd Pulse_Updated
   ```

2. **Backend Setup**
   ```bash
   cd backend/backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Configure your environment variables
   ```

3. **Frontend Setup**
   ```bash
   cd frontend/frontend
   npm install
   
   # Create .env file
   echo "REACT_APP_API_URL=http://localhost:5000" > .env
   echo "REACT_APP_SOCKET_URL=http://localhost:5000" >> .env
   ```

4. **Environment Configuration**

   **Backend (.env)**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/pulse
   JWT_SECRET=your-super-secret-jwt-key-32-chars-min
   SHARED_SECRET_For_PRIVATE_KEY=your-shared-secret-32-chars-min
   FRONTEND_PRODUCTION_URL=https://thepulse.bet
   ```

   **Frontend (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend/backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend/frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 🎮 How to Play

1. **Connect Wallet** - Link your Solana or Ethereum wallet
2. **Fund Account** - Deposit tokens (BeTyche, SOL, ETH, RADBRO)
3. **Set Prediction** - Choose UP or DOWN for Bitcoin price
4. **Set Duration** - Select prediction timeframe (5-60 seconds)
5. **Place Bet** - Enter stake amount and confirm
6. **Wait for Match** - System finds opponent or matches with bot
7. **Watch Results** - Real-time price tracking and instant results
8. **Collect Winnings** - Automatic payout to your wallet

## 🔧 Development

### Available Scripts

**Backend**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run migrate:passwords  # Run password migration
```

**Frontend**
```bash
npm start           # Start development server
npm run build       # Build for production
npm run build:production  # Production build with API URLs
npm test           # Run tests
```

### Database Models

- **User** - User accounts, tokens, referrals
- **Game** - Game sessions and results
- **Bet** - Individual bet records
- **Admin** - Admin user management
- **Settings** - Platform configuration
- **Transaction** - Blockchain transactions
- **PayoutRequest** - Withdrawal requests

### API Endpoints

- `GET /health` - Health check
- `POST /api/wallet/*` - Wallet operations
- `POST /api/game/*` - Game management
- `POST /api/price/*` - Price data
- `POST /api/admin/*` - Admin functions

## 🚀 Deployment

### Production Build

**Backend**
```bash
cd backend/backend
npm run build
npm start
```

**Frontend**
```bash
cd frontend/frontend
npm run build:production
# Deploy dist/ folder to Netlify/Vercel
```

### Environment Variables

Ensure all production environment variables are set:
- `NODE_ENV=production`
- `MONGODB_URI` - Production MongoDB connection
- `JWT_SECRET` - Secure JWT secret (32+ chars)
- `FRONTEND_PRODUCTION_URL` - Your frontend domain
- `SHARED_SECRET_For_PRIVATE_KEY` - Encryption key

## 🔒 Security Features

- **JWT Authentication** - Secure user sessions
- **Password Hashing** - bcryptjs encryption
- **CORS Protection** - Configured for production
- **Helmet.js** - Security headers
- **Input Validation** - Request sanitization
- **Rate Limiting** - API protection
- **Environment Separation** - Dev/prod configs

## 📊 Monitoring & Analytics

- **Real-time Metrics** - Live game statistics
- **User Analytics** - Player behavior tracking
- **Financial Reports** - Revenue and payout tracking
- **System Health** - Performance monitoring
- **Error Logging** - Comprehensive error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 👨‍💻 Developer

**Muhammad Usama Muavia**
- Project: Pulse Crypto Micro Prediction Game
- Timeline: 21 days development + 2-3 weeks monitoring
- Technologies: React, Node.js, Solana, MongoDB

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: [Your contact information]
- Documentation: [Link to docs if available]

---

**Built with ❤️ for the crypto gaming community**