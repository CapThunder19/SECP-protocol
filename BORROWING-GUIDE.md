# How to Use SECP Protocol

## Problem: Transaction Failing When Borrowing

Your borrowing transaction is failing because of these requirements:

### ✅ Steps to Borrow Successfully:

1. **Get Test Tokens** (if you don't have any)
   - You need Risky, Safe, and Yield tokens in your wallet
   - These are minted during contract deployment

2. **Approve Tokens** 
   ```
   You must approve the vault to spend your tokens FIRST
   - Approve Risky Token → Vault
   - Approve Safe Token → Vault  
   - Approve Yield Token → Vault
   ```

3. **Deposit Collateral**
   ```
   Deposit at least 450 tokens if you want to borrow 300
   Minimum ratio: 150% (1.5x collateral)
   Recommended: 200-300% for safety
   ```

4. **Take Loan**
   ```
   Now you can borrow up to 66% of your collateral value
   Example:
   - 450 tokens collateral = max 300 borrow
   - 600 tokens collateral = max 400 borrow
   - 1000 tokens collateral = max 666 borrow
   ```

### 🔥 Why 300 Tokens Failed:

If you tried to borrow 300 tokens, you needed:
- **Minimum: 450 tokens deposited** (300 × 150%)
- **Recommended: 600+ tokens** (for 200% health)

### 💡 Fix in the UI:

The updated contract now shows clear error messages:
- ❌ "No collateral deposited" - Deposit first!
- ❌ "Insufficient collateral" - Deposit more!
- ✅ "Loan successful" - You're good!

### 📝 Manual Steps (via UI):

1. Connect wallet to Mantle Sepolia
2. Click **"Deposit Collateral"**
3. Enter amount (e.g., 1000 tokens)
4. Approve transaction
5. Wait for confirmation
6. Click **"Take Loan"**
7. Enter amount ≤ 66% of collateral
8. Confirm transaction

### 🛠️ For Testing (via Script):

Run this in the terminal:
```bash
npx hardhat run scripts/quick-setup.ts --network mantleSepolia
```

This will:
- Approve all tokens
- Deposit 1300 tokens collateral
- Borrow 500 tokens (260% health)
- Show your position stats
