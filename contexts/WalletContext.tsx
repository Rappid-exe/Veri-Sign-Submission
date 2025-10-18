"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { connectWallet, disconnectWallet, reconnectWallet, peraWallet } from '@/lib/wallet'

interface WalletContextType {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  isLoading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Try to reconnect on mount
    reconnectWallet()
      .then((accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))

    // Listen for disconnect events
    peraWallet.connector?.on('disconnect', () => {
      setAddress(null)
    })
  }, [])

  const connect = async () => {
    try {
      setIsLoading(true)
      const accounts = await connectWallet()
      if (accounts.length > 0) {
        setAddress(accounts[0])
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    try {
      await disconnectWallet()
      setAddress(null)
    } catch (error) {
      console.error('Failed to disconnect:', error)
      throw error
    }
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        connect,
        disconnect,
        isLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
