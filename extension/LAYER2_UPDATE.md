# Chrome Extension - Layer 2 Update

## 🎉 What's New

The Chrome extension now supports **Layer 2 credential checking**! When you verify content, the extension will:

1. ✅ Check if the file has an attestation (Layer 1)
2. ✅ Check if the creator holds a credential ASA (Layer 2)
3. ✅ Display "✓ VERIFIED BY [ORGANIZATION]" instead of just wallet address

## 🚀 Setup Instructions

### Step 1: Reload the Extension

1. Go to `chrome://extensions/`
2. Find "Veri-Sign"
3. Click the **refresh icon** 🔄

### Step 2: Configure Credentials

You need to sync credentials from your web app to the extension:

#### Method 1: Using Extension Settings (Recommended)

1. **Right-click** the Veri-Sign extension icon
2. Click **"Options"** or **"Settings"**
3. Follow the instructions on the settings page:
   - Go to `localhost:3000/admin` in your web app
   - Create credentials
   - Open browser console (F12)
   - Run: `JSON.stringify(JSON.parse(localStorage.getItem('verisign-credentials')))`
   - Copy the output
   - Paste into extension settings
   - Click "Save Credentials"

#### Method 2: Manual Code Edit

Edit `extension/background.js` and update the `CREDENTIAL_REGISTRY`:

```javascript
const CREDENTIAL_REGISTRY = {
  123456: { 
    name: 'Reuters', 
    assetId: 123456, 
    description: 'Reuters Press Pass' 
  },
  789012: {
    name: 'Demo News',
    assetId: 789012,
    description: 'Demo News Press Pass'
  }
}
```

### Step 3: Test It!

1. Sign content with a wallet that holds a credential
2. Right-click the image on any website
3. Select "Verify with Veri-Sign"
4. See the enhanced result: **"✓ VERIFIED BY REUTERS"**

## 📋 New Features

### Enhanced Verification Display

**Before (Layer 1 only):**
```
✓ VERIFIED
Creator: VHFHRB...WALI
Timestamp: 2025-10-18 13:24:10 UTC
```

**After (Layer 2):**
```
✓ VERIFIED BY REUTERS
Reuters Press Pass
Timestamp: 2025-10-18 13:24:10 UTC
```

### Organization Badge

When an organization credential is detected, a green badge appears with the organization name.

### Settings Page

- View current registered credentials
- Add new credentials via JSON import
- Clear all credentials
- Sync with web app credentials

## 🔧 Technical Details

### How Credential Checking Works

1. Extension verifies the attestation (Layer 1)
2. Extracts creator wallet address
3. Queries Algorand Indexer for account assets
4. Checks if any held assets match registered credential ASAs
5. Displays organization name if match found

### Performance

- Credential check adds ~500ms to verification time
- Results are cached for the session
- No additional blockchain transactions required

## 🐛 Troubleshooting

### "No organization found" but I have credentials

1. Check that credentials are saved in extension settings
2. Verify the Asset ID matches what's in your wallet
3. Ensure you have at least 1 unit of the credential ASA
4. Check browser console for errors

### Settings page not showing

1. Right-click extension icon → Options
2. Or go to `chrome://extensions/` → Veri-Sign → Details → Extension options

### Credentials not syncing

1. Make sure you're copying the full JSON from localStorage
2. Verify JSON format is correct (use a JSON validator)
3. Try clearing and re-adding credentials

## 📱 New UI Elements

### Popup Updates

- Added "Settings" button to access credential configuration
- Status now shows if credentials are configured

### Overlay Updates

- Organization badge for verified organizations
- Enhanced messaging for Layer 2 verification
- Consistent styling with web app

## 🎯 Demo Tips

1. **Pre-configure credentials** before demo
2. **Test on multiple images** - some with credentials, some without
3. **Show the contrast** between Layer 1 and Layer 2 results
4. **Highlight the settings page** to show how easy it is to configure

## 🔄 Keeping Credentials in Sync

Whenever you create new credentials in the web app:

1. Go to extension settings
2. Copy credentials from web app console
3. Paste and save in extension
4. Credentials are now synced!

For production, this could be automated with a sync API.
