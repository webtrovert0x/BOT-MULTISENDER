# 🚀 BOT Multisender — Official Protocol & Web App

[![Network: BOT Chain](https://img.shields.io/badge/Network-BOT%20Chain%20(968)-1B4ED8?style=flat-square)](https://scan.bohr.life)
[![Solidity: 0.8.20](https://img.shields.io/badge/Solidity-0.8.20-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![Next.js: 14](https://img.shields.io/badge/Next.js-14%20App%20Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript: 5.7](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Wagmi: v2](https://img.shields.io/badge/Wagmi-v2-black?style=flat-square)](https://wagmi.sh)

A high-performance, non-custodial batch token distribution protocol and institutional desktop web app for **BOT Chain (Chain ID: 968)**. Send Native `BOT` coins or any custom `ERC-20` token to hundreds of recipient wallets in a single transaction with up to **75% gas savings**.

📄 **Read the Full Technical Whitepaper**: [WHITEPAPER.md](./WHITEPAPER.md)

---

## 🌐 BOT Chain Network Details

| Parameter | Specification |
| :--- | :--- |
| **Network Name** | BOT Chain Mainnet |
| **Chain ID** | `968` |
| **RPC URL** | `https://rpc.bohr.life` |
| **Native Token Symbol** | `BOT` (18 Decimals) |
| **Total Native Supply** | 150 Million BOT |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |
| **Deployed Contract** | **[`0x5972a42B05a60c4681a361ebC876628EA2fE7766`](https://scan.bohr.life/address/0x5972a42B05a60c4681a361ebC876628EA2fE7766)** |

---

## ✨ Key Features

- **Native BOT Multisend**: Batch send native `BOT` coins with automatic excess refund guarantee.
- **ERC-20 Token Multisend**: Batch send any custom ERC-20 token with one-click approval management.
- **Zero Mock Data Policy**: Live token discovery, real-time balance lookup via `balanceOf(owner)`, and live on-chain gas estimation.
- **Client-Side Simulation (`eth_call`)**: Automatically simulates every transaction payload before prompting wallet signatures.
- **Interactive CSV & Manual Editor**: Live table validation (`Valid`, `Invalid address`, `Invalid amount`, `Duplicate`, `Exceeds balance`), with instant error flags and deduplication tools.
- **Dynamic Batch Planning**: Automatically splits payouts exceeding the single-block limit into sequential atomic batches.
- **Restrained Fintech Visual System**: Desktop-first light theme (`#F4F5F7` background, pure white surfaces, Inter + IBM Plex Mono typography, deep BOT blue `#1B4ED8` accents).

---

## 🏗 Project Architecture

```
BOT MULTISENDER/
├── contracts/
│   ├── BotMultisender.sol         # Core batch multisender smart contract
│   └── test/MockERC20.sol         # Test ERC-20 token for unit tests
├── scripts/
│   └── deploy.js                  # Deployment script for BOT Chain
├── test/
│   └── BotMultisender.test.js     # Comprehensive Hardhat test suite (100% passing)
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Next.js root layout with Web3 providers
│   │   │   ├── page.tsx           # Main distribution application
│   │   │   └── globals.css        # Clean light-theme fintech CSS styling
│   │   ├── components/
│   │   │   ├── Sidebar.tsx        # Left navigation & connected account card
│   │   │   ├── TopBar.tsx         # Top bar with live network chip & account dropdown
│   │   │   ├── TokenSelector.tsx  # Native BOT & custom ERC-20 token selector
│   │   │   ├── RecipientsTable.tsx# Interactive recipients table with live validation
│   │   │   ├── DistributionSummary.tsx # Dynamic stats & gas estimator
│   │   │   ├── ReviewModal.tsx    # Step 2: Full payload verification
│   │   │   ├── ExecutionModal.tsx # Step 3 (Approve) & Step 4 (Send) execution
│   │   │   ├── DashboardView.tsx  # Overview dashboard
│   │   │   ├── HistoryView.tsx    # Distribution history with BohrScan links
│   │   │   ├── ContractsView.tsx  # Contract settings & ABI inspection
│   │   │   └── DocsView.tsx       # Built-in documentation
│   │   ├── config/
│   │   │   ├── chains.ts          # BOT Chain viem chain definition
│   │   │   ├── contracts.ts       # Contract ABIs & deployed address
│   │   │   └── wagmi.ts           # WagmiAdapter & Reown AppKit setup
│   │   ├── context/
│   │   │   └── index.tsx          # Wagmi & React Query provider
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces
│   │   └── utils/
│   │       ├── distribution.ts    # Validation engine, CSV parser, batch calculator
│   │       └── formatters.ts      # Address and balance formatters
│   ├── .env.local                 # Local environment variables
│   ├── next.config.mjs            # Next.js webpack & connector fallbacks
│   ├── package.json
│   └── tsconfig.json
├── hardhat.config.js              # Hardhat configuration
├── package.json                   # Root package.json
├── WHITEPAPER.md                  # Protocol technical whitepaper
└── README.md                      # Project documentation
```

---

## 🚀 Quickstart Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher

---

### 1. Running the Next.js Frontend

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.
5. Connect your wallet (MetaMask, TrustWallet, Coinbase Wallet, etc.) and switch to **BOT Chain (Chain ID: 968)**.

---

### 2. Building for Production

```bash
cd frontend
npm run build
npm run start
```

---

### 3. Deploying Your Own Smart Contract

If you want to deploy a custom instance of `BotMultisender.sol` to BOT Chain:

1. Configure your `.env` file in the project root:
   ```env
   PRIVATE_KEY=your_private_key_here
   BOTCHAIN_RPC=https://rpc.bohr.life
   ```
2. Run the Hardhat deployment script:
   ```bash
   npm run deploy:botchain
   ```
3. The script will output the deployed contract address:
   ```
   ✅ BotMultisender successfully deployed at: 0x...
   ```
4. Update `NEXT_PUBLIC_MULTISENDER_ADDRESS` in `frontend/.env.local` with your new address.

---

## 🧪 Running Unit Tests

To run the smart contract test suite locally with Hardhat:

```bash
npm test
```

All 5 unit tests verify:
- ✅ Native BOT variable amounts multisend with excess refund safety.
- ✅ Native BOT uniform amounts multisend.
- ✅ ERC-20 token variable amounts batch transfer via `transferFrom`.
- ✅ ERC-20 token uniform amounts batch transfer.
- ✅ Error handling and revert conditions.

---

## 📊 CSV Import Specification

BOT Multisender accepts `.csv` and `.txt` files with comma, tab, or space delimiters.

### Supported Formats

**With Header:**
```csv
recipient,amount
0x70997970C51812dc3A010C7d01b50e0d17dc79C8,100.5
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,250.0
```

**Without Header:**
```text
0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 100.5
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 250.0
```

> **Note**: Amounts must be in human-readable units (e.g. `10.5` BOT), not raw wei. The protocol automatically handles token decimals conversion.

---

## 🔒 Security & Invariants

- **Non-Custodial**: The contract never holds custody of funds. Tokens and native coins are routed directly from `msg.sender` to recipients within the execution frame.
- **Zero Storage State**: The contract stores no user balances or internal state, eliminating storage manipulation and reentrancy attack surfaces.
- **Exact Excess Refund**: Any surplus native value sent to `multisendNative` is refunded back to `msg.sender` before transaction completion.
- **Verified Source Code**: Deployed and public on [BohrScan Explorer](https://scan.bohr.life/address/0x5972a42B05a60c4681a361ebC876628EA2fE7766).

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
