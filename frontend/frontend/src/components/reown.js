// src/components/reown.js - FIXED VERSION

import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'

// Your Project ID is correct
const projectId = '089c16e7988ade6be6f2c8ba9531a604'

// Create Solana adapter with explicit wallet support
const solanaAdapter = new SolanaAdapter({
  wallets: [
    'phantom',      // ✅ Phantom wallet
    'trust',        // ✅ Trust Wallet
    'solflare',     // ✅ Solflare wallet
    'backpack',     // ✅ Backpack wallet
    'brave',        // ✅ Brave wallet
    'coinbase',     // ✅ Coinbase wallet
    'exodus',       // ✅ Exodus wallet
    'slope'         // ✅ Slope wallet
  ]
})

// Create the AppKit instance
const appKit = createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  defaultNetwork: solana,
  projectId,
  metadata: {
    name: 'Pulse',
    description: 'Crypto Micro Prediction Game',
    url: 'https://pulse-rho-eight.vercel.app/',
    icons: ['https://assets.reown.com/reown-profile-pic.png']
  },
  // ✅ Add featured wallet IDs for better wallet discovery
  featuredWalletIds: [
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust Wallet
    "c57ca95b47569778a0d41b3c8c1c3cc49df841794d91ae7954ffc1616122b8a9", // Phantom
    "19177a48252d4de3f744b0d6c06b4a0f5c76f2ca2f2b8a0f5c76f2ca2f2b8a0", // Solflare
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Backpack
  ],
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00F2FF',
    '--w3m-border-radius-master': '12px',
    '--w3m-font-family': 'Orbitron, sans-serif'
  },
  features: {
    analytics: true
  }
})

export default appKit