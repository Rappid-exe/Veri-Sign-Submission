import algosdk from 'algosdk'
import { algodClient, indexerClient } from './algorand'
import { peraWallet } from './wallet'

export interface Organization {
  name: string
  assetId: number
  description: string
  logo?: string
}

// Registry of known credential ASAs
// In production, this would be stored in a database
export const CREDENTIAL_REGISTRY: Record<number, Organization> = {
  // Example: 123456: { name: 'Reuters', assetId: 123456, description: 'Reuters Press Pass' }
}

/**
 * Create a new credential ASA for an organization
 */
export async function createCredentialASA(
  creatorAddress: string,
  organizationName: string,
  description: string
): Promise<number> {
  try {
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Create ASA with specific properties for credentials
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      sender: creatorAddress,
      total: 1000000, // Total supply (can issue to many members)
      decimals: 0, // Non-divisible
      defaultFrozen: false,
      manager: creatorAddress, // Can manage the asset
      reserve: creatorAddress,
      freeze: creatorAddress, // Can freeze accounts (prevent transfers)
      clawback: creatorAddress, // Can revoke from accounts
      unitName: 'CRED',
      assetName: `${organizationName} Credential`,
      assetURL: `https://verisign.app/credentials/${organizationName.toLowerCase()}`,
      assetMetadataHash: undefined,
      suggestedParams,
      note: new Uint8Array(Buffer.from(description)),
    })

    // Sign with Pera Wallet
    const signedTxn = await peraWallet.signTransaction([[{ txn }]])

    // Send transaction
    const { txid } = await algodClient.sendRawTransaction(signedTxn).do()

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txid, 4)

    // Get the asset ID from the transaction
    const assetId = confirmedTxn.assetIndex
    
    if (!assetId) {
      throw new Error('Failed to get asset ID from transaction')
    }

    return typeof assetId === 'bigint' ? Number(assetId) : assetId
  } catch (error: any) {
    console.error('Failed to create credential ASA:', error)
    throw error
  }
}

/**
 * Distribute a credential ASA to a member
 */
export async function distributeCredential(
  fromAddress: string,
  toAddress: string,
  assetId: number
): Promise<string> {
  try {
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Transfer 1 unit of the credential ASA
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: fromAddress,
      receiver: toAddress,
      amount: 1,
      assetIndex: assetId,
      suggestedParams,
    })

    // Sign with Pera Wallet
    const signedTxn = await peraWallet.signTransaction([[{ txn }]])

    // Send transaction
    const { txid } = await algodClient.sendRawTransaction(signedTxn).do()

    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, txid, 4)

    return txid
  } catch (error: any) {
    console.error('Failed to distribute credential:', error)
    throw error
  }
}

/**
 * Check if an address holds a credential from any registered organization
 */
export async function getCredentialForAddress(
  address: string
): Promise<Organization | null> {
  try {
    const accountInfo = await indexerClient.lookupAccountByID(address).do()

    if (!accountInfo.account || !accountInfo.account.assets) {
      return null
    }

    // Check if the account holds any registered credential ASAs
    for (const asset of accountInfo.account.assets) {
      const assetIdNum = typeof asset.assetId === 'bigint' 
        ? Number(asset.assetId) 
        : asset.assetId
      
      if (CREDENTIAL_REGISTRY[assetIdNum] && asset.amount > 0) {
        return CREDENTIAL_REGISTRY[assetIdNum]
      }
    }

    return null
  } catch (error) {
    console.error('Failed to check credentials:', error)
    return null
  }
}

/**
 * Get all holders of a specific credential ASA
 */
export async function getCredentialHolders(assetId: number): Promise<string[]> {
  try {
    const assetInfo = await indexerClient.lookupAssetBalances(assetId).do()
    
    const holders = assetInfo.balances
      .filter((balance: any) => balance.amount > 0)
      .map((balance: any) => balance.address)

    return holders
  } catch (error) {
    console.error('Failed to get credential holders:', error)
    return []
  }
}

/**
 * Opt-in to receive a credential ASA
 */
export async function optInToCredential(
  address: string,
  assetId: number
): Promise<string> {
  try {
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Opt-in transaction (send 0 of the asset to yourself)
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: address,
      receiver: address,
      amount: 0,
      assetIndex: assetId,
      suggestedParams,
    })

    // Sign with Pera Wallet
    const signedTxn = await peraWallet.signTransaction([[{ txn }]])

    // Send transaction
    const { txid } = await algodClient.sendRawTransaction(signedTxn).do()

    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, txid, 4)

    return txid
  } catch (error: any) {
    console.error('Failed to opt-in to credential:', error)
    throw error
  }
}

/**
 * Register a credential ASA in the local registry
 */
export function registerCredential(organization: Organization): void {
  CREDENTIAL_REGISTRY[organization.assetId] = organization
}

/**
 * Get all registered credentials
 */
export function getAllCredentials(): Organization[] {
  return Object.values(CREDENTIAL_REGISTRY)
}
