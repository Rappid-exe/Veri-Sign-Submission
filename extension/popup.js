// Popup script for Veri-Sign Chrome Extension

document.addEventListener('DOMContentLoaded', () => {
  // Open web app button
  const openWebAppBtn = document.getElementById('openWebApp');
  openWebAppBtn.addEventListener('click', () => {
    chrome.tabs.create({
      url: 'http://localhost:3000' // Update with your deployed URL
    });
  });

  // Open settings button
  const openSettingsBtn = document.getElementById('openSettings');
  openSettingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // GitHub link
  const githubLink = document.getElementById('githubLink');
  githubLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://github.com/yourusername/verisign' // Update with your repo
    });
  });

  // Check app ID configuration
  checkConfiguration();
});

async function checkConfiguration() {
  const statusDiv = document.querySelector('.status');
  
  try {
    const result = await chrome.storage.local.get(['appId']);
    
    if (!result.appId || result.appId === 0) {
      statusDiv.innerHTML = `
        <strong>Status:</strong> ⚠️ Not configured<br>
        <small>Please set the App ID in extension settings</small>
      `;
      statusDiv.style.borderLeftColor = '#fb923c';
    } else {
      statusDiv.innerHTML = `
        <strong>Status:</strong> ✓ Ready to verify<br>
        <small>App ID: ${result.appId}</small>
      `;
      statusDiv.style.borderLeftColor = '#22c55e';
    }
  } catch (error) {
    console.error('Failed to check configuration:', error);
  }
}