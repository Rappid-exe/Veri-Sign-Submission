import algosdk from 'algosdk'
import { algodClient, indexerClient, VERISIGN_APP_ID, hexToUint8Array, waitForConfirmation } from './algorand'
import { peraWallet } from './wallet'

export interface Attestation {
  creatorAddress: string
  timestamp: number
  blockNumber: number
  txId: string
}

/**
 * Create an attestation (signature) for a file hash
 */
export async function createAttestation(
  fileHash: string,
  senderAddress: string
): Promise<Attestation> {
  if (VERISIGN_APP_ID === 0) {
    throw new Error('Contract not deployed. Please update VERISIGN_APP_ID in lib/algorand.ts')
  }

  try {
    // Get suggested params
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Convert hex hash to Uint8Array
    const hashBytes = hexToUint8Array(fileHash)

    // Create ABI method object
    const abiMethod = new algosdk.ABIMethod({
      name: 'attest',
      args: [{ type: 'byte[]', name: 'file_hash' }],
      returns: { type: '(address,uint64)' },
    })

    // Use AtomicTransactionComposer for ABI calls
    const atc = new algosdk.AtomicTransactionComposer()
    
    atc.addMethodCall({
      appID: VERISIGN_APP_ID,
      method: abiMethod,
      methodArgs: [hashBytes],
      sender: senderAddress,
      suggestedParams,
      signer: {
        addr: senderAddress,
        signTxn: async () => new Uint8Array(0), // Dummy, will be signed by Pera
      } as any,
      boxes: [
        {
          appIndex: VERISIGN_APP_ID,
          name: new Uint8Array([...Buffer.from('a'), ...hashBytes]), // 'a' prefix + hash
        },
      ],
    })

    // Build the transaction group
    const txnGroup = atc.buildGroup()
    const txn = txnGroup[0].txn

    // Sign with Pera Wallet
    const signedTxn = await peraWallet.signTransaction([[{ txn }]])

    // Send transaction
    const response = await algodClient.sendRawTransaction(signedTxn).do()
    const txId = response.txid

    // Wait for confirmation
    const confirmedTxn = await waitForConfirmation(txId)

    return {
      creatorAddress: senderAddress,
      timestamp: confirmedTxn.confirmedRoundTime || Math.floor(Date.now() / 1000),
      blockNumber: confirmedTxn.confirmedRound,
      txId,
    }
  } catch (error: any) {
    console.error('Failed to create attestation:', error)
    
    // Handle specific errors
    if (error.message?.includes('already attested')) {
      throw new Error('This file has already been signed by someone else')
    }
    
    throw error
  }
}

/**
 * Verify if a file hash has an attestation
 */
export async function verifyAttestation(fileHash: string): Promise<Attestation | null> {
  if (VERISIGN_APP_ID === 0) {
    throw new Error('Contract not deployed. Please update VERISIGN_APP_ID in lib/algorand.ts')
  }

  try {
    const hashBytes = hexToUint8Array(fileHash)
    const boxName = new Uint8Array([...Buffer.from('a'), ...hashBytes])

    // Query the box (storage) for this hash
    const boxValue = await algodClient
      .getApplicationBoxByName(VERISIGN_APP_ID, boxName)
      .do()

    if (!boxValue || !boxValue.value) {
      return null
    }

    // Decode the attestation struct
    // Format: Address (32 bytes) + Timestamp (8 bytes)
    const value = new Uint8Array(boxValue.value)
    
    if (value.length < 40) {
      return null
    }

    // Extract creator address (first 32 bytes)
    const creatorBytes = value.slice(0, 32)
    const creatorAddress = algosdk.encodeAddress(creatorBytes)

    // Extract timestamp (next 8 bytes, big-endian uint64)
    const timestampBytes = value.slice(32, 40)
    let timestampBigInt = BigInt(0)
    for (let i = 0; i < 8; i++) {
      timestampBigInt = (timestampBigInt << BigInt(8)) | BigInt(timestampBytes[i])
    }
    const timestamp = Number(timestampBigInt)

    // Try to find the transaction that created this attestation
    let txId = ''
    let blockNumber = 0

    try {
      // Search for transactions to this app from the creator
      const txnSearch = await indexerClient
        .searchForTransactions()
        .address(creatorAddress)
        .applicationID(VERISIGN_APP_ID)
        .do()

      if (txnSearch.transactions && txnSearch.transactions.length > 0) {
        // Find the transaction closest to our timestamp
        const relevantTxn = txnSearch.transactions.find((txn: any) => 
          Math.abs(txn.roundTime - timestamp) < 10
        )
        
        if (relevantTxn) {
          txId = relevantTxn.id || ''
          blockNumber = typeof relevantTxn.confirmedRound === 'bigint' 
            ? Number(relevantTxn.confirmedRound) 
            : (relevantTxn.confirmedRound || 0)
        }
      }
    } catch (error) {
      console.warn('Could not fetch transaction details:', error)
    }

    return {
      creatorAddress,
      timestamp,
      blockNumber,
      txId,
    }
  } catch (error: any) {
    // Box not found means no attestation exists
    if (error.status === 404 || error.message?.includes('box not found')) {
      return null
    }
    
    console.error('Failed to verify attestation:', error)
    throw error
  }
}

/**
 * Check if an address holds a credential ASA from a trusted organization
 * This is for Layer 2 - the reputation system
 */
export async function checkCredentialASA(
  address: string,
  credentialAssetIds: number[]
): Promise<{ hasCredential: boolean; organizationName?: string; assetId?: number }> {
  try {
    const accountInfo = await indexerClient.lookupAccountByID(address).do()
    
    if (!accountInfo.account || !accountInfo.account.assets) {
      return { hasCredential: false }
    }

    // Check if the account holds any of the credential ASAs
    for (const asset of accountInfo.account.assets) {
      const assetIdNum = typeof asset.assetId === 'bigint' ? Number(asset.assetId) : asset.assetId
      if (credentialAssetIds.includes(assetIdNum) && asset.amount > 0) {
        // TODO: Map asset ID to organization name
        // For now, return a placeholder
        return {
          hasCredential: true,
          organizationName: 'Verified Organization',
          assetId: assetIdNum,
        }
      }
    }

    return { hasCredential: false }
  } catch (error) {
    console.error('Failed to check credential ASA:', error)
    return { hasCredential: false }
  }
}
