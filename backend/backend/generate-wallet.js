const { Keypair } = require('@solana/web3.js');
const fs = require('fs');

// Generate new keypair
const keypair = Keypair.generate();

// Get public key
const publicKey = keypair.publicKey.toString();

// Get private key as array
const privateKeyArray = Array.from(keypair.secretKey);

console.log('🏦 House Wallet Generated!');
console.log('📍 Public Key:', publicKey);
console.log('🔑 Private Key Array:', JSON.stringify(privateKeyArray));

// Save to file
fs.writeFileSync('house-wallet.json', JSON.stringify(privateKeyArray));
console.log('💾 Private key saved to house-wallet.json');

// Generate .env format
console.log('\n📋 Add these to your .env file:');
console.log(`HOUSE_WALLET_ADDRESS=${publicKey}`);
console.log(`HOUSE_WALLET_PRIVATE_KEY=${JSON.stringify(privateKeyArray)}`);