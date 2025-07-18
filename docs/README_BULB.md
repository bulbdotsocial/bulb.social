
# Bulb.social – Developer Documentation

This project is a decentralized web application built with **React**, **TypeScript**, **Vite**, and **MUI**. It integrates smart contracts (Flow testnet, EVM) for profile management, Web3 authentication, and content publishing. The application is a mobile-first PWA, installable and optimized for all devices.

## 🚀 Main Features

- **Progressive Web App**: installable, offline, fast
- **Mobile-first**: responsive, gestures, safe-area
- **On-chain profile management**: create, update, lookup
- **Wallet integration**: Privy + MetaMask, automatic fallback
- **MUI design**: custom theme, accessibility, consistency
- **Centralized hooks**: contract logic, cache, validation
- **Service Worker**: caching, offline, manifest

## 🛠️ Tech Stack

- **Frontend**: React 19.x
- **Language**: TypeScript
- **Build**: Vite
- **UI**: Material-UI (MUI)
- **PWA**: Vite PWA Plugin + Workbox
- **Contracts**: Flow testnet, EVM
- **Wallet**: Privy, MetaMask

## 📱 Mobile-first & PWA

- Touch interface, minimum 44px
- Responsive breakpoints (MUI)
- Safe-area, notches, viewport
- Installable on mobile and desktop
- Service worker: offline, caching
- Manifest: icons, colors, display

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
cd client
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

## 📦 PWA Features

- **Installation**: via browser, iOS/Android/Desktop
- **Manifest**: name, colors, icons, display
- **Service worker**: caching, offline, Workbox
- **Performance**: lazy loading, optimized bundle
- **Offline**: access to previously visited content

## 🎨 Design System

The MUI theme is defined in `client/src/theme.ts`:

- **Primary color**: #1976d2 (blue)
- **Secondary**: #ffa726 (orange)
- **Typography**: Roboto
- **Units**: 8px
- **Breakpoints**: mobile-first

Example:

```typescript
// client/src/theme.ts
export const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#ffa726' },
  },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});
```

## 📁 Project Structure

```
client/src/
├── components/
│   ├── ProfilePage.tsx           # User profile page
│   ├── UpdateProfileDialog.tsx   # Profile update dialog
│   ├── CreateProfileDialog.tsx   # Profile creation dialog
│   ├── ProfileUser.tsx           # User display (ENS + contract)
│   ├── InstagramFeed.tsx         # Main feed
│   ├── ProfilesCounter.tsx       # On-chain profiles counter
│   ├── TestCreateProfile.tsx     # Profile creation test
│   ├── ProfileUpdateExample.tsx  # Profile update example
│   ├── Layout.tsx                # Global layout/navigation
│   └── HomePage.tsx              # Homepage
├── hooks/
│   ├── useWalletContract.ts      # Unified wallet hook
│   ├── useProfileContract.ts     # On-chain profile reading
│   ├── useBulbFactory.ts         # Profile factory
│   └── useENS.ts                 # ENS resolution
├── config/
│   ├── contract.ts               # Main contract config
│   ├── profileContract.ts        # Profile contract ABI
├── theme.ts                      # MUI theme
├── App.tsx                       # React entry point
├── main.tsx                      # PWA + Privy registration
├── vite.config.ts                # Vite/PWA config
├── index.css                     # Global styles
```

## 🔧 PWA Configuration

### Manifest

- Name, short_name, colors, display, orientation, icons
- File: `client/public/manifest.json`

### Service Worker

- Workbox, precaching, runtime caching
- Config: `vite.config.ts`, registration in `main.tsx`

Registration example:

```typescript
// client/src/main.tsx
import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true });
```

## 🚧 Development & Best Practices

- TypeScript for safety
- ESLint for code quality
- Consistent component structure
- Centralize logic in hooks
- Use cache to optimize network calls
- Protect sensitive routes with `ProtectedRoute`
- Document each new component/hook in `docs`

### Mobile Testing

- Browser device simulator
- Tests on real devices
- Check gestures, responsiveness, PWA installation

## 🔮 Possible Extensions

- Advanced authentication
- Real-time idea sharing
- Push notifications
- Offline creation
- Social: likes, comments, sharing
- Search, filters, tags
- Enriched profiles, NFT, balances

---

## 📦 Integration Examples (from client)

### Profile Creation

```tsx
import { useWalletContract } from '../hooks/useWalletContract';
const { createProfile, isLoading, error } = useWalletContract();
await createProfile({ username, profilePicture, description }, user.wallet.address);
<CreateProfileDialog open={open} onClose={handleClose} onSuccess={handleSuccess} />
```

### Profile Update

```tsx
const { updateProfile, isLoading, error } = useWalletContract();
await updateProfile(profileContractAddress, { username, profilePicture, description }, user.wallet.address);
<UpdateProfileDialog open={open} onClose={handleClose} currentProfile={profileData} profileContractAddress={profileContractAddress} />
```

### Fetching Profile Info

```tsx
import { useProfileContract } from '../hooks/useProfileContract';
const { profileInfo, isLoading, error } = useProfileContract(profileAddress);
```

### User Display

```tsx
<ProfileUser address={address} showFullAddress avatarSize={48} />
```

### Navigation

```tsx
<Router>
  <Routes>
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/profile/:address" element={<UserProfilePage />} />
    <Route path="/" element={<InstagramFeed />} />
  </Routes>
</Router>
```

---

## 📚 Code References

- `client/src/components/ProfilePage.tsx`
- `client/src/components/UpdateProfileDialog.tsx`
- `client/src/components/CreateProfileDialog.tsx`
- `client/src/components/ProfileUser.tsx`
- `client/src/components/InstagramFeed.tsx`
- `client/src/hooks/useWalletContract.ts`
- `client/src/hooks/useProfileContract.ts`
- `client/src/hooks/useBulbFactory.ts`
- `client/src/config/contract.ts`
- `client/src/config/profileContract.ts`

---

For any extension, create a new component or hook in `client/src`, document it in the `docs` folder, and connect it via props/context.
