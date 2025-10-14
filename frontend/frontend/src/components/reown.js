// src/components/reown.js - FIXED VERSION

import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'

// Your Project ID is correct
const projectId = '7dc01e78075138f0fcffac68cb30d471'

// Create Solana adapter
const solanaAdapter = new SolanaAdapter({
  wallets: []
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
    // url: 'https://flourishing-tartufo-9040fe.netlify.app',
    
    icons: ['https://assets.reown.com/reown-profile-pic.png']
  },
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