// Background service worker for Veri-Sign Chrome Extension

const DEFAULT_APP_ID = 747976847;

// Credential Registry - matches lib/credentials.ts
// Add your registered credentials here
const CREDENTIAL_REGISTRY = {
  747995284: { 
    name: 'New York Times', 
    assetId: 747995284, 
    description: 'NYT Press' 
  }
}

// Load credentials from chrome.storage
async function loadCredentials() {
  try {
    const result = await chrome.storage.local.get(['credentials'])
    return result.credentials || CREDENTIAL_REGISTRY
  } catch (error) {
    console.error('Failed to load credentials:', error)
    return CREDENTIAL_REGISTRY
  }
}

// Create context menu on installation
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: 'verifyWithVerisign',
    title: 'Verify with Veri-Sign',
    contexts: ['image', 'video', 'audio', 'link']
  });
  
  // Initialize storage with default App ID if not set
  const result = await chrome.storage.local.get(['appId']);
  if (!result.appId) {
    await chrome.storage.local.set({ appId: DEFAULT_APP_ID });
    console.log('Initialized App ID:', DEFAULT_APP_ID);
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'verifyWithVerisign') {
    handleVerification(info, tab);
  }
});

// Helper function to safely send messages to content script
async function safeSendMessage(tabId, message) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    // Content script might not be ready or tab might be closed
    console.log('Could not send message to content script:', error.message);
  }
}

async function handleVerification(info, tab) {
  let mediaUrl = null;

  if (info.srcUrl) {
    mediaUrl = info.srcUrl;
  } else if (info.linkUrl) {
    mediaUrl = info.linkUrl;
  }

  if (!mediaUrl) {
    showNotification('Error', 'No media found to verify');
    return;
  }

  // Send message to content script to show loading state
  await safeSendMessage(tab.id, {
    type: 'VERIFICATION_STARTED',
    url: mediaUrl
  });

  try {
    // Fetch the media file
    const response = await fetch(mediaUrl);
    const blob = await response.blob();
    
    // Convert to array buffer and hash it
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const fileHash = '0x' + hashHex;

    // Verify the attestation
    const result = await verifyAttestation(fileHash);

    // Send result to content script
    await safeSendMessage(tab.id, {
      type: 'VERIFICATION_COMPLETE',
      url: mediaUrl,
      hash: fileHash,
      result: result
    });
    
    // Show notification with result
    if (result) {
      showNotification('✓ Verified', `Content verified on blockchain`);
    } else {
      showNotification('Not Found', 'No attestation found for this content');
    }

  } catch (error) {
    console.error('Verification failed:', error);
    await safeSendMessage(tab.id, {
      type: 'VERIFICATION_ERROR',
      url: mediaUrl,
      error: error.message
    });
    
    // Show error notification
    showNotification('Verification Failed', error.message);
  }
}

async function verifyAttestation(fileHash) {
  // Get App ID from storage, fallback to default
  const result = await chrome.storage.local.get(['appId']);
  const VERISIGN_APP_ID = result.appId || DEFAULT_APP_ID;
  
  console.log('=== VERIFICATION START ===');
  console.log('App ID:', VERISIGN_APP_ID);

  const cleanHex = fileHash.startsWith('0x') ? fileHash.slice(2) : fileHash;
  const hashBytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    hashBytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }

  // Create box name with 'a' prefix
  const boxNameArray = new Uint8Array([97, ...hashBytes]); // 97 = 'a' prefix
  
  try {
    // Convert to base64 encoding - handle large arrays properly
    let binaryString = '';
    for (let i = 0; i < boxNameArray.length; i++) {
      binaryString += String.fromCharCode(boxNameArray[i]);
    }
    const boxName = btoa(binaryString);
    // Algorand API requires format: "encoding:value"
    const boxNameParam = `b64:${boxName}`;
    const encodedBoxName = encodeURIComponent(boxNameParam);
    const apiUrl = `https://testnet-api.algonode.cloud/v2/applications/${VERISIGN_APP_ID}/box?name=${encodedBoxName}`;
    
    console.log('File hash:', fileHash);
    console.log('Hash bytes length:', hashBytes.length);
    console.log('Box name array length:', boxNameArray.length);
    console.log('Box name (base64):', boxName);
    console.log('Box name param:', boxNameParam);
    console.log('Encoded box name:', encodedBoxName);
    console.log('Full API URL:', apiUrl);
    console.log('Making fetch request...');
    
    const response = await fetch(apiUrl);
    
    // Get response body for better error messages
    const responseText = await response.text();
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('No attestation found (404)');
        return null; // No attestation found
      }
      console.error('API Error Response:', responseText);
      throw new Error(`Failed to query blockchain: ${response.status} - ${responseText.substring(0, 100)}`);
    }
    
    const data = JSON.parse(responseText);

    const value = Uint8Array.from(atob(data.value), c => c.charCodeAt(0));

    if (value.length < 40) {
      return null;
    }

    // Extract creator address (first 32 bytes)
    const creatorBytes = value.slice(0, 32);
    const creatorAddress = encodeAddress(creatorBytes);

    // Extract timestamp (next 8 bytes)
    const timestampBytes = value.slice(32, 40);
    let timestamp = 0;
    for (let i = 0; i < 8; i++) {
      timestamp = (timestamp * 256) + timestampBytes[i];
    }

    // Check for credential ASA (Layer 2)
    const organization = await checkCredentialForAddress(creatorAddress);

    return {
      creatorAddress,
      timestamp,
      verified: true,
      organization: organization // Add organization info if found
    };

  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return null;
    }
    console.error('Blockchain query error:', error);
    throw new Error(`Blockchain query failed: ${error.message}`);
  }
}

/**
 * Check if an address holds a credential from any registered organization
 */
async function checkCredentialForAddress(address) {
  try {
    const credentials = await loadCredentials();
    const credentialAssetIds = Object.keys(credentials).map(id => parseInt(id));
    
    if (credentialAssetIds.length === 0) {
      return null; // No credentials registered
    }

    // Query Algorand Indexer for account assets
    const indexerUrl = `https://testnet-idx.algonode.cloud/v2/accounts/${address}`;
    const response = await fetch(indexerUrl);
    
    if (!response.ok) {
      console.warn('Failed to query indexer for credentials');
      return null;
    }

    const accountInfo = await response.json();
    
    if (!accountInfo.account || !accountInfo.account.assets) {
      return null;
    }

    // Check if the account holds any registered credential ASAs
    for (const asset of accountInfo.account.assets) {
      const assetId = asset['asset-id'];
      
      if (credentials[assetId] && asset.amount > 0) {
        return credentials[assetId]; // Return organization info
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to check credentials:', error);
    return null;
  }
}

// Simplified address encoding for extension
function encodeAddress(bytes) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

function showNotification(title, message) {
  // Try with icon, fallback to console if it fails
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon48.png'),
    title: title,
    message: message
  }).catch(err => {
    console.log('Notification:', title, '-', message);
    console.log('Notification error:', err.message);
  });
}