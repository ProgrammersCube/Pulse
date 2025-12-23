// src/services/solanaTransactions.js
import { 
    Connection, 
    Transaction, 
    SystemProgram, 
    LAMPORTS_PER_SOL,
    PublicKey 
  } from '@solana/web3.js';
  import { 
    getAssociatedTokenAddress, 
    createTransferInstruction, 
    TOKEN_PROGRAM_ID 
  } from '@solana/spl-token';
  
  // Environment-based configuration
  const getNetworkConfig = () => {
    // Default to testnet where you have funds (1.00 SOL vs 0.016 SOL on mainnet)
    const isTestnet = process.env.REACT_APP_SOLANA_NETWORK !== 'mainnet'; // Use testnet unless explicitly set to mainnet
    
    if (isTestnet) {
      return {
        network: 'testnet',
        rpcUrl: process.env.REACT_APP_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        heliusRpcUrl: process.env.REACT_APP_HELIUS_API_KEY 
          ? `https://testnet.helius-rpc.com/?api-key=${process.env.REACT_APP_HELIUS_API_KEY}`
          : 'https://api.devnet.solana.com', // Fallback to public testnet RPC
        tokenMints: {
          // Testnet token addresses (you'll need to deploy these or use existing testnet tokens)
          BeTyche: '11111111111111111111111111111111', // Placeholder
          RADBRO: '11111111111111111111111111111111', // Placeholder
          // USDC testnet mint – override via REACT_APP_SOLANA_USDC_TESTNET_MINT if needed
          USDC: process.env.REACT_APP_SOLANA_USDC_TESTNET_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
        }
      };
    } else {
      return {
        network: 'mainnet-beta',
        rpcUrl: process.env.REACT_APP_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        heliusRpcUrl: `https://mainnet.helius-rpc.com/?api-key=${process.env.REACT_APP_HELIUS_API_KEY || '92d6abbc-1969-4f81-8a8d-4633756797f4'}`,
        tokenMints: {
          BeTyche: 'EydjnYHVeCQGihcvA22vBDCxn5HzBrXoQpP98kL9Koyp',
          RADBRO: '287XY2FcGAE5ty4PZVjg22eqx37sEmzP8jPK3GxFofqB',
          // Solana USDC mainnet SPL mint – override via REACT_APP_SOLANA_USDC_MAINNET_MINT if needed
          USDC: process.env.REACT_APP_SOLANA_USDC_MAINNET_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
        }
      };
    }
  };
  
  // ADD YOUR KEYS HERE ⬇️⬇️⬇️
  const HELIUS_API_KEY = process.env.REACT_APP_HELIUS_API_KEY || '92d6abbc-1969-4f81-8a8d-4633756797f4'; // Your Helius API key
  const API_URL = process.env.REACT_APP_API_URL;
  
  // Get current network configuration
  const networkConfig = getNetworkConfig();
  
  // Test the connection
  console.log(`🚀 Using ${networkConfig.network} RPC`);

  // Function to get current active house wallet address
  const getCurrentHouseWalletAddress = async () => {
    try {
      console.log('🔍 Fetching current active house wallet address...');
      const response = await fetch(`${API_URL}api/admin/active-wallet-public-key`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch house wallet: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get house wallet address');
      }
      
      console.log('✅ Active house wallet:', data.data.publicKey);
      console.log('📋 Wallet type:', data.data.walletType);
      
      return data.data.publicKey;
    } catch (error) {
      console.error('❌ Error fetching house wallet address:', error);
      throw new Error(`Failed to get house wallet address: ${error.message}`);
    }
  };
  
  export const createTransferToHouseTransaction = async (userAddress, amount, token) => {
    try {
      console.log('🔐 Creating transfer transaction...');
      
      const networkConfig = getNetworkConfig();
      const rpcUrl = networkConfig.heliusRpcUrl;
      const connection = new Connection(rpcUrl, 'confirmed');
      
      // Test the connection
      const version = await connection.getVersion();
      console.log(`✅ Connected to ${networkConfig.network}! Solana version:`, version);
      
      // Get current active house wallet address
      const houseWalletAddress = await getCurrentHouseWalletAddress();
      
      const userPublicKey = new PublicKey(userAddress);
      const housePublicKey = new PublicKey(houseWalletAddress);
      
      console.log('💸 Creating transfer transaction:');
      console.log('  From:', userAddress);
      console.log('  To:', houseWalletAddress);
      console.log('  Amount:', amount, token);
      console.log('  Network:', networkConfig.network);
      
      // Debug: Check which network we're actually connecting to
      console.log('🌐 Network Configuration:');
      console.log('  - Detected Network:', networkConfig.network);
      console.log('  - RPC URL:', networkConfig.rpcUrl);
      console.log('  - Using RPC:', networkConfig.heliusRpcUrl);
      console.log('  - Environment:', process.env.NODE_ENV);
      console.log('  - REACT_APP_SOLANA_NETWORK:', process.env.REACT_APP_SOLANA_NETWORK);
      
      const transaction = new Transaction();
      
      // Add a unique nonce to prevent duplicate transaction errors
      const uniqueNonce = Math.random().toString(36).substring(2, 15);
      console.log('🔑 Unique transaction nonce:', uniqueNonce);
      
      if (token === 'SOL') {
        const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
        console.log('  Lamports to transfer:', lamports);
        
        // Check user's actual SOL balance from current RPC
        const userBalance = await connection.getBalance(userPublicKey);
        console.log('  User SOL balance (lamports):', userBalance);
        console.log('  User SOL balance (SOL):', (userBalance / LAMPORTS_PER_SOL).toFixed(6));
        
        // IMPORTANT: Compare with mainnet to check for network mismatch
        // try {
        //   const mainnetConnection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        //   const mainnetBalance = await mainnetConnection.getBalance(userPublicKey);
        //   console.log('  📊 MAINNET balance check:', (mainnetBalance / LAMPORTS_PER_SOL).toFixed(6), 'SOL');
          
        //   if (Math.abs(mainnetBalance - userBalance) > 1000) { // significant difference
        //     console.warn('⚠️  NETWORK MISMATCH DETECTED!');
        //     console.warn(`    Current RPC: ${(userBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
        //     console.warn(`    Mainnet RPC: ${(mainnetBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
        //     console.warn('    Your wallet might be on a different network than the app!');
        //   }
        // } catch (e) {
        //   console.log('  Could not check mainnet balance for comparison');
        // }
        
        // Estimate transaction fee (usually ~5000 lamports)
        const estimatedFee = 5000;
        const totalNeeded = lamports + estimatedFee;
        
        console.log('  Transfer amount:', (lamports / LAMPORTS_PER_SOL).toFixed(6), 'SOL');
        console.log('  Estimated fee:', (estimatedFee / LAMPORTS_PER_SOL).toFixed(6), 'SOL');
        console.log('  Total needed:', (totalNeeded / LAMPORTS_PER_SOL).toFixed(6), 'SOL');
        
        if (userBalance < totalNeeded) {
          const shortfall = totalNeeded - userBalance;
          throw new Error(
            `Insufficient SOL balance. ` +
            `Need ${(totalNeeded / LAMPORTS_PER_SOL).toFixed(6)} SOL ` +
            `(${(lamports / LAMPORTS_PER_SOL).toFixed(6)} transfer + ${(estimatedFee / LAMPORTS_PER_SOL).toFixed(6)} fee) ` +
            `but only have ${(userBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL. ` +
            `Need ${(shortfall / LAMPORTS_PER_SOL).toFixed(6)} more SOL.`
          );
        }
        
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: userPublicKey,
            toPubkey: housePublicKey,
            lamports: lamports
          })
        );
      } else {
        console.log('Token:', token);
        const mintAddress = new PublicKey(networkConfig.tokenMints[token]);
        // Per-token decimals (default 9 for SPL, 6 for USDC)
        const tokenDecimalsMap = {
          BeTyche: 9,
          RADBRO: 9,
          USDC: 6
        };
        const decimals = tokenDecimalsMap[token] ?? 9;
        const tokenAmount = Math.floor(amount * Math.pow(10, decimals));
        console.log('  Token Amount:', tokenAmount);
        console.log('  Mint Address:', mintAddress.toString());
        
        const userTokenAccount = await getAssociatedTokenAddress(
          mintAddress,
          userPublicKey
        );
        
        const houseTokenAccount = await getAssociatedTokenAddress(
          mintAddress,
          housePublicKey
        );
        
        console.log('  User Token Account:', userTokenAccount.toString());
        console.log('  House Token Account:', houseTokenAccount.toString());
        
        transaction.add(
          createTransferInstruction(
            userTokenAccount,
            houseTokenAccount,
            userPublicKey,
            tokenAmount,
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }
      
      // Get a fresh blockhash for each transaction to prevent duplicates
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      console.log('📦 Got fresh blockhash:', blockhash);
      
      // Add additional uniqueness by combining blockhash with timestamp and random value
      const enhancedBlockhash = `${blockhash}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log('🔐 Enhanced blockhash for uniqueness:', enhancedBlockhash);
      
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;
      
      // Add a longer delay to ensure blockhash uniqueness and prevent rapid duplicate submissions
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify the blockhash is still recent before returning
      const currentBlockhash = await connection.getLatestBlockhash();
      if (currentBlockhash.blockhash !== blockhash) {
        console.log('⚠️ Blockhash changed during creation, getting fresh one...');
        transaction.recentBlockhash = currentBlockhash.blockhash;
      }
      
      return { transaction, connection, uniqueNonce };
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      throw error;
    }
  };
  
  // Test function to verify connection
  export const testConnection = async () => {
    try {
      console.log(`🧪 Testing ${networkConfig.network} connection...`);
      const connection = new Connection(
        networkConfig.heliusRpcUrl,
        'confirmed'
      );
      
      const slot = await connection.getSlot();
      const blockHeight = await connection.getBlockHeight();
      const version = await connection.getVersion();
      
      console.log(`✅ ${networkConfig.network} connection test successful!`);
      console.log('  Current slot:', slot);
      console.log('  Block height:', blockHeight);
      console.log('  Solana version:', version);
      console.log('  Network:', networkConfig.network);
      
      return true;
    } catch (error) {
      console.error(`❌ ${networkConfig.network} connection test failed:`, error);
      return false;
    }
  };