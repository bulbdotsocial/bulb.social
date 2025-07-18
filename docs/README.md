
# Bulb.social – Developer Documentation

This project is a decentralized web application built with **React**, **TypeScript**, **Vite**, and **MUI**. It integrates smart contracts (Flow testnet, EVM) for profile management, Web3 authentication, and content publishing.

## Client Structure

The `client` folder contains:

- **src/components/**: React components for UI and business logic (profile management, feed, login, etc.)
- **src/hooks/**: Custom hooks to interact with contracts, authentication, and business logic.
- **src/config/**: Contract configuration (ABI, addresses, chains).
- **src/contexts/**: React contexts for theme, user, etc.

## Main Integration Flows

### 1. Web3 Authentication

Authentication is managed via [Privy](https://www.privy.io/):

```tsx
import { PrivyProvider } from '@privy-io/react-auth';

<PrivyProvider
  appId="..."
  clientId="..."
  config={{
    defaultChain: base,
    supportedChains: [base, berachain, polygon, arbitrum, story, mantle, FLOW_TESTNET],
    embeddedWallets: { ethereum: { createOnLogin: 'users-without-wallets' } }
  }}
>
  <App />
</PrivyProvider>
```

### 2. Profile Management

#### Profile Creation

Use the `useWalletContract` hook and the `CreateProfileDialog` component:

```tsx
import { useWalletContract } from '../hooks/useWalletContract';

const { createProfile, isLoading, error } = useWalletContract();

// Example call:
await createProfile({ username, profilePicture, description }, user.wallet.address);
```

Integration example:

```tsx
<CreateProfileDialog open={open} onClose={handleClose} onSuccess={handleSuccess} />
```

#### Profile Update

Use the `useWalletContract` hook and the `UpdateProfileDialog` component:

```tsx
const { updateProfile, isLoading, error } = useWalletContract();
await updateProfile({ username, profilePicture, description }, profileContractAddress);
```

Integration example:

```tsx
<UpdateProfileDialog open={open} onClose={handleClose} currentProfile={profileData} profileContractAddress={address} />
```

#### Fetching Profile Info

Use the `useProfileContract` hook:

```tsx
import { useProfileContract } from '../hooks/useProfileContract';
const { profileInfo, isLoading, error } = useProfileContract(profileAddress);
```

### 3. Display and Navigation

Navigation is managed by React Router. Main routes are:

- `/login`: Login page
- `/profile`: Connected user's profile
- `/profile/:address`: Another user's profile
- `/explore`, `/activity`: Content feed

Integration example:

```tsx
<Router>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/*" element={
      <ProtectedRoute>
        <Layout>
          <Routes>
            <Route path="/" element={<InstagramFeed />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:address" element={<UserProfilePage />} />
          </Routes>
        </Layout>
      </ProtectedRoute>
    } />
  </Routes>
</Router>
```

### 4. Custom Hooks

- `useWalletContract`: Create/update profile, wallet interaction.
- `useProfileContract`: Read profile info.
- `useBulbFactory`: Check profile existence, retrieve profile addresses.
- `useENS`: ENS resolution for Ethereum addresses.

### 5. Component Integration Examples

**Display a user**:

```tsx
<ProfileUser address={address} showFullAddress avatarSize={48} />
```

**Instagram-like feed**:

```tsx
<InstagramFeed />
```

**Profile page**:

```tsx
<ProfilePage />
```

## Add or Modify a Feature

1. Create a new component in `src/components`.
2. If needed, create a hook in `src/hooks` for business logic or contract integration.
3. Use existing hooks to interface with contracts or authentication.
4. Add the corresponding route in `App.tsx`.
5. Test integration with existing components.

## Best Practices

- Use MUI for UI and visual consistency.
- Centralize contract logic in hooks.
- Use hook cache to optimize network calls.
- Protect sensitive routes with `ProtectedRoute`.
- Document each new component or hook in the `docs` folder.

---

For more examples, see the components:

- `CreateProfileDialog.tsx`
- `UpdateProfileDialog.tsx`
- `ProfilePage.tsx`
- `InstagramFeed.tsx`
- `ProfileUser.tsx`

And the hooks:

- `useWalletContract.ts`
- `useProfileContract.ts`
- `useBulbFactory.ts`

---

Contact: @bulb.social
