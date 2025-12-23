import { 
    Connection, 
    PublicKey, 
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    Keypair
  } from '@solana/web3.js';
  import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createTransferInstruction,
    getAccount,
    createAssociatedTokenAccountInstruction
  } from '@solana/spl-token';
  import CryptoJS from 'crypto-js';
import bs58 from 'bs58';
import { getActiveWalletKeys } from '../controllers/admin.controller';

  // Debug logging flag - set to false in production
  const DEBUG = process.env.NODE_ENV !== 'production';
  
  // Debug logger - only logs when DEBUG is enabled
  const debugLog = (...args: any[]) => {
    if (DEBUG) console.log(...args);
  };
  
  // Helper function to convert private key to proper format
  const convertPrivateKeyToUint8Array = (privateKey: string | number[]): Uint8Array => {
    try {
      debugLog('🔍 convertPrivateKeyToUint8Array called with:', {
        type: typeof privateKey,
        length: typeof privateKey === 'string' ? privateKey.length : privateKey.length,
        preview: typeof privateKey === 'string' ? privateKey.substring(0, 50) + '...' : 'Array'
      });
      
      if (Array.isArray(privateKey)) {
        // If it's already an array, convert to Uint8Array
        debugLog('✅ Input is already an array, converting to Uint8Array');
        return new Uint8Array(privateKey);
      }
      
      if (typeof privateKey === 'string') {
        // If it's a JSON string array, parse it
        if (privateKey.startsWith('[') && privateKey.endsWith(']')) {
          try {
            const parsed = JSON.parse(privateKey);
            if (Array.isArray(parsed) && parsed.length === 64) {
              debugLog('✅ Parsed JSON array successfully, length:', parsed.length);
              return new Uint8Array(parsed);
            } else {
              throw new Error(`Invalid array format or length: ${parsed.length}, expected 64`);
            }
          } catch (parseError) {
            debugLog('⚠️ Failed to parse JSON array:', parseError);
            throw new Error('Failed to parse JSON array');
          }
        }
        
        // If it's a base58 string (like from Phantom), try to decode it
        if (privateKey.length >= 80 && privateKey.length <= 90) {
          debugLog('🔍 Attempting base58 decode for string length:', privateKey.length);
          try {
            const decoded = bs58.decode(privateKey);
            if (decoded.length === 64) {
              debugLog('✅ Base58 decode successful, length:', decoded.length);
              return new Uint8Array(decoded);
            } else {
              throw new Error(`Invalid base58 private key length: ${decoded.length}, expected 64`);
            }
          } catch (bs58Error) {
            debugLog('⚠️ Base58 decoding failed:', bs58Error);
            throw new Error(`Base58 decoding failed: ${bs58Error instanceof Error ? bs58Error.message : 'Unknown error'}`);
          }
        }
        
        // Additional check: if the string looks like it might be a raw private key
        if (privateKey.length === 128) {
          debugLog('🔍 Attempting hex decode for string length:', privateKey.length);
          // Might be a hex string, try to convert
          try {
            const hexBytes = privateKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16));
            if (hexBytes && hexBytes.length === 64) {
              debugLog('✅ Hex decode successful, length:', hexBytes.length);
              return new Uint8Array(hexBytes);
            }
          } catch (hexError) {
            debugLog('⚠️ Hex decode failed:', hexError);
            // Not a valid hex string, continue to error
          }
        }
        
        debugLog('❌ Unsupported private key format:', {
          length: privateKey.length,
          preview: typeof privateKey === 'string' ? privateKey.substring(0, 50) + '...' : 'Array',
          startsWithBracket: typeof privateKey === 'string' ? privateKey.startsWith('[') : false,
          endsWithBracket: typeof privateKey === 'string' ? privateKey.endsWith(']') : false,
          isBase58Length: typeof privateKey === 'string' ? (privateKey.length >= 80 && privateKey.length <= 90) : false,
          isHexLength: typeof privateKey === 'string' ? (privateKey.length === 128) : false
        });
        
        throw new Error(`Unsupported private key format. Length: ${privateKey.length}, Format: ${typeof privateKey === 'string' ? privateKey.substring(0, 50) + '...' : 'Array'}`);
      }
      
      throw new Error('Invalid private key format');
    } catch (error) {
      console.error('❌ convertPrivateKeyToUint8Array error:', error);
      throw new Error(`Failed to convert private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Environment-based configuration
  const getNetworkConfig = () => {
    const isTestnet = process.env.NODE_ENV === 'testnet' || process.env.SOLANA_NETWORK === 'testnet';
    
    if (isTestnet) {
      return {
        network: 'testnet',
        rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.testnet.solana.com',
        genesisHash: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG',
        tokenMints: {
          // Testnet token addresses (you'll need to deploy these or use existing testnet tokens)
          BeTyche: new PublicKey('11111111111111111111111111111111'), // Placeholder
          RADBRO: new PublicKey('11111111111111111111111111111111'), // Placeholder
          // USDC testnet mint – replace with correct mint if you deploy/choose a specific USDC
          USDC: new PublicKey(process.env.SOLANA_USDC_TESTNET_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')
        }
      };
    } else {
      console.log("mainnet-beta",process.env.SOLANA_RPC_URL);
      return {
        network: 'mainnet-beta',
        rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        genesisHash: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
        tokenMints: {
          BeTyche: new PublicKey('EydjnYHVeCQGihcvA22vBDCxn5HzBrXoQpP98kL9Koyp'),
          RADBRO: new PublicKey('287XY2FcGAE5ty4PZVjg22eqx37sEmzP8jPK3GxFofqB'),
          // Solana USDC mainnet SPL mint
          USDC: new PublicKey(process.env.SOLANA_USDC_MAINNET_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
        }
      };
    }
  };

  // House wallet configuration - now dynamic using wallet rotation
  
  // SPL Token Mint Addresses - Now environment-based
  const TOKEN_MINTS = getNetworkConfig().tokenMints;
  // Per-token decimal configuration (default 9 for SPL tokens, 6 for USDC)
  const TOKEN_DECIMALS: Record<string, number> = {
    BeTyche: 9,
    RADBRO: 9,
    USDC: 6
  };
  
  interface TransferResult {
    success: boolean;
    signature?: string;
    error?: string;
    newBalance?: number;
  }
  
  class BlockchainService {
    private connection: Connection;
    private networkConfig: ReturnType<typeof getNetworkConfig>;
    private houseWallet: Keypair | null = null;
    
    constructor() {
      this.networkConfig = getNetworkConfig();
      
      this.connection = new Connection(this.networkConfig.rpcUrl, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
      });
      
      debugLog('🔗 Blockchain Service initialized');
      debugLog(`🌐 Network: ${this.networkConfig.network}`);
      debugLog(`🔗 RPC: ${this.networkConfig.rpcUrl}`);
    }

    // Method to ensure house wallet is loaded
    private async ensureHouseWallet(): Promise<Keypair> {
      if (!this.houseWallet) {
        await this.refreshHouseWallet();
      }
      return this.houseWallet!;
    }

    // Method to refresh house wallet from active wallet
    async refreshHouseWallet(): Promise<void> {
      const walletKeys = await getActiveWalletKeys();
      const privateKeyArray = convertPrivateKeyToUint8Array(walletKeys.privateKey);
      this.houseWallet = Keypair.fromSecretKey(privateKeyArray);
      debugLog('🔄 House wallet refreshed:', this.houseWallet.publicKey.toString());
    }

    // Method to get current house wallet (for external access)
    async getHouseWallet(): Promise<Keypair> {
      return await this.ensureHouseWallet();
    }
    
    // Transfer tokens FROM user TO house (when placing bet)
    async transferToHouse(
      userWalletAddress: string,
      amount: number,
      token: string
    ): Promise<TransferResult> {
      try {
        debugLog(`💸 Transferring ${amount} ${token} from ${userWalletAddress} to house`);
        
        if (token === 'SOL') {
          return await this.transferSOLToHouse(userWalletAddress, amount);
        } else {
          return await this.transferSPLToHouse(userWalletAddress, amount, token);
        }
      } catch (error) {
        console.error('❌ Transfer to house failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Transfer failed'
        };
      }
    }
    
    // Transfer tokens FROM house TO user (when user wins or gets refund)
    async transferFromHouse(
      userWalletAddress: string,
      amount: number,
      token: string
    ): Promise<TransferResult> {
      try {
        debugLog(`💰 Transferring ${amount} ${token} from house to ${userWalletAddress}`);
        
        if (token === 'SOL') {
          return await this.transferSOLFromHouse(userWalletAddress, amount);
        } else {
          return await this.transferSPLFromHouse(userWalletAddress, amount, token);
        }
      } catch (error) {
        console.error('❌ Transfer from house failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Transfer failed'
        };
      }
    }
    
    // SOL transfers
    private async transferSOLToHouse(
      userWalletAddress: string,
      amount: number
    ): Promise<TransferResult> {
      // For SOL transfers TO house, we need user to sign the transaction
      // This requires frontend integration - return instructions for frontend
      
      const houseWallet = await this.ensureHouseWallet();
      const userPublicKey = new PublicKey(userWalletAddress);
      // IMPORTANT: Use proper conversion for testnet/devnet
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      debugLog(`💸 Converting ${amount} SOL to ${lamports} lamports`);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: houseWallet.publicKey,
          lamports: lamports
        })
      );
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;
      
      // Return serialized transaction for frontend to sign
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });
      
      return {
        success: true,
        signature: Buffer.from(serializedTransaction).toString('base64')
      };
    }
    
        private async transferSOLFromHouse(
      userWalletAddress: string,
      amount: number
    ): Promise<TransferResult> {
      const houseWallet = await this.ensureHouseWallet();
      const userPublicKey = new PublicKey(userWalletAddress);
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: houseWallet.publicKey,
          toPubkey: userPublicKey,
          lamports: lamports
        })
      );
      
      try {
        const signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [houseWallet],
          { commitment: 'confirmed' }
        );
        
        debugLog(`✅ SOL transfer completed: ${signature}`);
        
        // Get new balance
        const newBalance = await this.connection.getBalance(userPublicKey);
        
        return {
          success: true,
          signature,
          newBalance: newBalance / LAMPORTS_PER_SOL
        };
      } catch (error) {
        console.error('❌ SOL transfer failed:', error);
        throw error;
      }
    }
    
    // SPL Token transfers
    private async transferSPLToHouse(
      userWalletAddress: string,
      amount: number,
      token: string
    ): Promise<TransferResult> {
      const houseWallet = await this.ensureHouseWallet();
      const mintAddress = TOKEN_MINTS[token as keyof typeof TOKEN_MINTS];
      if (!mintAddress) {
        throw new Error(`Unsupported token: ${token}`);
      }
      
      const userPublicKey = new PublicKey(userWalletAddress);
      const decimals = TOKEN_DECIMALS[token] ?? 9;
      const tokenAmount = Math.floor(amount * Math.pow(10, decimals));
      
      // Get associated token accounts
      const userTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        userPublicKey
      );
      
      const houseTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        houseWallet.publicKey
      );
      
      const transaction = new Transaction();
      
      // Check if house token account exists, create if not
      try {
        await getAccount(this.connection, houseTokenAccount);
      } catch (error) {
        debugLog('Creating house token account...');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            houseWallet.publicKey, // payer
            houseTokenAccount,
            houseWallet.publicKey, // owner
            mintAddress
          )
        );
      }
      
      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          userTokenAccount,
          houseTokenAccount,
          userPublicKey,
          tokenAmount
        )
      );
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;
      
      // Return serialized transaction for frontend to sign
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });
      
      return {
        success: true,
        signature: Buffer.from(serializedTransaction).toString('base64')
      };
    }
    
    private async transferSPLFromHouse(
      userWalletAddress: string,
      amount: number,
      token: string
    ): Promise<TransferResult> {
      const mintAddress = TOKEN_MINTS[token as keyof typeof TOKEN_MINTS];
      if (!mintAddress) {
        throw new Error(`Unsupported token: ${token}`);
      }
      
      const userPublicKey = new PublicKey(userWalletAddress);
      const decimals = TOKEN_DECIMALS[token] ?? 9;
      const tokenAmount = Math.floor(amount * Math.pow(10, decimals)); // token-specific decimals
      
      // Get associated token accounts
      const userTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        userPublicKey
      );
      
      const houseWallet = await this.ensureHouseWallet();
      const houseTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        houseWallet.publicKey
      );
      
      const transaction = new Transaction();
      
      // Check if user token account exists, create if not
      try {
        await getAccount(this.connection, userTokenAccount);
      } catch (error) {
        debugLog('Creating user token account...');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            houseWallet.publicKey, // payer (house pays for account creation)
            userTokenAccount,
            userPublicKey, // owner
            mintAddress
          )
        );
      }
      
      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          houseTokenAccount,
          userTokenAccount,
          houseWallet.publicKey,
          tokenAmount
        )
      );
      
      try {
        const signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [houseWallet],
          { commitment: 'confirmed' }
        );
        
        debugLog(`✅ ${token} transfer completed: ${signature}`);
        
        // Get new balance
        const userTokenAccountInfo = await getAccount(this.connection, userTokenAccount);
        const newBalance = Number(userTokenAccountInfo.amount) / Math.pow(10, 9);
        
        return {
          success: true,
          signature,
          newBalance
        };
      } catch (error) {
        console.error(`❌ ${token} transfer failed:`, error);
        throw error;
      }
    }
    
    // Get real balance from blockchain
    async getRealBalance(walletAddress: string, token: string): Promise<number> {
      try {
        const publicKey = new PublicKey(walletAddress);
        
        if (token === 'SOL') {
          const balance = await this.connection.getBalance(publicKey);
          return balance / LAMPORTS_PER_SOL;
        } else {
          const mintAddress = TOKEN_MINTS[token as keyof typeof TOKEN_MINTS];
          if (!mintAddress) return 0;
          
          const tokenAccount = await getAssociatedTokenAddress(mintAddress, publicKey);
          
          try {
            const accountInfo = await getAccount(this.connection, tokenAccount);
            const decimals = TOKEN_DECIMALS[token] ?? 9;
            return Number(accountInfo.amount) / Math.pow(10, decimals);
          } catch (error) {
            // Account doesn't exist
            return 0;
          }
        }
      } catch (error) {
        console.error(`Error getting ${token} balance:`, error);
        return 0;
      }
    }
    
    // Create Keypair from wallet data (for wallet rotation)
    createKeypairFromWallet(walletData: { publicKey: string; privateKey: string | number[] }): Keypair {
      try {
        debugLog('🔑 Creating Keypair from wallet data...');
        debugLog('📊 Wallet data:', {
          publicKey: walletData.publicKey?.substring(0, 20) + '...',
          privateKeyLength: walletData.privateKey,
          privateKeyType: typeof walletData.privateKey,
          isEncrypted: typeof walletData.privateKey === 'string' && walletData.privateKey.startsWith('U2FsdGVkX1')
        });
        
        // Decrypt the private key if it's encrypted
        let privateKey: string | number[];
        
        if (typeof walletData.privateKey === 'string') {
          // Check if it's encrypted (starts with U2FsdGVkX1)
          if (walletData.privateKey.startsWith('U2FsdGVkX1')) {
            debugLog('🔓 Decrypting private key...');
            // It's encrypted, decrypt it
            const SERVER_SHARED_SECRET = process.env.SHARED_SECRET_For_PRIVATE_KEY;
            if (!SERVER_SHARED_SECRET) {
              throw new Error('SHARED_SECRET_For_PRIVATE_KEY not found in environment');
            }
            
            try {
              const bytes = CryptoJS.AES.decrypt(walletData.privateKey, SERVER_SHARED_SECRET);
              
              // Check if decryption was successful
              if (!bytes || bytes.sigBytes <= 0) {
                throw new Error('Decryption returned invalid data');
              }
              
              // Try multiple encoding methods to handle corrupted data
              let decryptedString = null;
              
              try {
                // Try UTF-8 first
                decryptedString = bytes.toString(CryptoJS.enc.Utf8);
                debugLog('✅ Private key decrypted with UTF-8, length:', decryptedString.length);
              } catch (utf8Error) {
                debugLog('⚠️ UTF-8 conversion failed, trying hex encoding...');
                try {
                  // Try hex encoding as fallback
                  decryptedString = bytes.toString(CryptoJS.enc.Hex);
                  debugLog('✅ Private key decrypted with hex encoding, length:', decryptedString.length);
                  
                  // Convert hex to readable format if possible
                  if (decryptedString.length === 128) {
                    // Might be a hex representation of private key
                    const hexBytes = decryptedString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16));
                    if (hexBytes && hexBytes.length === 64) {
                      privateKey = hexBytes;
                      debugLog('✅ Converted hex to byte array');
                      return Keypair.fromSecretKey(new Uint8Array(hexBytes));
                    }
                  }
                } catch (hexError) {
                  debugLog('⚠️ Hex encoding also failed, trying base64...');
                  try {
                    // Try base64 as last resort
                    decryptedString = bytes.toString(CryptoJS.enc.Base64);
                    debugLog('✅ Private key decrypted with base64 encoding, length:', decryptedString.length);
                  } catch (base64Error) {
                    throw new Error('All encoding methods failed');
                  }
                }
              }
              
              if (!decryptedString || decryptedString.length === 0) {
                throw new Error('Decryption resulted in empty data');
              }
              
              privateKey = decryptedString;
              debugLog('✅ Private key decrypted successfully, length:', privateKey.length);
              debugLog('🔍 Decrypted private key preview:', typeof privateKey === 'string' ? privateKey.substring(0, 50) + '...' : 'Array');
              
              // Check if the decrypted data is already in the right format
              if (typeof privateKey === 'string' && privateKey.startsWith('[') && privateKey.endsWith(']')) {
                try {
                  const parsed = JSON.parse(privateKey);
                  if (Array.isArray(parsed) && parsed.length === 64) {
                    debugLog('✅ Decrypted data is already a valid array, creating Keypair directly');
                    return Keypair.fromSecretKey(new Uint8Array(parsed));
                  }
                } catch (parseError) {
                  debugLog('⚠️ Failed to parse decrypted array, continuing with conversion...');
                }
              }
            } catch (decryptError) {
              console.error('❌ Decryption failed:', decryptError);
              throw new Error(`Decryption failed: ${decryptError instanceof Error ? decryptError.message : 'Unknown error'}`);
            }
          } else {
            debugLog('✅ Private key is not encrypted, using as-is');
            // It's not encrypted, use as-is
            privateKey = walletData.privateKey;
          }
        } else {
          debugLog('✅ Private key is already an array');
          privateKey = walletData.privateKey;
        }
        
        debugLog('🔄 Converting private key to Uint8Array...');
        debugLog('🔍 Private key type:', typeof privateKey);
        debugLog('🔍 Private key preview:', typeof privateKey === 'string' ? privateKey.substring(0, 50) + '...' : 'Array');
        
        // Convert to Uint8Array using our helper function
        const privateKeyArray = convertPrivateKeyToUint8Array(privateKey);
        debugLog('✅ Private key converted to Uint8Array, length:', privateKeyArray.length);
        
        // Create and return the Keypair
        const keypair = Keypair.fromSecretKey(privateKeyArray);
        debugLog('✅ Keypair created successfully');
        return keypair;
      } catch (error) {
        console.error('❌ Failed to create Keypair:', error);
        throw new Error(`Failed to create Keypair from wallet data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Verify transaction with strict security checks
    async verifyTransaction(
      signature: string,
      expectedSender: string,
      expectedAmount: number,
      expectedToken: string
    ): Promise<{ valid: boolean; error?: string }> {
      try {
        debugLog(`🔍 Verifying transaction with strict checks:`, {
          signature,
          expectedSender,
          expectedAmount,
          expectedToken
        });
        
        // 1. Check if transaction signature has already been used (prevent replay attacks)
        const Transaction = (await import('../models/transaction.model')).default;
        const existingTx = await Transaction.findOne({ signature });
        if (existingTx) {
          debugLog('❌ Transaction signature already used');
          return { valid: false, error: 'Transaction signature has already been used' };
        }
        
        // 2. Get transaction details from blockchain
        // Try finalized first, fall back to confirmed if not yet finalized
        let transaction = await this.connection.getTransaction(signature, {
          commitment: 'finalized',
          maxSupportedTransactionVersion: 0
        });
        
        // If not finalized yet, try confirmed (still secure)
        if (!transaction) {
          debugLog('⏳ Transaction not finalized yet, checking confirmed status...');
          transaction = await this.connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          });
          
          if (!transaction) {
            debugLog('❌ Transaction not found on blockchain');
            return { valid: false, error: 'Transaction not found. Please wait a few seconds and try again.' };
          }
          
          debugLog('✅ Transaction confirmed (not yet finalized)');
        } else {
          debugLog('✅ Transaction finalized');
        }
        
        // 3. Check if transaction was successful
        if (transaction.meta?.err) {
          debugLog('❌ Transaction failed:', transaction.meta.err);
          return { valid: false, error: 'Transaction failed on blockchain' };
        }
        
        // 4. Get current active house wallet
        const houseWallet = await this.ensureHouseWallet();
        const expectedRecipient = houseWallet.publicKey.toString();
        
        // 5. Verify sender, recipient, and amount based on token type
        let verified = false;
        
        if (expectedToken === 'SOL') {
          // Verify SOL transfer
          verified = this.verifySOLTransfer(
            transaction,
            expectedSender,
            expectedRecipient,
            expectedAmount
          );
        } else {
          // Verify SPL token transfer
          verified = await this.verifySPLTokenTransfer(
            transaction,
            expectedSender,
            expectedRecipient,
            expectedAmount,
            expectedToken
          );
        }
        
        if (!verified) {
          debugLog('❌ Transaction verification failed');
          return { valid: false, error: 'Transaction details do not match expected values' };
        }
        
        // 6. Record transaction signature to prevent future reuse
        const txRecord = await Transaction.create({
          signature,
          sender: expectedSender,
          recipient: expectedRecipient,
          amount: expectedAmount,
          token: expectedToken,
          usedAt: new Date()
        });
        
        debugLog(`📝 Transaction signature recorded in database: ${signature}`);
        
        debugLog('✅ Transaction verified successfully with all security checks');
        return { valid: true };
        
      } catch (error) {
        console.error('❌ Error verifying transaction:', error);
        return { 
          valid: false, 
          error: error instanceof Error ? error.message : 'Transaction verification error' 
        };
      }
    }
    
    // Helper: Verify SOL transfer details
    private verifySOLTransfer(
      transaction: any,
      expectedSender: string,
      expectedRecipient: string,
      expectedAmount: number
    ): boolean {
      try {
        const accountKeys = transaction.transaction.message.accountKeys;
        const preBalances = transaction.meta.preBalances;
        const postBalances = transaction.meta.postBalances;
        
        // Find sender and recipient indices
        let senderIndex = -1;
        let recipientIndex = -1;
        
        for (let i = 0; i < accountKeys.length; i++) {
          const key = accountKeys[i].pubkey || accountKeys[i];
          const keyStr = key.toString();
          
          if (keyStr === expectedSender) {
            senderIndex = i;
          }
          if (keyStr === expectedRecipient) {
            recipientIndex = i;
          }
        }
        
        if (senderIndex === -1) {
          debugLog('❌ Sender not found in transaction');
          return false;
        }
        
        if (recipientIndex === -1) {
          debugLog('❌ Recipient (house wallet) not found in transaction');
          return false;
        }
        
        // Calculate actual transferred amount (in lamports)
        const senderBalanceChange = preBalances[senderIndex] - postBalances[senderIndex];
        const recipientBalanceChange = postBalances[recipientIndex] - preBalances[recipientIndex];
        const expectedLamports = Math.floor(expectedAmount * LAMPORTS_PER_SOL);
        
        debugLog('💰 Balance changes:', {
          senderDecrease: senderBalanceChange,
          recipientIncrease: recipientBalanceChange,
          expectedLamports
        });
        
        // Verify recipient received at least the expected amount (may be slightly less due to fees)
        const tolerance = 5000; // 0.000005 SOL tolerance for fee variance
        if (recipientBalanceChange < (expectedLamports - tolerance)) {
          debugLog('❌ Amount mismatch');
          return false;
        }
        
        debugLog('✅ SOL transfer verified');
        return true;
        
      } catch (error) {
        console.error('❌ Error verifying SOL transfer:', error);
      return false;
      }
    }
    
    // Helper: Verify SPL token transfer details
    private async verifySPLTokenTransfer(
      transaction: any,
      expectedSender: string,
      expectedRecipient: string,
      expectedAmount: number,
      tokenSymbol: string
    ): Promise<boolean> {
      try {
        // Get token mint address from network configuration
        const tokenMint = TOKEN_MINTS[tokenSymbol as keyof typeof TOKEN_MINTS];
        if (!tokenMint) {
          debugLog('❌ Token mint not found for', tokenSymbol);
          return false;
        }
        
        const expectedMintString = tokenMint.toBase58();
        
        // Parse token transfer from transaction
        const postTokenBalances = transaction.meta?.postTokenBalances || [];
        const preTokenBalances = transaction.meta?.preTokenBalances || [];
        
        // Find the token transfer to house wallet
        let recipientChange = 0;
        let senderChange = 0;
        
        for (const postBalance of postTokenBalances) {
          const preBalance = preTokenBalances.find((p: any) => p.accountIndex === postBalance.accountIndex);
          if (!preBalance) continue;
          
          const owner = postBalance.owner;
          const mint = postBalance.mint; // string base58 mint
          
          // Only consider balances for the expected token mint
          if (mint !== expectedMintString) continue;
          
          const change = Number(postBalance.uiTokenAmount.amount) - Number(preBalance.uiTokenAmount.amount);
          
          if (owner === expectedRecipient) {
            recipientChange = change / Math.pow(10, postBalance.uiTokenAmount.decimals);
          }
          if (owner === expectedSender) {
            senderChange = Math.abs(change) / Math.pow(10, postBalance.uiTokenAmount.decimals);
          }
        }
        
        debugLog('💰 Token balance changes:', {
          recipientIncrease: recipientChange,
          senderDecrease: senderChange,
          expectedAmount
        });
        
        // Verify amounts match (with small tolerance for rounding)
        const tolerance = 0.0001;
        if (Math.abs(recipientChange - expectedAmount) > tolerance) {
          debugLog('❌ Token amount mismatch');
          return false;
        }
        
        debugLog('✅ SPL token transfer verified');
        return true;
        
      } catch (error) {
        console.error('❌ Error verifying SPL token transfer:', error);
        return false;
      }
    }
    
    // Update transaction record with betId
    async updateTransactionBetId(signature: string, betId: string): Promise<void> {
      try {
        const Transaction = (await import('../models/transaction.model')).default;
        await Transaction.updateOne({ signature }, { betId });
        debugLog(`📝 Updated transaction ${signature} with betId: ${betId}`);
      } catch (error) {
        console.error('❌ Error updating transaction betId:', error);
      }
    }
  }
  
  // Singleton instance
  let blockchainServiceInstance: BlockchainService | null = null;
  
  export const getBlockchainService = (): BlockchainService => {
    if (!blockchainServiceInstance) {
      blockchainServiceInstance = new BlockchainService();
    }
    return blockchainServiceInstance;
  };