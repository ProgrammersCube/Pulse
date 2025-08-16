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
  
  // House wallet configuration (you need to create this)
  // REPLACE IT WITH THIS SAFER VERSION:
let HOUSE_WALLET: Keypair;

try {
  const privateKeyString = process.env.HOUSE_WALLET_PRIVATE_KEY;
  if (!privateKeyString) {
    throw new Error('HOUSE_WALLET_PRIVATE_KEY not found in environment');
  }
  
  const privateKeyArray = JSON.parse(privateKeyString);
  if (!Array.isArray(privateKeyArray) || privateKeyArray.length !== 64) {
    throw new Error(`Invalid private key format. Expected array of 64 numbers, got ${privateKeyArray.length}`);
  }
  
  HOUSE_WALLET = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
  console.log('✅ House wallet loaded successfully:', HOUSE_WALLET.publicKey.toString());
} catch (error) {
  console.error('❌ House wallet setup failed:', error);
  throw new Error(`House wallet setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
  
  // SPL Token Mint Addresses
  const TOKEN_MINTS = {
    BeTyche: new PublicKey('EydjnYHVeCQGihcvA22vBDCxn5HzBrXoQpP98kL9Koyp'),
    RADBRO: new PublicKey('287XY2FcGAE5ty4PZVjg22eqx37sEmzP8jPK3GxFofqB'),
    // SOL doesn't need mint address as it's native
  };
  
  interface TransferResult {
    success: boolean;
    signature?: string;
    error?: string;
    newBalance?: number;
  }
  
  class BlockchainService {
    private connection: Connection;
    
    constructor() {
      const network = process.env.SOLANA_NETWORK || 'mainnet-beta';
      const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      
      this.connection = new Connection(rpcUrl, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
      });
      
      console.log('🔗 Blockchain Service initialized');
      console.log('🏦 House Wallet:', HOUSE_WALLET.publicKey.toString());
    }
    
    // Transfer tokens FROM user TO house (when placing bet)
    async transferToHouse(
      userWalletAddress: string,
      amount: number,
      token: string
    ): Promise<TransferResult> {
      try {
        console.log(`💸 Transferring ${amount} ${token} from ${userWalletAddress} to house`);
        
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
        console.log(`💰 Transferring ${amount} ${token} from house to ${userWalletAddress}`);
        
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
      
      
      const userPublicKey = new PublicKey(userWalletAddress);
      // IMPORTANT: Use proper conversion for testnet/devnet
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      console.log(`💸 Converting ${amount} SOL to ${lamports} lamports`);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: HOUSE_WALLET.publicKey,
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
      const userPublicKey = new PublicKey(userWalletAddress);
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: HOUSE_WALLET.publicKey,
          toPubkey: userPublicKey,
          lamports: lamports
        })
      );
      
      try {
        const signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [HOUSE_WALLET],
          { commitment: 'confirmed' }
        );
        
        console.log(`✅ SOL transfer completed: ${signature}`);
        
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
      const mintAddress = TOKEN_MINTS[token as keyof typeof TOKEN_MINTS];
      if (!mintAddress) {
        throw new Error(`Unsupported token: ${token}`);
      }
      
      const userPublicKey = new PublicKey(userWalletAddress);
      const tokenAmount = Math.floor(amount * Math.pow(10, 9)); // Assuming 9 decimals
      
      // Get associated token accounts
      const userTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        userPublicKey
      );
      
      const houseTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        HOUSE_WALLET.publicKey
      );
      
      const transaction = new Transaction();
      
      // Check if house token account exists, create if not
      try {
        await getAccount(this.connection, houseTokenAccount);
      } catch (error) {
        console.log('Creating house token account...');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            HOUSE_WALLET.publicKey, // payer
            houseTokenAccount,
            HOUSE_WALLET.publicKey, // owner
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
      const tokenAmount = Math.floor(amount * Math.pow(10, 9)); // Assuming 9 decimals
      
      // Get associated token accounts
      const userTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        userPublicKey
      );
      
      const houseTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        HOUSE_WALLET.publicKey
      );
      
      const transaction = new Transaction();
      
      // Check if user token account exists, create if not
      try {
        await getAccount(this.connection, userTokenAccount);
      } catch (error) {
        console.log('Creating user token account...');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            HOUSE_WALLET.publicKey, // payer (house pays for account creation)
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
          HOUSE_WALLET.publicKey,
          tokenAmount
        )
      );
      
      try {
        const signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [HOUSE_WALLET],
          { commitment: 'confirmed' }
        );
        
        console.log(`✅ ${token} transfer completed: ${signature}`);
        
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
            return Number(accountInfo.amount) / Math.pow(10, 9);
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
    
    // Verify transaction
    // In blockchain.service.ts - Update verifyTransaction method
async verifyTransaction(signature: string): Promise<boolean> {
  try {
    console.log(`🔍 Verifying transaction: ${signature}`);
    
    // Parse the signature
    const txSignature = signature;
    
    // Get transaction details
    const transaction = await this.connection.getTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    
    if (!transaction) {
      console.log('❌ Transaction not found');
      return false;
    }
    
    // Check if transaction was successful
    if (transaction.meta?.err) {
      console.log('❌ Transaction failed:', transaction.meta.err);
      return false;
    }
    
    console.log('✅ Transaction verified successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error verifying transaction:', error);
    // For testing, you might want to return true here
    // return true; // ONLY FOR TESTING!
    return false;
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