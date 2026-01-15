# 🔍 How to Verify SECP is Working

## Current Status

✅ **Contracts Deployed** - All smart contracts are live on Mantle Sepolia
✅ **Frontend Running** - UI available at http://localhost:3000
✅ **You Have Tokens** - 10,000 of each token in your wallet
❌ **Not Active Yet** - Need to deposit collateral and take a loan

## 3 Ways to Test SECP

### Method 1: Frontend UI (Recommended)

1. **Open Browser**
   ```
   Go to: http://localhost:3000
   ```

2. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select MetaMask
   - Make sure you're on **Mantle Sepolia** network
   - Your address: `0x06ca...2536`

3. **Test the Flow**
   
   **Step 1: Approve & Deposit Collateral**
   - Enter amount: `1000` (tokens)
   - Click "1. Approve Tokens" → Confirm in wallet
   - Click "2. Deposit" → Confirm in wallet
   - Wait for confirmation
   
   **Step 2: Take a Loan**
   - You'll see "✅ Collateral deposited!"
   - Enter loan amount: `500` (max 666 for 1000 collateral)
   - Click "Borrow" → Confirm
   
   **Step 3: Check Dashboard**
   - Health Factor: Should show ~200%
   - Collateral: 1000 tokens
   - Debt: 500 tokens
   - Status: 🟢 NORMAL mode

4. **Watch It Work!**
   - Dashboard updates in real-time
   - All numbers should display correctly
   - Protection is armed at 120% health

### Method 2: Quick Setup Script

Run this one command to set everything up:

```bash
npx hardhat run scripts/quick-setup.ts --network mantleSepolia
```

This will:
- Approve all tokens ✅
- Deposit 1300 tokens (1000 risky + 200 safe + 100 yield) ✅
- Take a 500 token loan ✅
- Show you the complete status ✅

Then check the frontend - you'll see your active position!

### Method 3: Health Check Script

Check status anytime with:

```bash
npx hardhat run scripts/test-secp.ts --network mantleSepolia
```

This shows:
- ✅ Your token balances
- ✅ Vault collateral
- ✅ Loan status
- ✅ Health factor
- ✅ Protection status

## What "Working" Looks Like

### In the UI:

```
Health Factor: 260%  ✅ Healthy

Collateral:
  Risky Assets:    1000 tokens
  Safe Assets:     200 tokens  
  Yield Assets:    100 tokens
  Total Value:     1300 tokens

Loan Status:
  Debt:            500 tokens
  Mode:            🟢 NORMAL
  Protected:       ❌ No
```

### Protection System Test:

To see SECP actually protect you:

1. **Simulate a crash** (manually):
   ```bash
   npx hardhat run scripts/demo-protection.ts --network mantleSepolia
   ```

2. **Watch the magic:**
   - Health drops below 120%
   - Protection auto-triggers
   - Risky assets → Safe assets
   - Yield diverts to debt
   - Status changes to 🔴 CRASH mode
   - You avoid liquidation!

## Quick Visual Check

✅ **Frontend shows real numbers** (not 0s)
✅ **Can approve tokens** without errors
✅ **Can deposit** successfully
✅ **Can borrow** up to 66% of collateral
✅ **Health factor calculates** correctly
✅ **Dashboard updates** after transactions

## Common Issues

**"No collateral deposited"**
→ You need to deposit first before borrowing

**"Transaction failed"**
→ Make sure you approved tokens first
→ Check you have enough tokens
→ Verify you're on Mantle Sepolia

**"0 tokens everywhere"**
→ Wallet not connected or wrong network

## Next Steps

1. **Try the frontend first** - Easiest way to see it work
2. **Run quick-setup.ts** - If you want automated testing
3. **Check test-secp.ts** - Monitor status anytime
4. **Test protection** - Run demo-protection.ts to see anti-liquidation

Your SECP is ready - just need to make your first deposit! 🚀
