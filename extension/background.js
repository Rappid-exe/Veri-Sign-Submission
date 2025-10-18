// Background service worker for Veri-Sign Chrome Extension

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'verifyWithVerisign',
    title: 'Verify with Veri-Sign',
    contexts: ['image', 'video', 'audio', 'link']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'verifyWithVerisign') {
    handleVerification(info, tab);
  }
});

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
  chrome.tabs.sendMessage(tab.id, {
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
    chrome.tabs.sendMessage(tab.id, {
      type: 'VERIFICATION_COMPLETE',
      url: mediaUrl,
      hash: fileHash,
      result: result
    });

  } catch (error) {
    console.error('Verification failed:', error);
    chrome.tabs.sendMessage(tab.id, {
      type: 'VERIFICATION_ERROR',
      url: mediaUrl,
      error: error.message
    });
  }
}

async function verifyAttestation(fileHash) {
  const VERISIGN_APP_ID = 0; // TODO: Update with actual deployed app ID
  
  if (VERISIGN_APP_ID === 0) {
    throw new Error('Contract not deployed. Please configure the app ID.');
  }

  const cleanHex = fileHash.startsWith('0x') ? fileHash.slice(2) : fileHash;
  const hashBytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    hashBytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }

  const boxNameArray = new Uint8Array([97, ...hashBytes]); // 97 = 'a' prefix
  const boxName = btoa(String.fromCharCode(...boxNameArray));

  try {
    const response = await fetch(
      `https://testnet-api.algonode.cloud/v2/applications/${VERISIGN_APP_ID}/box?name=${encodeURIComponent(boxName)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No attestation found
      }
      throw new Error('Failed to query blockchain');
    }

    const data = await response.json();
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

    return {
      creatorAddress,
      timestamp,
      verified: true
    };

  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return null;
    }
    throw error;
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
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message
  });
}