# 🧪 Test Guide - Buffer/Wallet Fix

## ✅ Fixes Applied

1. **Buffer polyfill** added in `src/polyfills.ts`
2. **Vite configuration** updated with Node.js polyfills
3. **Debug logs** added in `useWalletContract`
4. **Improved error handling**
5. **Test component** created

## 🔧 Steps to Test

### 1. Check the Environment

```bash
# The server should be started with:

```

### 2. Open Browser Console

- F12 → Console
- Check that there are no errors on load

### 3. Check Polyfills

In the console, type:

```javascript
console.log('Buffer available:', typeof Buffer !== 'undefined');
console.log('Global Buffer:', typeof window.Buffer !== 'undefined');
```

### 4. Test with the Test Component

Temporarily add to your app (e.g. `App.tsx`):

```tsx
import TestCreateProfile from './components/TestCreateProfile';

// In JSX
<TestCreateProfile />
```

### 5. Test Profile Creation

1. **Connect** with Privy or MetaMask
2. **Click** on "Test Create Profile"
3. **Observe** logs in the console and success/error alert
4. **Verify** that the transaction goes through and the success message appears

Component code example:

```tsx
const { createProfile, isLoading, error } = useWalletContract();
const [formData, setFormData] = useState({
  username: 'TestUser' + Date.now().toString().slice(-4),
  profilePicture: '',
  description: 'Test profile created to validate wallet integration'
});
const [success, setSuccess] = useState<string | null>(null);

const handleTest = async () => {
  if (!user?.wallet?.address) {
    alert('Please connect your wallet first');
    return;
  }
  try {
    setSuccess(null);
    const txHash = await createProfile(formData, user.wallet.address as `0x${string}`);
    setSuccess(`✅ Profile created successfully! Transaction: ${txHash}`);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};
```

## 📊 Expected Logs

### Success Logs

```text
🔍 Getting wallet client...
Available wallets: 1
User wallet address: 0x...
🔄 Trying Privy wallet provider...
✅ Privy provider obtained: true
✅ Privy wallet client created successfully
🚀 Starting contract write execution...
Contract: 0xe68C1C1B6316507410FA5fC4E0Ab0400eECE30a1
Function: createProfile
Args: ["TestUser1234", "", "Test profile..."]
User address: 0x...
🔄 Attempting network switch...
📡 Using Privy provider for network switch
📝 Writing to contract...
✅ Transaction submitted successfully! Hash: 0x...
```

### If Buffer Error Persists

```text
❌ Contract write execution failed: Can't find variable: Buffer
```

→ **Action**: Check that polyfills are loaded

## �️ Alternative solutions if the problem persists

### Option 1: Force the global polyfill

Add to `index.html`:

```html
<script>
  if (typeof global === 'undefined') {
    var global = globalThis;
  }
</script>
```

### Option 2: Use a CDN for Buffer

Add to `index.html`:

```html
<script src="https://unpkg.com/buffer@6.0.3/index.js"></script>
```

### Option 3: Alternative Vite configuration

In `vite.config.ts`:

```typescript
define: {
  global: 'globalThis',
  'process.env': {}
},
resolve: {
  alias: {
    buffer: 'buffer',
    process: 'process/browser',
    stream: 'stream-browserify',
    util: 'util'
  }
}
```

```

## 🎯 Expected Results

✅ **Success**: Transaction created without Buffer error
✅ **Clear logs**: Debug messages visible
✅ **Fallback**: If Privy fails, MetaMask takes over
✅ **Errors handled**: Understandable error messages

## 🚨 Potential Issues

### 1. Buffer still not defined

- Check the order of imports in `main.tsx`
- The polyfill must be the first import

### 2. Network error

- Check that Flow Testnet is configured
- Check that the user has FLOW tokens

### 3. Privy/MetaMask conflict

- Disconnect then reconnect the wallet
- Clear the browser cache

## 📞 Support

If the problem persists:

1. **Copy the logs** from the console
2. **Note** which wallet is used (Privy/MetaMask)
3. **Check** the version of viem and dependencies
4. **Test** on another browser

---

**🎉 Once it works, you can remove the test component and use normal profile creation!**
