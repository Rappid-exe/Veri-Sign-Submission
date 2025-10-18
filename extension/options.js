// Options page script for Veri-Sign Chrome Extension

document.addEventListener('DOMContentLoaded', async () => {
  const credentialsTextarea = document.getElementById('credentials')
  const saveBtn = document.getElementById('saveBtn')
  const clearBtn = document.getElementById('clearBtn')
  const statusDiv = document.getElementById('status')
  const currentCredentialsDiv = document.getElementById('currentCredentials')

  // Load current credentials
  await loadCurrentCredentials()

  // Save credentials
  saveBtn.addEventListener('click', async () => {
    try {
      const credentialsText = credentialsTextarea.value.trim()
      
      if (!credentialsText) {
        showStatus('Please enter credentials JSON', 'error')
        return
      }

      // Parse and validate JSON
      const credentials = JSON.parse(credentialsText)
      
      // Validate structure
      if (typeof credentials !== 'object') {
        throw new Error('Credentials must be an object')
      }

      // Save to chrome.storage
      await chrome.storage.local.set({ credentials })
      
      showStatus('✓ Credentials saved successfully!', 'success')
      await loadCurrentCredentials()
      
      // Clear textarea
      credentialsTextarea.value = ''
    } catch (error) {
      showStatus(`✗ Error: ${error.message}`, 'error')
    }
  })

  // Clear credentials
  clearBtn.addEventListener('click', async () => {
    if (confirm('Clear all credentials? This cannot be undone.')) {
      await chrome.storage.local.set({ credentials: {} })
      showStatus('✓ All credentials cleared', 'success')
      await loadCurrentCredentials()
    }
  })

  async function loadCurrentCredentials() {
    try {
      const result = await chrome.storage.local.get(['credentials'])
      const credentials = result.credentials || {}
      
      const credentialsList = Object.values(credentials)
      
      if (credentialsList.length === 0) {
        currentCredentialsDiv.innerHTML = '<em style="color: #666;">No credentials registered</em>'
      } else {
        currentCredentialsDiv.innerHTML = credentialsList.map(cred => `
          <div style="padding: 12px; background: #f5f5f5; border: 1px solid #ddd; margin-bottom: 8px;">
            <strong>${cred.name}</strong><br>
            <span style="color: #666;">${cred.description}</span><br>
            <span style="color: #666; font-size: 11px;">Asset ID: ${cred.assetId}</span>
          </div>
        `).join('')
      }
    } catch (error) {
      currentCredentialsDiv.innerHTML = `<em style="color: #dc2626;">Error loading credentials: ${error.message}</em>`
    }
  }

  function showStatus(message, type) {
    statusDiv.textContent = message
    statusDiv.className = `status ${type}`
    statusDiv.style.display = 'block'
    
    setTimeout(() => {
      statusDiv.style.display = 'none'
    }, 5000)
  }
})
