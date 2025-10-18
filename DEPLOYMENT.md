# Veri-Sign Deployment Guide

## Prerequisites

1. **AlgoKit** - For deploying smart contracts
2. **Pera Wallet** - Mobile or browser extension for TestNet
3. **Node.js & npm** - For running the frontend

## Step 1: Deploy the Smart Contract

### 1.1 Navigate to smart contracts directory
```bash
cd smart_contracts
```

### 1.2 Set up environment variables
Create a `.env` file in the `smart_contracts` directory:
```
DEPLOYER_MNEMONIC="your 25-word mnemonic phrase here"
```

### 1.3 Build and deploy to TestNet
```bash
# Build the contract
algokit project run build

# Deploy to TestNet
algokit project deploy testnet
```

### 1.4 Note the App ID
After deployment, you'll see output like:
```
Deployed VerisignApp (123456789) at address ABC...XYZ
```

Copy the App ID number (e.g., `123456789`).

## Step 2: Configure the Frontend

### 2.1 Update the App ID
Open `lib/algorand.ts` and update the `VERISIGN_APP_ID`:

```typescript
export const VERISIGN_APP_ID = 123456789 // Replace with your actual app ID
```

### 2.2 Install dependencies (if not already done)
```bash
npm install --legacy-peer-deps
```

## Step 3: Run the Frontend

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 4: Test the Application

### 4.1 Connect Wallet
1. Click "Connect Wallet" in the navbar
2. Approve the connection in Pera Wallet
3. Make sure you're on TestNet and have some test ALGO

### 4.2 Create a Signature
1. Go to `/create`
2. Upload a file
3. Click "Generate Hash"
4. Click "Create Signature"
5. Approve the transaction in Pera Wallet
6. Wait for confirmation

### 4.3 Verify Content
1. Go to `/verify`
2. Upload the same file
3. Click "Verify with Veri-Sign"
4. See the verification result

## Troubleshooting

### "Contract not deployed" error
- Make sure you updated `VERISIGN_APP_ID` in `lib/algorand.ts`

### Transaction fails
- Ensure your wallet has test ALGO (get from [TestNet dispenser](https://bank.testnet.algorand.network/))
- Check that you're connected to TestNet in Pera Wallet

### Box storage error
- The contract needs ALGO to pay for box storage
- The deploy script automatically funds it with 1 ALGO
- If needed, send more ALGO to the app address

## Layer 2: Credential ASAs (Optional)

To implement the reputation system:

1. Create an ASA for your organization
2. Make it non-transferable (clawback = creator, freeze = creator)
3. Distribute to verified members
4. Update the verification logic to check for these ASAs

See the hackathon context document for more details on the two-tier system.

## Production Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Smart Contract (MainNet)
1. Update `.env` with MainNet deployer mnemonic
2. Deploy to MainNet:
```bash
algokit project deploy mainnet
```
3. Update `VERISIGN_APP_ID` and change network config in `lib/algorand.ts` to MainNet

## Network Configuration

Current setup uses **Algorand TestNet**:
- Algod: `https://testnet-api.algonode.cloud`
- Indexer: `https://testnet-idx.algonode.cloud`

For MainNet, update `lib/algorand.ts`:
```typescript
export const ALGORAND_CONFIG = {
  algodToken: '',
  algodServer: 'https://mainnet-api.algonode.cloud',
  algodPort: 443,
  indexerServer: 'https://mainnet-idx.algonode.cloud',
  indexerPort: 443,
}
```

And update Pera Wallet chain ID in `lib/wallet.ts`:
```typescript
chainId: 416001, // MainNet
```
