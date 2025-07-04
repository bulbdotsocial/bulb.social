import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import {PrivyProvider} from '@privy-io/react-auth';

// Import or define your chain objects here
import {base, berachain, polygon, arbitrum, story, mantle} from 'viem/chains';

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId="cmcpdt3te000fjv0lcp8dkm86"
      clientId="client-WY6N5NzJM3heiuuNfcFxYx6BLHkhoV3G9hUJJ1pCz7gbS"
      config={{
        // Replace this with your desired default chain
        defaultChain: base,
        // Replace this with a list of your desired supported chains
        supportedChains: [base, berachain, polygon, arbitrum, story, mantle],
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        }
      }}
    >

      <App />
    </PrivyProvider>
  </StrictMode>,
)
