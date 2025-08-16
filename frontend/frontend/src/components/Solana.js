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
  
  const TOKEN_MINTS = {
    BeTyche: 'EydjnYHVeCQGihcvA22vBDCxn5HzBrXoQpP98kL9Koyp',
    RADBRO: '287XY2FcGAE5ty4PZVjg22eqx37sEmzP8jPK3GxFofqB'
  };
  
  // ADD YOUR KEYS HERE ⬇️⬇️⬇️
  const HOUSE_WALLET_ADDRESS = process.env.REACT_APP_HOUSE_WALLET_ADDRESS; // Your house wallet
  const HELIUS_API_KEY = '92d6abbc-1969-4f81-8a8d-4633756797f4'; // Your Helius API key
  
  // Test the connection
  console.log('🚀 Using Helius RPC on Mainnet');
  console.log('🏠 House Wallet:', HOUSE_WALLET_ADDRESS);
  
  export const createTransferToHouseTransaction = async (
    userAddress,
    amount,
    token
  ) => {
    try {
      console.log('📡 Connecting to Helius mainnet...');
      
      // Use Helius mainnet RPC
      const connection = new Connection(
        `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
        'confirmed'
      );
      
      // Test the connection
      const version = await connection.getVersion();
      console.log('✅ Connected to Helius! Solana version:', version);
      
      const userPublicKey = new PublicKey(userAddress);
      const housePublicKey = new PublicKey(HOUSE_WALLET_ADDRESS);
      
      console.log('💸 Creating transfer transaction:');
      console.log('  From:', userAddress);
      console.log('  To:', HOUSE_WALLET_ADDRESS);
      console.log('  Amount:', amount, token);
      
      const transaction = new Transaction();
      
      if (token === 'SOL') {
        const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
        console.log('  Lamports:', lamports);
        
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: userPublicKey,
            toPubkey: housePublicKey,
            lamports: lamports
          })
        );
      } else {
        const mintAddress = new PublicKey(TOKEN_MINTS[token]);
        const tokenAmount = Math.floor(amount * Math.pow(10, 9));
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
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      console.log('📦 Got blockhash:', blockhash);
      
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;
      
      return { transaction, connection };
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      throw error;
    }
  };
  
  // Test function to verify Helius connection
  export const testHeliusConnection = async () => {
    try {
      console.log('🧪 Testing Helius connection...');
      const connection = new Connection(
        `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
        'confirmed'
      );
      
      const slot = await connection.getSlot();
      const blockHeight = await connection.getBlockHeight();
      const version = await connection.getVersion();
      
      console.log('✅ Helius connection test successful!');
      console.log('  Current slot:', slot);
      console.log('  Block height:', blockHeight);
      console.log('  Solana version:', version);
      
      return true;
    } catch (error) {
      console.error('❌ Helius connection test failed:', error);
      return false;
    }
  };