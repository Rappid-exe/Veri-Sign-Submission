import algosdk from 'algosdk'

// Algorand TestNet configuration
export const ALGORAND_CONFIG = {
  algodToken: '',
  algodServer: 'https://testnet-api.algonode.cloud',
  algodPort: 443,
  indexerServer: 'https://testnet-idx.algonode.cloud',
  indexerPort: 443,
}

// Initialize Algod client for transactions
export const algodClient = new algosdk.Algodv2(
  ALGORAND_CONFIG.algodToken,
  ALGORAND_CONFIG.algodServer,
  ALGORAND_CONFIG.algodPort
)

// Initialize Indexer client for queries
export const indexerClient = new algosdk.Indexer(
  ALGORAND_CONFIG.algodToken,
  ALGORAND_CONFIG.indexerServer,
  ALGORAND_CONFIG.indexerPort
)

// Your deployed contract app ID
export const VERISIGN_APP_ID = 747976847

/**
 * Generate SHA-256 hash of a file
 */
export async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return '0x' + hashHex
}

/**
 * Convert hex hash to Uint8Array for Algorand
 */
export function hexToUint8Array(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16)
  }
  return bytes
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmation(txId: string): Promise<any> {
  const status = await algodClient.status().do()
  let lastRound = status.lastRound
  
  while (true) {
    const pendingInfo = await algodClient.pendingTransactionInformation(txId).do()
    
    if (pendingInfo.confirmedRound && pendingInfo.confirmedRound > 0) {
      return pendingInfo
    }
    
    lastRound++
    await algodClient.statusAfterBlock(lastRound).do()
  }
}

/**
 * Format Algorand address for display (truncated)
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
}
