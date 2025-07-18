# Smart Contract Integration

This directory contains the smart contract integration for the Bulb social media platform deployed on Flow testnet.

## Contract Details

- **Contract Address**: `0xe68C1C1B6316507410FA5fC4E0Ab0400eECE30a1`
- **Network**: Flow Testnet (Chain ID: 0x221)
- **Contract Name**: BulbFactory
- **Explorer**: [Flow Testnet Explorer](https://evm-testnet.flowscan.io/address/0xe68C1C1B6316507410FA5fC4E0Ab0400eECE30a1)

## Features

### 1. Profile Management

- **Create Profile**: Users can create their profile on-chain
- **Profile Count**: Track total number of profiles created
- **Profile Lookup**: Check if a user has a profile and get their profile address

### 2. Contract Functions

- `createProfile(username, profilePicture, description)` - Create a new profile
- `getProfilesCount()` - Get total number of profiles
- `getAllProfiles()` - Get all profile addresses
- `hasProfile(user)` - Check if user has a profile
- `getProfile(user)` - Get user's profile address

## Integration Components

### 1. Configuration (`src/config/contract.ts`)

- Contract ABI and address configuration
- Flow testnet network configuration
- Type-safe contract interface

### 2. Hooks

#### `useBulbFactory` (`src/hooks/useBulbFactory.ts`)

- Read-only contract interactions
- Fetches profiles count and all profiles
- Provides user profile lookup functionality

#### `useContractWrite` (`src/hooks/useContractWrite.ts`)

- Write operations to the contract
- Profile creation functionality
- Handles MetaMask integration and network switching

### 3. UI Components

#### `ProfilesCounter` (`src/components/ProfilesCounter.tsx`)

- Displays real-time profiles count from the contract
- Shows contract information and network details
- Available in both card and compact variants
- Includes refresh functionality and explorer links

## Usage Examples

### Display Profiles Count

```tsx
import ProfilesCounter from './components/ProfilesCounter';

// Card variant (full display)
<ProfilesCounter variant="card" />

// Compact variant (inline)
<ProfilesCounter variant="compact" />
```

### Check User Profile

```tsx
import { useBulbFactory } from './hooks/useBulbFactory';

const { checkUserProfile } = useBulbFactory();

const handleCheckProfile = async () => {
  const { hasProfile, profileAddress } = await checkUserProfile(userAddress);
  console.log('Has profile:', hasProfile);
  console.log('Profile address:', profileAddress);
};
```

### Create Profile

```tsx
import { useContractWrite } from './hooks/useContractWrite';

const { createProfile, isLoading, error } = useContractWrite();

const handleCreateProfile = async () => {
  try {
    const hash = await createProfile({
      username: 'john_doe',
      profilePicture: 'QmHash...',
      description: 'My awesome profile'
    }, userAddress);
    console.log('Transaction hash:', hash);
  } catch (error) {
    console.error('Failed to create profile:', error);
  }
};
```

### Display Individual Profile Data

```tsx
import { useProfileContract } from './hooks/useProfileContract';

const { profileInfo, isLoading, error } = useProfileContract(profileAddress);

return (
  <div>
    <h3>{profileInfo?.username}</h3>
    <img src={`https://ipfs.io/ipfs/${profileInfo?.profilePicture}`} alt="Profile" />
    <p>{profileInfo?.description}</p>
  </div>
);
```

### Listen to Contract Events (future extension)

Exemple réel d'écoute d'événements ProfileCreated avec viem :

```tsx
import { useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { bulbFactoryAbi, BULB_FACTORY_ADDRESS } from '../config/contract';

export function useProfileCreatedListener(onProfileCreated: (address: string, event: any) => void) {
  const client = usePublicClient();
  useEffect(() => {
    if (!client) return;
    const unwatch = client.watchContractEvent({
      address: BULB_FACTORY_ADDRESS,
      abi: bulbFactoryAbi,
      eventName: 'ProfileCreated',
      onLogs: logs => {
        logs.forEach(log => {
          const address = log.args?.profileAddress;
          onProfileCreated(address, log);
        });
      },
    });
    return () => unwatch();
  }, [client, onProfileCreated]);
}
```

### Subscription System (future extension)

Exemple réel d'abonnement/désabonnement à un profil :

```tsx
import { useProfileContract } from '../hooks/useProfileContract';

const { subscribe, unsubscribe } = useProfileContract(profileAddress);

// S'abonner à un profil (tierId = niveau d'abonnement)
await subscribe(tierId);

// Se désabonner d'un profil
await unsubscribe();
```

## Network Configuration

The integration is configured for Flow testnet:

```typescript
const FLOW_TESTNET = {
  id: 0x221,
  name: 'Flow Testnet',
  rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
  blockExplorers: ['https://evm-testnet.flowscan.io'],
}
```

## MetaMask Setup

To interact with the contract, users need to:

1. Install MetaMask browser extension
2. Add Flow testnet network (handled automatically by the app)
3. Have FLOW tokens for gas fees

The app automatically handles network switching and addition when users attempt to interact with the contract.

## Integration Points

### Layout Component

- ProfilesCounter added to mobile drawer sidebar
- Displays contract stats for all users

### Home Page

- ProfilesCounter in desktop sidebar
- Compact variant in mobile header
- Real-time updates of network activity

## Error Handling

The integration includes comprehensive error handling for:

- Network connection issues
- MetaMask not installed
- Wrong network
- Transaction failures
- Contract read/write errors

## Future Enhancements

1. **Profile Display**: Show individual profile data from contract
2. **Subscription System**: Integrate the profile subscription features
3. **Events Listening**: Real-time updates using contract events
4. **IPFS Integration**: Store profile data on IPFS and reference via contract
5. **Transaction Status**: Better UX for pending transactions

## Troubleshooting

### Common Issues

1. **MetaMask not detecting network**: Clear MetaMask cache and restart browser
2. **Transaction fails**: Ensure sufficient FLOW balance for gas fees
3. **Contract read errors**: Check network connectivity and RPC endpoint status
4. **Type errors**: Ensure viem is properly installed and configured

### Debug Information

The ProfilesCounter component includes debug information:

- Contract address
- Network information
- Real-time profiles count
- Connection status
- Links to block explorer
