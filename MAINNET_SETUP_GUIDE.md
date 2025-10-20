# 🚀 Pulse Mainnet Migration Guide

## Phase 1: Environment Variables Setup ✅

### Backend Environment Variables

1. **Copy the example file:**
   ```bash
   cd backend/backend
   cp env.mainnet.example .env
   ```

2. **Update critical variables:**
   ```bash
   # Network Configuration
   NODE_ENV=production
   SOLANA_NETWORK=mainnet-beta
   SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
   
   # Wallet Configuration (CRITICAL - Create new mainnet wallet)
   HOUSE_WALLET_ADDRESS=YOUR_MAINNET_HOUSE_WALLET_PUBLIC_KEY
   HOUSE_WALLET_PRIVATE_KEY=[YOUR,MAINNET,PRIVATE,KEY,ARRAY]
   
   # Security
   JWT_SECRET=your-super-secure-32-character-jwt-secret-key-here
   SHARED_SECRET_For_PRIVATE_KEY=your-super-secure-32-character-shared-secret-here
   
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pulse-mainnet
   
   # CORS
   FRONTEND_PRODUCTION_URL=https://thepulse.bet
   ```

### Frontend Environment Variables

1. **Copy the example file:**
   ```bash
   cd frontend/frontend
   cp env.mainnet.example .env
   ```

2. **Update critical variables:**
   ```bash
   # Network Configuration
   REACT_APP_SOLANA_NETWORK=mainnet
   REACT_APP_API_URL=https://api.thepulse.bet
   REACT_APP_SOCKET_URL=https://api.thepulse.bet
   REACT_APP_FRONTEND_URL=https://thepulse.bet
   
   # RPC Configuration
   REACT_APP_HELIUS_API_KEY=your-helius-api-key-here
   REACT_APP_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
   ```

## Phase 2: Wallet Setup (CRITICAL)

### 1. Create New Mainnet House Wallet

```bash
# Generate new mainnet wallet (NEVER use testnet wallet on mainnet)
solana-keygen new --outfile mainnet-house-wallet.json

# Get the public key
solana-keygen pubkey mainnet-house-wallet.json
```

### 2. Fund the Mainnet House Wallet

**Required amounts:**
- **SOL**: Minimum 10-20 SOL for transaction fees and payouts
- **BeTyche**: Sufficient amount for game payouts (depends on your expected volume)
- **RADBRO**: Sufficient amount for game payouts (depends on your expected volume)

### 3. Update Environment Variables

```bash
# Update your .env file with the new wallet details
HOUSE_WALLET_ADDRESS=YOUR_NEW_MAINNET_PUBLIC_KEY
HOUSE_WALLET_PRIVATE_KEY=[your,private,key,array]
```

## Phase 3: RPC Endpoint Setup

### 1. Get Premium RPC Endpoint

**Recommended providers:**
- **Helius**: https://helius.dev (Recommended)
- **QuickNode**: https://quicknode.com
- **Alchemy**: https://alchemy.com

### 2. Update RPC URLs

```bash
# Backend
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Frontend
REACT_APP_HELIUS_API_KEY=YOUR_KEY
REACT_APP_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

## Phase 4: Code Verification ✅

### Token Addresses (Already Correct)
```javascript
// Backend - blockchain.service.ts
tokenMints: {
  BeTyche: new PublicKey('EydjnYHVeCQGihcvA22vBDCxn5HzBrXoQpP98kL9Koyp'),
  RADBRO: new PublicKey('287XY2FcGAE5ty4PZVjg22eqx37sEmzP8jPK3GxFofqB'),
}

// Frontend - Solana.js
tokenMints: {
  BeTyche: 'EydjnYHVeCQGihcvA22vBDCxn5HzBrXoQpP98kL9Koyp',
  RADBRO: '287XY2FcGAE5ty4PZVjg22eqx37sEmzP8jPK3GxFofqB'
}
```

### Token Arrays (Already Fixed ✅)
```javascript
// All token arrays now support all three tokens
const tokens = ['BeTyche', 'SOL', 'RADBRO'];
```

## Phase 5: Testing

### 1. Test Mainnet Connection

```bash
# Test backend connection
cd backend/backend
node debug-mainnet.js
```

### 2. Test Frontend Connection

```bash
# Start frontend in development mode
cd frontend/frontend
npm start
```

## Phase 6: Deployment

### Backend Deployment

```bash
# Build and deploy backend
cd backend/backend
npm run build
# Deploy to your hosting platform (Railway/Render/AWS)
```

### Frontend Deployment

```bash
# Build frontend with production environment
cd frontend/frontend
npm run build:production
# Deploy to Netlify/Vercel
```

## 🚨 Critical Warnings

1. **NEVER use testnet wallet on mainnet**
2. **Test with small amounts first**
3. **Have a rollback plan ready**
4. **Monitor transactions closely**
5. **Keep testnet environment for testing**

## 📋 Pre-Launch Checklist

- [ ] Environment variables configured
- [ ] Mainnet wallet created and funded
- [ ] Premium RPC endpoint configured
- [ ] All token arrays fixed ✅
- [ ] Backend deployed with mainnet config
- [ ] Frontend deployed with mainnet config
- [ ] All functionality tested with small amounts
- [ ] Monitoring and logging set up
- [ ] Rollback plan prepared

## 🎯 Next Steps

1. **Complete Phase 1** - Update environment variables
2. **Create mainnet wallet** - Most critical step
3. **Test on devnet first** - Don't go straight to mainnet
4. **Deploy and test** - Start with small amounts
5. **Monitor closely** - Watch for any issues

## 📞 Support

If you encounter any issues during the migration, check:
1. Environment variables are correctly set
2. Mainnet wallet is properly funded
3. RPC endpoint is working
4. All token addresses are correct
5. Token arrays support all three tokens
