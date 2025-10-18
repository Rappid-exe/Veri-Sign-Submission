# Layer 2: Reputation System Guide

## Overview

The Layer 2 reputation system allows verified organizations to issue credential ASAs (Algorand Standard Assets) to their members. When content is verified, the system checks if the creator holds a credential from a trusted organization and displays "✓ Verified by [Organization]" instead of just a wallet address.

## How It Works

### 1. Organization Creates Credential ASA

An organization (e.g., Reuters) creates a special ASA that acts as a "Press Pass":
- **Non-transferable** (freeze/clawback enabled)
- **Non-divisible** (0 decimals)
- **Limited supply** (can control distribution)

### 2. Distribute to Members

The organization sends 1 unit of the credential ASA to each verified member's wallet.

### 3. Enhanced Verification

When verifying content:
1. Check if file hash has an attestation (Layer 1)
2. Check if creator holds a credential ASA (Layer 2)
3. Display organization name if credential found

## Using the Admin Panel

### Access

Go to `/admin` in your browser (http://localhost:3000/admin)

### Create a Credential ASA

1. **Connect your wallet** (this will be the organization's wallet)
2. Fill in the form:
   - **Organization Name**: e.g., "Reuters"
   - **Description**: e.g., "Reuters Press Pass"
3. Click **"Create Credential ASA"**
4. Approve the transaction in Pera Wallet
5. **Save the Asset ID** that's displayed

### Register the Credential

After creating, you need to register it in the code:

Edit `lib/credentials.ts` and add to `CREDENTIAL_REGISTRY`:

```typescript
export const CREDENTIAL_REGISTRY: Record<number, Organization> = {
  123456: { 
    name: 'Reuters', 
    assetId: 123456, 
    description: 'Reuters Press Pass' 
  },
  // Add more organizations here
}
```

### Distribute Credentials

1. **Get the recipient's address** (the journalist's wallet)
2. **Recipient must opt-in first**:
   - They go to `/admin`
   - Enter the Asset ID
   - Click "Opt-In"
   - Approve in wallet
3. **Distribute the credential**:
   - Enter the Asset ID
   - Enter the recipient's address
   - Click "Distribute Credential"
   - Approve in wallet

### Verify with Organization Badge

Now when that journalist signs content:
1. They create a signature as normal
2. When someone verifies it, they'll see:
   - **"✓ Verified by Reuters"** (instead of just wallet address)
   - Organization badge in the verification banner
   - Organization details in the signature details

## Example Workflow

### Setup (One-time)

1. **Reuters creates credential ASA**
   - Asset ID: 123456
   - Registers in `CREDENTIAL_REGISTRY`

2. **Journalist Sarah opts in**
   - Goes to `/admin`
   - Opts in to Asset ID 123456

3. **Reuters distributes to Sarah**
   - Sends 1 unit of Asset 123456 to Sarah's wallet

### Daily Use

1. **Sarah signs a photo**
   - Goes to `/create`
   - Uploads photo
   - Creates signature

2. **Reader verifies the photo**
   - Goes to `/verify`
   - Uploads same photo
   - Sees: **"✓ Verified by Reuters"**

## Technical Details

### Credential ASA Properties

```typescript
{
  total: 1000000,        // Can issue to many members
  decimals: 0,           // Non-divisible
  defaultFrozen: false,  // Not frozen by default
  manager: creator,      // Can manage
  freeze: creator,       // Can freeze (prevent transfers)
  clawback: creator,     // Can revoke
  unitName: 'CRED',
  assetName: 'Reuters Credential'
}
```

### Why Non-Transferable?

- **Freeze enabled**: Organization can prevent transfers
- **Clawback enabled**: Organization can revoke credentials
- This ensures credentials can't be sold or transferred

### Checking Credentials

The system queries the Algorand Indexer to check if a wallet holds any registered credential ASAs:

```typescript
const org = await getCredentialForAddress(creatorAddress)
if (org) {
  // Display "Verified by {org.name}"
}
```

## Production Considerations

### Credential Registry

In production, store the credential registry in:
- Database (PostgreSQL, MongoDB)
- Smart contract storage
- IPFS with on-chain reference

### Organization Verification

Before adding to registry:
- Verify organization identity
- Legal agreements
- KYC/compliance checks

### Revocation

Organizations can revoke credentials:
```typescript
// Use clawback to revoke
algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
  sender: orgAddress,
  receiver: orgAddress,
  amount: 1,
  assetIndex: credentialAssetId,
  revocationTarget: memberAddress, // Clawback from this address
  suggestedParams,
})
```

## Benefits

### For Organizations
- Control over member credentials
- Can revoke if needed
- Builds brand trust

### For Creators
- Enhanced credibility
- Organization backing
- Professional verification

### For Consumers
- Easy to identify trusted sources
- Organization accountability
- Reduced misinformation

## Next Steps

1. Create test credentials for demo
2. Test the full workflow
3. Add more organizations
4. Consider UI improvements (organization logos, colors)
5. Deploy to production

## Demo Script for Hackathon

1. **Show the problem**: "How do you know if content is from a real Reuters journalist?"
2. **Layer 1**: "Anyone can sign content, but that's just a wallet address"
3. **Layer 2**: "With credentials, we see 'Verified by Reuters'"
4. **Live demo**: Create credential → Distribute → Sign → Verify
5. **Impact**: "This creates a true Web of Trust on the blockchain"
