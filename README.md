# 🛡️ SECP Protocol - Smart Emergency Collateral Protection

## 🌟 Overview

**SECP (Smart Emergency Collateral Protection)** is an innovative DeFi lending protocol that prevents liquidations through intelligent collateral rebalancing and Real-World Asset (RWA) integration. Unlike traditional lending platforms where users face immediate liquidation during market crashes, SECP automatically protects positions by reshaping portfolios and activating emergency measures.

### The Problem We Solve

Traditional DeFi lending platforms have a critical flaw:
- **Instant Liquidation Risk**: When markets crash, users get liquidated immediately
- **No Safety Mechanism**: Users lose collateral even if they have other valuable assets
- **Manual Intervention Required**: Users must monitor positions 24/7
- **Cascade Effect**: Liquidations trigger more liquidations, creating market panic

### Our Solution

SECP introduces a **3-Layer Protection System**:

1. **🔄 Auto-Rebalancing**: Automatically converts risky assets to stable assets when health drops
2. **💰 Yield Buffer**: Diverts yield-generating tokens to reduce debt during emergencies  
3. **🏠 RWA Emergency Collateral**: Locks real-world assets (Real Estate, Invoices, Gold) as last-resort protection

---

## 🚀 Unique Selling Points (USPs)

### 1. **Zero-Liquidation Architecture**
- **Never Get Liquidated**: Multi-layer protection prevents forced liquidations
- **Automatic Protection**: No user intervention needed - smart contracts handle everything
- **Graceful Degradation**: System progressively activates stronger protections as needed

### 2. **Real-World Asset Integration**
- **Tokenize Physical Assets**: Convert real estate, invoices, commodities into collateral
- **Emergency Unlocking**: RWAs automatically lock during critical health scenarios
- **Asset Verification**: On-chain tracking of asset type, location, and value
- **Flexible Asset Types**: Supports multiple RWA categories (real estate, invoices, gold, etc.)

### 3. **Intelligent Collateral Management**
- **Dynamic Rebalancing**: Portfolio automatically shifts from risky to safe assets
- **Health Factor Monitoring**: Continuous tracking with multi-threshold protection
- **Yield Optimization**: Yield-generating assets buffer debt during downturns
- **Transparent Mechanics**: All protection triggers visible on-chain

### 4. **User-Centric Design**
- **150% Minimum Collateral**: Lower barrier than most DeFi protocols (vs 200%+)
- **Real-Time Dashboard**: Live updates on health, collateral, and protection status
- **One-Click Actions**: Simplified UI for deposits, loans, and monitoring
- **Clear Error Messages**: Helpful guidance when transactions fail

### 5. **Multi-Chain Ready**
- **Optimism Stack Compatible**: Deployed on Mantle Sepolia (OP Stack)
- **Layer 2 Efficiency**: Low gas fees for frequent rebalancing operations
- **Scalable Architecture**: Can expand to multiple L2s and sidechains

---

## 🏗️ Architecture

### Smart Contracts

#### 1. **RWAToken.sol** - Real-World Asset Tokenization
```solidity
Features:
- Tokenize physical assets (real estate, invoices, gold)
- Lock/unlock mechanism for emergency collateral
- Asset metadata storage (type, location, value)
- Integration with vault for automated protection
```

#### 2. **SECPVault.sol** - Multi-Asset Collateral Management
```solidity
Features:
- Stores risky, safe, and yield-generating tokens
- Crash mode triggering for emergency rebalancing
- Automatic asset reshaping (risky → safe)
- RWA locking during critical scenarios
- Total value calculation across all asset types
```

#### 3. **SECPBorrow.sol** - Lending Engine with Protection
```solidity
Features:
- Health factor monitoring (150% minimum)
- Automatic protection triggering at 120% health
- Yield diversion to debt reduction
- RWA asset locking when health drops below 110%
- Collateral validation before loan issuance
```

#### 4. **MockERC20.sol** - Token Implementation
```solidity
Standard ERC20 tokens for testing:
- Risky Asset (RISK) - volatile collateral
- Safe Asset (SAFE) - stable collateral  
- Yield Asset (YIELD) - income-generating
```

### Frontend (Next.js + Wagmi + RainbowKit)

**Features:**
- Real-time dashboard with 3-second auto-refresh
- WalletConnect integration via RainbowKit
- Approve → Deposit → Borrow workflow
- Live health factor monitoring
- Protection status indicators
- Transaction state management

**Tech Stack:**
- Next.js 14 (App Router)
- Wagmi v2 (Web3 React hooks)
- Viem (Ethereum interactions)
- TailwindCSS (Styling)
- RainbowKit (Wallet connection)

---

## 💡 How It Works

### Normal Operation Flow

1. **User Deposits Collateral**
   - Approves tokens (risky, safe, yield)
   - Deposits into SECPVault
   - Collateral is tracked separately by type

