# Create Profile Feature

This document describes the comprehensive profile creation functionality integrated into the Bulb social media platform.

## Overview

The `createProfile` function allows users to create private, monetized profiles on the Flow testnet blockchain. Each profile is deployed as a smart contract, enabling content monetization and subscription management.

## Key Features

### 🔗 **Smart Contract Integration**

- **Factory Contract**: `BulbFactory` at `0xe68C1C1B6316507410FA5fC4E0Ab0400eECE30a1`
- **Network**: Flow Testnet (Chain ID: 0x221)
- **Profile Creation**: Each user gets their own profile contract address
- **On-chain Storage**: Username, profile picture (IPFS hash), and description

### 🎯 **ENS Integration**

- **Auto-fill Username**: Automatically populates username with ENS name if available, using the hook `useENS` from `src/hooks/useENS.ts`.
- **Manual Override**: Users can manually define username if no ENS or prefer a different name. The ENS name is only a suggestion and can be changed in the form.
- **Validation**: Ensures username meets requirements (3+ characters, alphanumeric + underscore/dash). Validation is performed both in the UI and before contract interaction.

**Example from `CreateProfileDialog.tsx`:**

```typescript
import { useENS } from '../hooks/useENS';

const ensData = useENS(userAddress);

useEffect(() => {
  if (ensData.name && !formData.username) {
    setFormData(prev => ({
      ...prev,
      username: ensData.name || '',
    }));
  }
}, [ensData.name, formData.username]);
```

The ENS name is fetched and, if available, pre-fills the username field. The user can always edit or override this value before submitting the profile creation.

### 🚀 **User Experience**

- **Multi-step Dialog**: Guided profile creation process
- **Profile Check**: Automatically detects if user already has a profile
- **MetaMask Integration**: Handles wallet connection and network switching
- **Real-time Validation**: Form validation with helpful error messages

## Components

### 1. CreateProfileDialog (`src/components/CreateProfileDialog.tsx`)

**Features:**

- 3-step wizard interface
- ENS auto-detection and username pre-filling
- Form validation and error handling
- MetaMask integration with automatic network switching
- Profile existence check to prevent duplicates

**Steps:**

1. **Profile Check**: Verifies user doesn't already have a profile
2. **Profile Details**: Username, profile picture (IPFS), description
3. **Monetization Setup**: Information about monetization features

**Props:**

```typescript
interface CreateProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (profileAddress: string) => void;
}
```

### 2. Contract Integration Hooks

#### `useContractWrite` (`src/hooks/useContractWrite.ts`)

- Handles profile creation transactions
- MetaMask integration and network management
- Error handling and loading states

#### `useBulbFactory` (`src/hooks/useBulbFactory.ts`)

- Profile existence checking
- Profile count and statistics
- Read-only contract interactions

## User Flow

### 1. **Access Points**

Users can create profiles from:

- **Homepage**: Floating Action Button (FAB) with profile icon
- **Navigation Drawer**: "Create Profile" menu item (highlighted in primary color)

### 2. **Profile Creation Process**

#### Step 1: Profile Check

- Automatically checks if user already has a profile
- If profile exists, shows warning and prevents creation
- If no profile, proceeds to profile details

#### Step 2: Profile Information

- **Username Field**:
  - Auto-filled with ENS name if available
  - Manual entry if no ENS or user prefers different name
  - Validation: 3+ characters, alphanumeric + underscore/dash only
- **Profile Picture**: Optional IPFS hash
- **Description**: Required, minimum 10 characters

#### Step 3: Monetization Setup

- Information about monetization capabilities
- Profile summary review
- Transaction confirmation

### 3. **Blockchain Transaction**

- Automatic network switching to Flow testnet
- Gas fee estimation and payment
- Transaction confirmation and success handling

## Technical Implementation

### Form Validation

```typescript
const validateForm = (): boolean => {
  const errors: Partial<CreateProfileParams> = {};
  
  // Username validation
  if (!formData.username.trim()) {
    errors.username = 'Username is required';
  } else if (formData.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
    errors.username = 'Username can only contain letters, numbers, underscore, and dash';
  }
  
  // Description validation
  if (!formData.description.trim()) {
    errors.description = 'Description is required';
  } else if (formData.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }
  
  return Object.keys(errors).length === 0;
};
```

### ENS Integration

```typescript
// Auto-fill username with ENS name if available
useEffect(() => {
  if (ensData.name && !formData.username) {
    setFormData(prev => ({
      ...prev,
      username: ensData.name || '',
    }));
  }
}, [ensData.name, formData.username]);
```

### Profile Existence Check

