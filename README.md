# Bulb.Social - Decentralized Social Media Platform

🌐 **A Web3 social media platform built on Flow testnet with IPFS storage**

## Features

### Core Functionality

- **Instagram-style feed** with IPFS image storage
- **Smart contract profiles** with on-chain identity
- **ENS integration** for enhanced user experience
- **Wallet-based authentication** via Privy
- **Real-time content discovery**

### Web3 Integration

- **Flow Testnet** smart contracts for profile management
- **IPFS** for decentralized image storage
- **ENS** domain resolution and avatars
- **MetaMask** integration with automatic network switching
- **Reown AppKit** for multi-wallet support

### Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Blockchain**: Flow Testnet (EVM compatible)
- **Storage**: IPFS via Pinata
- **Authentication**: Privy + Wallet Connect
- **UI Framework**: Material-UI + Styled Components
- **State Management**: React hooks + Context

## Quick Start

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- FLOW testnet tokens for transactions

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/bulb.social.git
cd bulb.social

# Install dependencies
cd client && npm install
cd ../server && go mod download

# Start development servers
npm run dev  # Client on :3001
go run main.go  # Server on :8080
```

### Environment Setup

```bash
# Client environment (.env)
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PINATA_JWT=your_pinata_jwt
VITE_BULB_FACTORY_ADDRESS=0xe68C1C1B6316507410FA5fC4E0Ab0400eECE30a1

# Server environment
PINATA_JWT=your_pinata_jwt
PORT=8080
```

## Architecture

### Smart Contracts

- **BulbFactory**: Profile creation and management
- **BulbProfile**: Individual user profiles with monetization
- **Network**: Flow Testnet (Chain ID: 0x221)

### Data Flow

1. User connects wallet via Privy
2. Profile created on Flow testnet
3. Images uploaded to IPFS
4. Posts stored with IPFS CIDs
5. Real-time feed updates

## Development

### Project Structure