2. **User Takes Loan**
   - Health factor calculated: `(Total Collateral Value × 100) / Debt`
   - Minimum 150% health required
   - Loan issued if collateral sufficient

3. **Health Monitoring**
   - System continuously monitors health factor
   - Three protection thresholds:
     - **150%+**: Normal operation ✅
     - **120%**: Auto-rebalancing triggered 🟡
     - **110%**: RWA emergency locking activated 🔴

### Emergency Protection Sequence

#### Stage 1: Crash Mode (Health < 120%)
```
1. triggerCrashMode() activated
2. 50% of risky assets converted to safe assets
3. Portfolio becomes more stable
4. Health factor improves
```

#### Stage 2: Yield Diversion (Health < 120%)
```
1. Available yield tokens identified
2. Yield diverted to reduce debt
3. Debt decreases, improving health
4. User retains core collateral
```

#### Stage 3: RWA Locking (Health < 110%)
```
1. Registered RWA assets locked
2. Asset value added to total collateral
3. Prevents liquidation as last resort
4. User maintains position ownership
```

### Example Scenario

**Initial State:**
- Collateral: 1000 RISK + 200 SAFE + 100 YIELD = 1300 tokens
- Loan: 500 tokens
- Health: 260% ✅

**Market Crash (-40%):**
- Collateral drops to: 600 RISK + 200 SAFE + 100 YIELD = 900 tokens
- Debt remains: 500 tokens
- Health: 180% 🟡

**Protection Activated:**
- 50% RISK → SAFE: 300 RISK converted
- New balance: 300 RISK + 500 SAFE + 100 YIELD = 900 tokens
- Portfolio now more stable
- **Liquidation prevented!**

---

## 📦 Installation & Setup

### Prerequisites

```bash
Node.js 18+
npm or yarn
MetaMask wallet
Mantle Sepolia testnet RPC
```

### Backend Setup

1. **Clone and Install**
```bash
git clone <repository>
cd secp
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Add your private key
MANTLE_PRIVATE_KEY=your_private_key_here
MANTLE_SEPOLIA_RPC=https://rpc.sepolia.mantle.xyz
```

3. **Deploy Contracts**
```bash
npx hardhat run scripts/deploy.ts --network mantleSepolia
```

4. **Setup Test Position**
```bash
npx hardhat run scripts/quick-setup.ts --network mantleSepolia
```

### Frontend Setup

1. **Navigate to Frontend**
```bash
cd frontend
npm install
```

2. **Configure Contracts**
```bash
# Update frontend/config/contracts.ts with deployed addresses
```

3. **Run Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

### MetaMask Configuration

Add Mantle Sepolia network:
- **Network Name**: Mantle Sepolia
- **RPC URL**: https://rpc.sepolia.mantle.xyz
- **Chain ID**: 5003
- **Currency**: MNT
- **Block Explorer**: https://explorer.sepolia.mantle.xyz

---

## 🧪 Testing

### Quick Test Scripts

**Check Current Status:**
```bash
npx hardhat run scripts/test-secp.ts --network mantleSepolia
```

**Demo Protection System:**
```bash
npx hardhat run scripts/demo-protection.ts --network mantleSepolia
```

**Simulate Market Crash:**
```bash
npx hardhat run scripts/simulate-protection.ts --network mantleSepolia
```

### Manual UI Testing

1. Connect wallet to Mantle Sepolia
2. Click "Approve Tokens" (enter amount, e.g., 1000)
3. Click "Deposit" 
4. Enter loan amount (max 66% of collateral)
5. Click "Borrow"
6. Monitor dashboard for real-time updates

See [TESTING-GUIDE.md](./TESTING-GUIDE.md) for detailed testing instructions.

---

## 📊 Contract Addresses (Mantle Sepolia)

```
Vault:        0xa0fa71cba7361205b0e0db428ec0c51f8d9937cd
Borrow:       0xbed7cf7901215030751c4e5c3ac36e6acc33d51e
Risky Token:  0x2910009bb55f0f1efc4408f1b794600ac529bcc3
Safe Token:   0x90c5f5af3086655d10e3daa70c97e8f605a333c8
Yield Token:  0xc500240db43ef946eb0fed6c2f3c80a2d5195a8e
RWA Token:    (check deployed-addresses.json)
```

