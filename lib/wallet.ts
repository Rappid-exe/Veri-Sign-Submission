"use client"

import { PeraWalletConnect } from '@perawallet/connect'

// Initialize Pera Wallet
export const peraWallet = new PeraWalletConnect({
  chainId: 416002, // TestNet chain ID (416001 for MainNet)
})

export interface WalletState {
  address: string | null
  isConnected: boolean
}

/**
 * Connect to Pera Wallet
 */
export async function connectWallet(): Promise<string[]> {
  try {
    const accounts = await peraWallet.connect()
    return accounts
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw error
  }
}

/**
 * Disconnect from Pera Wallet
 */
export async function disconnectWallet(): Promise<void> {
  try {
    await peraWallet.disconnect()
  } catch (error) {
    console.error('Failed to disconnect wallet:', error)
    throw error
  }
}

/**
 * Reconnect to previously connected wallet
 */
export async function reconnectWallet(): Promise<string[]> {
  try {
    const accounts = await peraWallet.reconnectSession()
    return accounts
  } catch (error) {
    // No previous session
    return []
  }
}
