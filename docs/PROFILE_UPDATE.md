# Profile Page – Developer Integration Guide

This guide describes the full integration and extension points for the Profile Page in Bulb.social, based on the actual implementation in `client/src/components/ProfilePage.tsx` and related hooks/components.

## ✨ Main Features

### UI & Layout

- Large Avatar (ENS or initials)
- User Stats: posts, followers, following
- Profile Info: username, full name, bio, website
- Verification Badge: ENS domain
- Edit Profile Button (opens `UpdateProfileDialog`)

### Content Sections

- Posts Tab: grid layout, fetched from backend (IPFS images)
- Saved Tab: grid layout (future extension)
- Tab Navigation: MUI Tabs with icons
- Responsive Grid: 1:1 images, hover effects

### Mobile Optimization

- Responsive design (MUI breakpoints)
- Mobile stats bar
- Touch-friendly navigation
- Collapsible header

### Navigation Integration

- React Router v6: `/profile`, `/explore`, `/activity`, `/`
- Avatar click: navigates to profile
- Drawer menu for mobile
- Active state highlighting

## 🛣️ Available Routes

```text
/ (Home)          - Instagram feed
/profile          - User profile page
/explore          - Explore page (shows feed)
/activity         - Activity page (shows feed)
```

## 🎯 Navigation Methods

**Desktop:**

- Top navigation bar icons
- Profile avatar (header)
- Search bar (future)

**Mobile:**

- Drawer menu (hamburger)
- Menu item click
- Drawer auto-close

## 🔄 Profile Data Integration

Profile data is fetched and displayed using:

- `usePrivy` (user wallet)
- `useENS` (ENS name, avatar, verification)
- `useBulbFactory` (profile contract existence)
- `useProfileContract` (profile info from contract)

**Example:**

```tsx
const walletAddress = user?.wallet?.address;
const ensData = useENS(walletAddress);
const { checkUserProfile } = useBulbFactory();
const { profileInfo, refreshProfile } = useProfileContract(profileContractAddress);
```

## 📝 Profile Editing

Editing is handled via the `UpdateProfileDialog` component:

```tsx
<UpdateProfileDialog
  open={updateProfileOpen}
  onClose={() => setUpdateProfileOpen(false)}
  onSuccess={() => {
    refreshProfile();
    checkProfile();
  }}
  currentProfile={{
    username: profileData.username,
    profilePicture: profileInfo?.profilePicture || '',
    description: profileData.bio,
  }}
  profileContractAddress={profileContractAddress}
/>
```

Form validation and error handling are built-in (see `UpdateProfileDialog.tsx`). ENS info is displayed if available.

## 📦 Posts Integration

Posts are fetched from the backend and displayed in a grid:

```tsx
const fetchUserPosts = useCallback(async () => {
  const response = await fetch(`https://api.bulb.social/api/v0/profile/${walletAddress}`);
  // ...transform and set posts
});
```

## 🛠️ Extension Points

- Add NFT gallery, wallet info, token balances, minting (see Web3 Features)
- Add follow/unfollow, stories, post details, edit profile, settings (see Social Features)
- Connect real posts, image upload, search, notifications (see Enhanced Functionality)

## 🚀 Technical Stack

- React Router DOM v6
- TypeScript
- Material-UI
- Responsive design
- Optimized React components

## 🧑‍💻 Example: Full ProfilePage Integration

```tsx
import ProfilePage from './components/ProfilePage';

<Route path="/profile" element={<ProfilePage />} />
```

---

This page is ready for extension and integration with all Web3 and social features listed above. For any new feature, create a component/hook in `client/src`, use the existing hooks for contract/user data, and connect via props/context.
