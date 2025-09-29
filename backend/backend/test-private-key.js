// Test script for private key conversion
// Run with: node test-private-key.js

const CryptoJS = require('crypto-js');

// Mock environment variable
process.env.SHARED_SECRET_For_PRIVATE_KEY = "some-strong-secret";

// Test the private key conversion logic
function testPrivateKeyConversion() {
  console.log('🧪 Testing Private Key Conversion...\n');
  
  // Test 1: Array format
  console.log('Test 1: Array format');
  const arrayPrivateKey = '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]';
  
  try {
    const parsed = JSON.parse(arrayPrivateKey);
    if (Array.isArray(parsed) && parsed.length === 64) {
      console.log('✅ Array format valid');
    } else {
      console.log('❌ Array format invalid');
    }
  } catch (error) {
    console.log('❌ Array parsing failed:', error.message);
  }
  
  // Test 2: Encryption/Decryption
  console.log('\nTest 2: Encryption/Decryption');
  const testPrivateKey = arrayPrivateKey;
  const encrypted = CryptoJS.AES.encrypt(testPrivateKey, process.env.SHARED_SECRET_For_PRIVATE_KEY).toString();
  console.log('✅ Encrypted:', encrypted.substring(0, 20) + '...');
  
  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, process.env.SHARED_SECRET_For_PRIVATE_KEY).toString(CryptoJS.enc.Utf8);
    console.log('✅ Decrypted:', decrypted.substring(0, 20) + '...');
    
    if (decrypted === testPrivateKey) {
      console.log('✅ Encryption/Decryption successful');
    } else {
      console.log('❌ Encryption/Decryption failed - data mismatch');
    }
  } catch (error) {
    console.log('❌ Decryption failed:', error.message);
  }
  
  // Test 3: Uint8Array conversion
  console.log('\nTest 3: Uint8Array conversion');
  try {
    const parsed = JSON.parse(arrayPrivateKey);
    const uint8Array = new Uint8Array(parsed);
    console.log('✅ Uint8Array created, length:', uint8Array.length);
    console.log('✅ First 5 values:', Array.from(uint8Array.slice(0, 5)));
  } catch (error) {
    console.log('❌ Uint8Array conversion failed:', error.message);
  }
  
  console.log('\n🎯 Test completed!');
}

// Run the test
testPrivateKeyConversion();