View on Explorer: [Mantle Sepolia Explorer](https://explorer.sepolia.mantle.xyz)

---

## 🔮 Future Scope & Roadmap

### Phase 1: Enhanced Protection (Q1 2026)
- [ ] **Oracle Integration**: Chainlink price feeds for accurate asset valuation
- [ ] **Multi-Asset RWAs**: Support for diverse real-world asset types
- [ ] **Dynamic Thresholds**: AI-powered health factor optimization
- [ ] **Flash Loan Protection**: Prevent manipulation attacks

### Phase 2: Advanced Features (Q2 2026)
- [ ] **NFT Collateral**: Accept blue-chip NFTs as emergency collateral
- [ ] **Cross-Chain RWAs**: Bridge RWA assets across multiple chains
- [ ] **Fractional RWAs**: Allow partial RWA ownership and collateralization
- [ ] **Insurance Pool**: Community-backed insurance for extreme events
- [ ] **Governance Token**: Launch $SECP for protocol governance

### Phase 3: Institutional Integration (Q3 2026)
- [ ] **KYC/AML Module**: Compliance features for institutional users
- [ ] **Credit Scoring**: On-chain reputation system for better rates
- [ ] **Institutional RWAs**: Integration with verified asset providers
- [ ] **Multi-Sig Vaults**: Enterprise-grade security features
- [ ] **Audit Reports**: Third-party security audits

### Phase 4: Ecosystem Expansion (Q4 2026)
- [ ] **Mobile App**: iOS/Android apps for on-the-go management
- [ ] **Automated Strategies**: AI-driven portfolio optimization
- [ ] **Yield Farming**: Integrate with DeFi protocols for yield
- [ ] **Liquidation Market**: Secondary market for distressed positions
- [ ] **Developer SDK**: Tools for building on SECP

### Technical Improvements
- [ ] **Gas Optimization**: Reduce transaction costs by 50%
- [ ] **Batch Operations**: Bundle multiple actions in one transaction
- [ ] **Emergency Pause**: Circuit breaker for extreme scenarios
- [ ] **Upgrade Mechanism**: Proxy pattern for contract upgrades
- [ ] **Event Analytics**: Enhanced monitoring and alerting
- [ ] **L2 Expansion**: Deploy on Arbitrum, Optimism, Base, zkSync

### RWA Enhancements
- [ ] **Asset Verification**: Integration with real-world asset validators
- [ ] **Legal Framework**: Smart contract-legal agreement bridges
- [ ] **Appraisal Integration**: Automatic asset value updates
- [ ] **Redemption Mechanism**: Convert tokens back to physical assets
- [ ] **Regulatory Compliance**: Jurisdiction-specific implementations

### User Experience
- [ ] **One-Click Protection**: Automated setup wizard
- [ ] **Notification System**: Email/SMS alerts for health changes
- [ ] **Portfolio Analytics**: Advanced charts and insights
- [ ] **Social Features**: Share strategies, leaderboards
- [ ] **Educational Content**: In-app tutorials and guides

---

## 🎯 Use Cases

### 1. **Crypto Traders**
- Borrow against volatile crypto holdings
- Automatic protection during market downturns
- Maintain leveraged positions without liquidation risk

### 2. **Real Estate Owners**
- Tokenize property for instant liquidity
- Borrow against real estate without selling
- Emergency collateral during crypto market crashes

### 3. **Invoice Financing**
- Businesses tokenize outstanding invoices
- Access immediate working capital
- Use invoices as emergency backup collateral

### 4. **Commodity Holders**
- Tokenize gold, silver, or other commodities
- Diversify collateral beyond crypto
- Hedge against crypto-specific risks

### 5. **Long-Term HODLers**
- Borrow without selling appreciated assets
- Protection during volatile markets
- Tax-efficient liquidity access

---

## 🔒 Security Considerations

### Current Implementations
- ✅ Minimum 150% collateral ratio
- ✅ Health factor continuous monitoring
- ✅ Multi-layer protection activation
- ✅ Owner-only critical functions
- ✅ Allowance-based token transfers

### Recommended Enhancements
- [ ] Formal verification of smart contracts
- [ ] Third-party security audit (Certik, OpenZeppelin)
- [ ] Bug bounty program
- [ ] Time-lock for critical parameter changes
- [ ] Multi-sig for admin functions
- [ ] Rate limiting on large operations
- [ ] Oracle redundancy and manipulation protection

---

## 🤝 Contributing

We welcome contributions! Areas of focus:

- Smart contract optimizations
- Frontend UX improvements
- Additional RWA integrations
- Documentation enhancements
- Testing and security

---

## 📚 Documentation

- [BORROWING-GUIDE.md](./BORROWING-GUIDE.md) - How to use the protocol
- [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Testing instructions
- [FIX-SUMMARY.md](./FIX-SUMMARY.md) - Recent improvements and fixes

---

## 📜 License

MIT License - see LICENSE file for details

---

## 💪 Built With

- **Solidity 0.8.20** - Smart contracts
- **Hardhat 3.1** - Development environment
- **Next.js 14** - Frontend framework
- **Wagmi v2** - Web3 React hooks
- **Viem 2.44** - Ethereum library
- **RainbowKit 2.1** - Wallet connection
- **TailwindCSS 3.4** - Styling
- **TypeScript 5.8** - Type safety



---

## 📞 Support

For questions, issues, or feedback:
- Open a GitHub issue
- Check existing documentation
- Review test scripts for examples

---