```typescript
const checkProfile = async () => {
  if (userAddress && open) {
    try {
      const { hasProfile } = await checkUserProfile(userAddress as `0x${string}`);
      setHasExistingProfile(hasProfile);
      if (!hasProfile) {
        setActiveStep(1); // Skip to profile details
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  }
};
```

## Monetization Features

### Profile Benefits

Once created, profiles enable:

1. **Subscription Management**: Set up tiered subscription models
2. **Content Gating**: Control access to premium content
3. **Direct Payments**: Receive payments directly to wallet
4. **Analytics**: Track subscriber metrics and earnings
5. **On-chain Reputation**: Build verifiable reputation through blockchain activity

### Smart Contract Architecture

- **Factory Pattern**: Central factory creates individual profile contracts
- **Ownership Model**: Profile creator becomes contract owner
- **Subscription Logic**: Built-in subscription and payment handling
- **Event Emission**: ProfileCreated events for indexing and notifications

### Error Handling & Validation Integration Examples

#### 1. Handling MetaMask Not Installed

```tsx
if (!window.ethereum) {
  setError('MetaMask is not installed. Please install MetaMask to continue.');
  return;
}
```

#### 2. Wrong Network Handling

```typescript
import { FLOW_TESTNET } from '../config/contract';

const switchNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: FLOW_TESTNET.id }],
    });
  } catch (err) {
    setError('Please switch to the Flow Testnet network.');
  }
};
```

#### 3. Insufficient Gas

```tsx
if (error?.message?.includes('insufficient funds')) {
  setError('You need more FLOW tokens to pay for gas.');
}
```

#### 4. Profile Already Exists

```tsx
if (hasExistingProfile) {
  setError('You already have a profile.');
  return;
}
```

#### 5. Transaction Failure

```tsx
try {
  await createProfile(...);
} catch (error) {
  setError('Transaction failed: ' + (error?.message || error));
}
```

#### 6. Form Validation Example (Inline)

```tsx
<TextField
  label="Username"
  value={formData.username}
  error={!!errors.username}
  helperText={errors.username}
  onChange={handleChange}
/>

<TextField
  label="Description"
  value={formData.description}
  error={!!errors.description}
  helperText={errors.description}
  onChange={handleChange}
/>
```

#### 7. Loading & Success Feedback

```tsx
{isLoading && <CircularProgress />}
{success && <Alert severity="success">{success}</Alert>}
{error && <Alert severity="error">{error}</Alert>}
```

These examples show how to integrate error handling and validation directly in your React components, using state variables like `error`, `success`, and `isLoading` to provide real-time feedback to the user.

## Future Enhancements

### Planned Features

1. **Profile Templates**: Pre-built profile configurations for different creator types
2. **IPFS Integration**: Direct upload and pinning of profile pictures
3. **Social Features**: Follow/unfollow functionality
4. **Content Publishing**: Direct publishing tools for premium content
5. **Analytics Dashboard**: Comprehensive creator analytics

### Technical Improvements

1. **Gas Optimization**: Optimize contract calls for lower fees
2. **Offline Support**: Queue transactions for later execution
3. **Multi-chain Support**: Expand to other EVM-compatible chains
4. **Advanced Validation**: Real-time username availability checking

## Usage Examples

### Basic Integration

```typescript
import CreateProfileDialog from './components/CreateProfileDialog';

const [createProfileOpen, setCreateProfileOpen] = useState(false);

return (
  <>
    <Button onClick={() => setCreateProfileOpen(true)}>
      Create Profile
    </Button>
    
    <CreateProfileDialog
      open={createProfileOpen}
      onClose={() => setCreateProfileOpen(false)}
      onSuccess={(profileAddress) => {
        console.log('Profile created at:', profileAddress);
        // Handle success (e.g., redirect, show success message)
      }}
    />
  </>
);
```

### With Custom Success Handler

```typescript
const handleProfileCreated = (profileAddress: string) => {
  // Update UI state
  setUserHasProfile(true);
  
  // Show success notification
  showNotification('Profile created successfully!');
  
  // Redirect to profile page
  navigate('/profile');
  
  // Refresh profile data
  refetchProfileData();
};
```

## Security Considerations

### Input Validation

- Client-side validation for UX
- Smart contract validation for security
- Sanitization of user inputs

### Contract Security

- OpenZeppelin contracts for battle-tested security
- Ownership controls and access restrictions
- Reentrancy protection

### User Privacy

- Optional profile information
- User-controlled data sharing
- IPFS for decentralized storage

This comprehensive profile creation system provides a seamless onboarding experience for creators while maintaining the security and decentralization benefits of blockchain technology.
