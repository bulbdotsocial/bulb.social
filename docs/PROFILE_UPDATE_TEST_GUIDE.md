# Profile Update Test Guide

## Fixed Features

### 1. "Edit Profile" Button

✅ **FIXED**: The "Edit Profile" button now opens the profile update dialog

### 2. Profile Update

✅ **FIXED**: Profile updates (username, profile picture, description) now take effect

## How to Test

### Prerequisites

1. Have a connected wallet (Privy or MetaMask)
2. Be connected to the Flow Testnet network
3. Have an exclusive profile created

### Testing the "Edit Profile" Button (Integration Example)

In `ProfilePage.tsx`, the "Edit Profile" button opens the `UpdateProfileDialog` component:

```tsx
<Button
  variant="outlined"
  size="small"
  onClick={() => setUpdateProfileOpen(true)}
>
  Edit Profile
</Button>

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

The dialog is pre-filled with the current profile data and handles validation, loading state, and errors.

### Testing Profile Update

1. **Open the update dialog**:
   - Click "Edit Profile"
   - Check that fields are pre-filled with current data

2. **Edit information**:
   - **Username**: Change the username (minimum 3 characters, alphanumeric + _ and -)
   - **Profile picture**: Add an IPFS hash (optional) like `QmYourImageHash`
   - **Description**: Edit the description (minimum 10 characters)

3. **Validate changes**:
   - The "Update Profile" button should only be enabled if changes are detected
   - Click "Update Profile"
   - Approve the transaction in your wallet

4. **Verify the update**:
   - After transaction confirmation, the dialog closes
   - New data should appear on the profile page
   - Changes are persistent (reload the page to verify)

### Error Handling

1. **Incorrect network**:
   - The app automatically tries to switch to Flow Testnet
   - If it fails, switch manually

2. **Data validation**:
   - Username too short (< 3 characters): error displayed
   - Invalid username (special characters): error displayed
   - Description too short (< 10 characters): error displayed

3. **Transaction rejected**:
   - Appropriate error message displayed
   - Option to retry

## Technical Details Fixed

### 1. Profile Contract ABI

- Added `BULB_PROFILE_ABI` to interact with individual profile contracts
- Includes `updateProfile` and `getProfileInfo` functions

### 2. useWalletContract Hook

- Full implementation of the `updateProfile` function
- Client-side parameter validation
- Uses the correct ABI for profile contracts

### 3. useProfileContract Hook

- New hook to fetch profile data from the contract
- Manages cache and loading state
- Refresh function to update data

### 4. ProfilePage.tsx

- Integrated `useProfileContract` to display real data
- Retrieves profile contract address
- Correctly passes props to `UpdateProfileDialog`
- Refreshes data after update

### 5. UpdateProfileDialog.tsx

- Receives profile contract address
- Validates and submits updates
- Handles error and loading states

## Important Notes

1. **Required funds**: Make sure you have FLOW Testnet for transaction fees
2. **Permissions**: Only the profile creator can update it
3. **Limits**:
   - Username: max 50 characters
   - Description: max 500 characters
4. **IPFS**: Profile picture must be a valid IPFS hash (optional)

## Troubleshooting

### "Edit Profile" button does not appear

- Check that you have an exclusive profile created
- Check that your wallet is connected
- Reload the page

### Update fails

- Check your network connection
- Make sure you are on Flow Testnet
- Check that you have enough funds
- Check character limits

### Data does not update

- Wait a few seconds for transaction confirmation
- Reload the page if needed
- Check in the block explorer that the transaction was confirmed
