// Content script for Veri-Sign Chrome Extension
// Displays verification results on the page

let currentOverlay = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'VERIFICATION_STARTED':
      showVerificationOverlay('Verifying...', 'loading');
      break;
    case 'VERIFICATION_COMPLETE':
      if (message.result) {
        // Check if organization info is available (Layer 2)
        if (message.result.organization) {
          showVerificationOverlay(
            `✓ VERIFIED BY ${message.result.organization.name.toUpperCase()}\n${message.result.organization.description}\nTimestamp: ${formatTimestamp(message.result.timestamp)}`,
            'success',
            message.result.organization.name
          );
        } else {
          showVerificationOverlay(
            `✓ VERIFIED\nCreator: ${formatAddress(message.result.creatorAddress)}\nTimestamp: ${formatTimestamp(message.result.timestamp)}`,
            'success'
          );
        }
      } else {
        showVerificationOverlay('✗ NOT VERIFIED\nNo signature found on blockchain', 'error');
      }
      break;
    case 'VERIFICATION_ERROR':
      showVerificationOverlay(`✗ ERROR\n${message.error}`, 'error');
      break;
  }
});

function showVerificationOverlay(message, status, organizationName = null) {
  // Remove existing overlay
  if (currentOverlay) {
    currentOverlay.remove();
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    min-width: 300px;
    max-width: 400px;
    padding: 20px;
    border: 2px solid #000;
    background: ${status === 'success' ? '#dcfce7' : status === 'error' ? '#fee2e2' : '#f5f5f5'};
    color: #000;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
  `;

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '✕';
  closeButton.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #000;
    font-weight: bold;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  closeButton.onclick = () => overlay.remove();

  // Add title
  const title = document.createElement('div');
  title.textContent = 'VERI-SIGN®';
  title.style.cssText = `
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  `;

  // Add organization badge if available
  if (organizationName && status === 'success') {
    const badge = document.createElement('div');
    badge.textContent = organizationName.toUpperCase();
    badge.style.cssText = `
      display: inline-block;
      background: #16a34a;
      color: white;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      border: 2px solid #000;
    `;
    overlay.appendChild(closeButton);
    overlay.appendChild(title);
    overlay.appendChild(badge);
  } else {
    overlay.appendChild(closeButton);
    overlay.appendChild(title);
  }

  // Add message
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    margin-top: 8px;
  `;

  overlay.appendChild(messageDiv);
  document.body.appendChild(overlay);

  currentOverlay = overlay;

  // Auto-remove after 10 seconds (except for loading)
  if (status !== 'loading') {
    setTimeout(() => {
      if (currentOverlay === overlay) {
        overlay.remove();
        currentOverlay = null;
      }
    }, 10000);
  }
}

function formatAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}