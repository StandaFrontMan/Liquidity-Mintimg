# Liquidity Staking Protocol

A decentralized ETH staking protocol with **dynamic APY** that automatically adjusts based on Total Value Locked (TVL). Built with Solidity, Foundry, React, and Wagmi.

🔗 **Live Demo:** [liquidity-staking.vercel.app](https://liquidity-mintimg.vercel.app)  
🔍 **Contracts (Sepolia):**

- LiquidityStaking: [`0xcBF02fE979C96E0987f874FB1C5129057d1D976a`](https://sepolia.etherscan.io/address/0xcbf02fe979c96e0987f874fb1c5129057d1d976a)
- RewardToken: [`0xe3D13615F6d5cC866713c0432bb71C4E12c01EfB`](https://sepolia.etherscan.io/address/0xe3d13615f6d5cc866713c0432bb71c4e12c01efb)

---

## 📖 What is this?

Users **stake ETH** and earn **REW tokens** as rewards. The protocol features a **self-balancing APY mechanism**:

```
APY = baseRewardRate × (targetTVL / currentTVL)
```

- **Low TVL** → High APY (to attract stakers)
- **High TVL** → Lower APY (protocol doesn't overpay)
- Bounded by `minRewardRate` (5%) and `maxRewardRate` (100%)

This creates natural supply/demand equilibrium without manual intervention.

---

## 🎯 Key Features

### Smart Contract

- ✅ Dynamic APY based on TVL
- ✅ No lock-up period — stake/unstake anytime
- ✅ Claim rewards without unstaking
- ✅ Owner-adjustable parameters (target TVL, base rate, limits)
- ✅ Comprehensive test suite (85+ tests)
- ✅ Verified on Etherscan

### Frontend

- 🎨 Five interactive pages: Stake, Analytics, Charts, Calculator, Admin
- 📊 Real-time data from blockchain via Wagmi
- 📈 Historical charts from on-chain events (TVL, APY, Volume, Rewards)
- 🧮 Reward calculator with APY preview
- ⚙️ Admin panel for contract owner
- 🌐 Deployed on Vercel

---

## 🏗️ Architecture

```
packages/
├── contracts/          # Solidity contracts (Foundry)
│   ├── src/
│   │   ├── LiquidityStaking.sol
│   │   └── RewardToken.sol
│   ├── test/           # 85+ tests
│   └── script/Deploy.s.sol
│
└── frontend/           # React + Vite + Wagmi
    ├── src/
    │   ├── pages/      # /stake, /analytics, /charts, /calculator, /owner
    │   ├── config/     # ABIs, addresses, wagmi setup
    │   └── features/   # Reusable components
    └── vercel.json
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Foundry ([install](https://book.getfoundry.sh/getting-started/installation))
- MetaMask with Sepolia testnet ETH

### Local Development

```bash
# Clone repo
git clone <repo-url>
cd liquidity-staking

# Install dependencies
cd packages/contracts && forge install
cd ../frontend && npm install

# Run local blockchain
cd packages/contracts
anvil

# Deploy contracts (in new terminal)
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --private-key <ANVIL_PRIVATE_KEY> --broadcast

# Start frontend
cd packages/frontend
npm run dev
```

Open http://localhost:5173 and connect MetaMask to Anvil network (chainId: 31337).

---

## 🧪 Testing

```bash
cd packages/contracts

# Run all tests
forge test -vv

# With gas report
forge test --gas-report

# Specific test
forge test --match-test testStakeAndUnstake -vvv
```

---

## 📊 How It Works

### Economic Model

**Target TVL:** 100 ETH (configurable by owner)  
**Base Rate:** 20% APY at target TVL  
**Limits:** 5% min, 100% max

Example APY curve:

```
25 ETH   →  80% APY   (low TVL → high incentive)
50 ETH   →  40% APY
100 ETH  →  20% APY   (at target)
200 ETH  →  10% APY
400 ETH  →   5% APY   (minimum)
```

### User Journey

1. **Stake** — Send ETH to contract → starts earning REW tokens
2. **Earn** — Rewards accumulate every second based on current APY
3. **Claim** — Withdraw REW rewards without unstaking
4. **Unstake** — Get back ETH + all pending rewards

### Admin Controls

Contract owner can adjust:

- `setTargetTvl()` — Change target TVL
- `setBaseRewardRate()` — Adjust base APY
- `setRateLimits()` — Update min/max bounds

---

## 🛠️ Tech Stack

**Smart Contracts:**

- Solidity 0.8.30
- Foundry (forge, cast, anvil)
- OpenZeppelin (Ownable, ReentrancyGuard)

**Frontend:**

- React 18 + TypeScript
- Vite
- Wagmi + Viem (Web3 interaction)
- Recharts (data visualization)
- Tailwind CSS
- Vercel (hosting)

---

## 📁 Project Structure

```
src/
├── LiquidityStaking.sol    # Main staking contract
│   ├── stake()             # Deposit ETH
│   ├── unstake()           # Withdraw ETH + rewards
│   ├── claimRewards()      # Claim REW without unstaking
│   ├── getPoolInfo()       # Current TVL, APY, rate, balance
│   ├── getMyStake()        # User's staked amount + pending rewards
│   └── previewApy()        # Simulate APY at hypothetical TVL
│
└── RewardToken.sol         # ERC20 reward token (REW)
```

**Frontend Pages:**

- `/stake` — Stake ETH, view pool stats, manage position
- `/analytics` — Pool metrics, APY curve, live event feed
- `/charts` — Historical TVL, APY, volume, rewards (from events)
- `/calculator` — Simulate rewards for any amount/duration
- `/owner` — Admin panel (only for contract owner)

---

## 🔐 Security Considerations

✅ **Implemented:**

- ReentrancyGuard on all state-changing functions
- Ownable for admin functions
- Comprehensive test coverage
- Verified source code on Etherscan

⚠️ **Known Limitation:**
APY is calculated using the **current rate** for the entire staking period. If APY changes (due to TVL changes), past rewards are recalculated. Production version should implement a reward-per-token accumulator (Synthetix pattern).

---

## 📄 License

MIT

---

## 🤝 Contributing

This is an educational project. Feel free to fork and experiment!

**Ideas for improvement:**

- Implement reward-per-token accumulator for fair reward distribution
- Add governance token for decentralized parameter changes
- Multi-asset staking support
- Automated TVL target adjustments based on market conditions

---

## 📧 Contact

Built as a learning project to explore:

- DeFi protocol mechanics
- Dynamic economic models
- Full-stack Web3 development
- Foundry testing patterns
- React + Wagmi integration

Questions? Open an issue or reach out on [LinkedIn](https://linkedin.com/in/yourprofile).
