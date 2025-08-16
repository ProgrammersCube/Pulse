// debug-mainnet.js - Run this in your backend folder
// Usage: node debug-mainnet.js

require('dotenv').config();
const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function debugMainNet() {
  console.log('🔍 DEBUGGING MAINNET SETUP');
  console.log('='.repeat(50));
  
  // 1. Check Environment Variables
  console.log('\n1️⃣ ENVIRONMENT VARIABLES:');
  console.log(`SOLANA_NETWORK: ${process.env.SOLANA_NETWORK || 'NOT_SET'}`);
  console.log(`SOLANA_RPC_URL: ${process.env.SOLANA_RPC_URL || 'NOT_SET'}`);
  console.log(`HOUSE_WALLET_ADDRESS: ${process.env.HOUSE_WALLET_ADDRESS || 'NOT_SET'}`);
  console.log(`PRIVATE_KEY_SET: ${process.env.HOUSE_WALLET_PRIVATE_KEY ? 'YES' : 'NO'}`);
  
  if (!process.env.SOLANA_RPC_URL || !process.env.HOUSE_WALLET_PRIVATE_KEY || !process.env.HOUSE_WALLET_ADDRESS) {
    console.error('❌ CRITICAL: Missing environment variables!');
    console.log('\n💡 Make sure your .env file contains:');
    console.log('SOLANA_NETWORK=mainnet-beta');
    console.log('SOLANA_RPC_URL=your-rpc-url');
    console.log('HOUSE_WALLET_ADDRESS=your-wallet-address');
    console.log('HOUSE_WALLET_PRIVATE_KEY=[your,private,key,array]');
    return;
  }
  
  // 2. Test RPC Connection
  console.log('\n2️⃣ TESTING RPC CONNECTION:');
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL, { commitment: 'confirmed' });
    const version = await connection.getVersion();
    console.log(`✅ RPC Connected successfully`);
    console.log(`📊 Solana Version: ${version['solana-core']}`);
    
    const slot = await connection.getSlot();
    console.log(`📍 Current Slot: ${slot}`);
    
    // Check if it's really MainNet
    const genesisHash = await connection.getGenesisHash();
    console.log(`🔗 Genesis Hash: ${genesisHash}`);
    
    if (genesisHash === '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d') {
      console.log('✅ Confirmed: Connected to MAINNET-BETA');
    } else if (genesisHash === 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG') {
      console.log('⚠️  WARNING: Connected to DEVNET (not MainNet!)');
    } else {
      console.log('❓ Unknown network');
    }
    
  } catch (error) {
    console.error('❌ RPC Connection Failed:', error.message);
    
    if (error.message.includes('403') || error.message.includes('429')) {
      console.log('💡 LIKELY CAUSE: Rate limited by free RPC endpoint');
      console.log('💡 SOLUTION: Get premium RPC from Helius or QuickNode');
    }
    return;
  }
  
  // 3. Test House Wallet
  console.log('\n3️⃣ TESTING HOUSE WALLET:');
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL, { commitment: 'confirmed' });
    
    // Parse and validate private key
    const privateKeyArray = JSON.parse(process.env.HOUSE_WALLET_PRIVATE_KEY);
    if (!Array.isArray(privateKeyArray) || privateKeyArray.length !== 64) {
      throw new Error(`Invalid private key format. Expected array of 64 numbers, got ${privateKeyArray.length}`);
    }
    
    const houseKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    console.log(`📋 Generated Public Key: ${houseKeypair.publicKey.toString()}`);
    console.log(`📋 Expected Public Key:  ${process.env.HOUSE_WALLET_ADDRESS}`);
    
    if (houseKeypair.publicKey.toString() !== process.env.HOUSE_WALLET_ADDRESS) {
      console.error('❌ CRITICAL: Private key does not match public address!');
      console.log('💡 SOLUTION: Regenerate wallet or fix private key');
      return;
    }
    
    console.log('✅ Private key matches public address');
    
    // Check SOL balance
    const solBalance = await connection.getBalance(houseKeypair.publicKey);
    const solBalanceFormatted = solBalance / LAMPORTS_PER_SOL;
    console.log(`💰 House SOL Balance: ${solBalanceFormatted} SOL`);
    
    if (solBalanceFormatted < 0.01) {
      console.error('❌ CRITICAL: House wallet has insufficient SOL!');
      console.log('💡 SOLUTION: Send SOL to your house wallet');
      console.log(`💡 House Wallet: ${houseKeypair.publicKey.toString()}`);
      return;
    } else if (solBalanceFormatted < 1) {
      console.warn('⚠️  WARNING: House wallet has low SOL balance');
      console.log('💡 RECOMMENDATION: Add more SOL for reliable operations');
    } else {
      console.log('✅ House wallet has sufficient SOL');
    }
    
  } catch (error) {
    console.error('❌ House Wallet Test Failed:', error.message);
    return;
  }
  
  // 4. Test Small Transaction
  console.log('\n4️⃣ TESTING TRANSACTION CAPABILITY:');
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL, { commitment: 'confirmed' });
    const privateKeyArray = JSON.parse(process.env.HOUSE_WALLET_PRIVATE_KEY);
    const houseKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    
    // Test getting recent blockhash (this fails if RPC is bad)
    const { blockhash } = await connection.getLatestBlockhash();
    console.log(`✅ Can get recent blockhash: ${blockhash.slice(0, 8)}...`);
    
    console.log('✅ Transaction setup capability confirmed');
    console.log('💡 NOTE: Not sending actual transaction in debug mode');
    
  } catch (error) {
    console.error('❌ Transaction capability test failed:', error.message);
    
    if (error.message.includes('rate') || error.message.includes('limit')) {
      console.log('💡 LIKELY CAUSE: RPC rate limiting');
      console.log('💡 SOLUTION: Use premium RPC endpoint');
    }
    return;
  }
  
  // 5. Summary and Recommendations
  console.log('\n5️⃣ DIAGNOSTIC SUMMARY:');
  console.log('✅ Environment variables configured');
  console.log('✅ RPC connection working');
  console.log('✅ House wallet setup correctly');
  console.log('✅ Transaction capability confirmed');
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Check your server logs for transfer attempts');
  console.log('2. Look for "ATTEMPTING BLOCKCHAIN TRANSFER" messages');
  console.log('3. If no transfer logs, the transfer code is not being called');
  console.log('4. If transfer logs show errors, focus on fixing those errors');
  
  console.log('\n💡 IF STILL HAVING ISSUES:');
  console.log('1. Restart your backend server');
  console.log('2. Try a small test bet');
  console.log('3. Monitor server logs closely');
  console.log('4. Check if you are using the updated blockchain.service.ts');
  
  console.log('\n📱 CONTACT INFO:');
  console.log('Share your server logs if transfers still fail after this debug');
}

// Run the debug
debugMainNet().catch(console.error);