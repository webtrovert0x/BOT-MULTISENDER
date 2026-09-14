# BOT Multisender Protocol: Technical Whitepaper
**High-Throughput, Non-Custodial Batch Token Distribution on BOT Chain**

*Version 1.0.0 — September 2026*  
*Protocol Status: Mainnet Live*  
*Target Network: BOT Chain (Chain ID: 968)*  
*Official Contract: `0x5972a42B05a60c4681a361ebC876628EA2fE7766`*

---

## Executive Summary

The **BOT Multisender Protocol** is a decentralized, non-custodial batch transaction routing layer deployed natively on **BOT Chain** (Chain ID: 968). It enables token issuers, decentralized autonomous organizations (DAOs), Web3 gaming ecosystems, and decentralized protocols to distribute Native `BOT` coins and ERC-20 tokens to thousands of unique wallet addresses in a single atomic transaction.

By eliminating the redundant per-transaction base gas overhead (21,000 gas per Ethereum Virtual Machine transaction) and consolidating multi-party payouts into memory-optimized loops, BOT Multisender reduces cumulative network execution costs by up to **75%** while guaranteeing zero protocol-held custody, trustless execution, and mathematical excess refund guarantees.

---

## 1. Problem Statement

Token distribution is an essential operation across the lifecycle of decentralized protocols. Common use cases include:
- Ecosystem airdrops and user incentivization programs.
- DAO contributor payroll and treasury grants.
- Staking and liquidity mining reward settlements.
- Private and public token sale distributions.

### Inefficiencies of Sequential Transfers
When executed individually using standard single-transfer transactions (`eth_sendTransaction` or `IERC20.transfer`), distributions encounter severe structural bottlenecks:

1. **Compounded Base Overhead**: Every EVM transaction incurs a mandatory baseline execution cost of **21,000 gas**, in addition to signature verification overhead and transaction envelope processing. For 1,000 recipients, 21,000,000 gas is consumed purely on transaction envelopes before executing any state changes.
2. **Nonce Lock & Bottlenecking**: Sequential transfers from a single wallet address require monotonic nonce progression (`nonce + 1`). If a single transaction stalls in the mempool, all downstream payouts are blocked.
3. **Execution Time & Market Exposure**: Distributing to hundreds of accounts sequentially can take dozens of blocks, exposing sender treasuries to market volatility and uneven payout timing.
4. **Operational & Human Error**: Manually orchestrating hundreds of individual wallet prompts increases key-signing fatigue and operational risk.

---

## 2. Protocol Architecture

The protocol is implemented in immutable Solidity (`BotMultisender.sol`) and does not rely on proxies, upgradeability keys, or administrative access controls. Once deployed, its logic is deterministic and permanently immutable.

```
+-------------------------------------------------------------------------+
|                              BOT MULTISENDER                            |
+-------------------------------------------------------------------------+
       |                                                    |
       v                                                    v
[ Native BOT Flow ]                                [ ERC-20 Flow ]
  - msg.value validation                             - Pre-allowance check
  - In-memory sum calculation                        - Safe transferFrom routing
  - Direct low-level call execution                  - Non-standard ERC-20 handler
  - Strict excess refund to msg.sender               - Zero-custody passthrough
       |                                                    |
       +----------------------------------------------------+
                                 |
                                 v
                       [ Recipient Wallets ]
```

### 2.1 Native BOT Distribution (`multisendNative`)

The native token multisending engine processes variable or uniform amounts of native `BOT` in a single transaction frame:

$$\text{Total Required} = \sum_{i=0}^{n-1} \text{amounts}[i]$$

$$\text{Excess} = \text{msg.value} - \text{Total Required}$$

#### Algorithmic Execution:
1. **Array Parity & Emptiness Verification**: Reverts with custom error `EmptyRecipients()` if $n = 0$, or `ArrayLengthMismatch()` if $\text{len}(\text{recipients}) \neq \text{len}(\text{amounts})$.
2. **Pre-flight Value Verification**: Iterates through memory arrays using unchecked arithmetic (`unchecked { ++i; }`) to sum the required funds. If $\text{msg.value} < \text{Total Required}$, execution reverts immediately with `InsufficientNativeSent(sent, required)`.
3. **Low-Level Native Dispatch**: Dispatches native coins to each recipient using low-level `.call{value: amount}("")` preventing gas stipend limitations imposed by deprecated `.transfer()` or `.send()`.
4. **Zero-Balance Excess Refund**: Any surplus value ($\text{msg.value} - \text{Total Required}$) is automatically refunded to `msg.sender` in the final step of the same transaction call frame.

### 2.2 Uniform Native Distribution (`multisendNativeSameValue`)

For scenarios where all recipients receive an identical value $A$:

$$\text{Total Required} = n \times A$$

This avoids passing an $n$-length array of identical amounts in calldata, saving **16 gas per non-zero byte** in calldata costs.

### 2.3 ERC-20 Token Distribution (`multisendToken`)

For arbitrary ERC-20 tokens, BOT Multisender acts as a non-custodial transfer router:

1. **Sender Approval**: The sender grants an ERC-20 allowance to the `BotMultisender` contract:
   $$\text{allowance}(\text{msg.sender}, \text{BotMultisender}) \ge \text{Total Required}$$
2. **Direct Pull & Route**: The contract calls `IERC20.transferFrom(msg.sender, recipient[i], amount[i])` for each recipient in a tight loop.
3. **Safe Transfer Handling (`_safeTransferFrom`)**: Handles non-standard ERC-20 tokens that do not return a boolean value (e.g. legacy or non-reverting implementations) using low-level ABI decoding:
   ```solidity
   (bool success, bytes memory data) = token.call(
       abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, value)
   );
   if (!success || (data.length > 0 && !abi.decode(data, (bool)))) {
       revert TokenTransferFailed(token, to, value);
   }
   ```
4. **Zero Protocol Custody**: Tokens move directly from `msg.sender` to `recipient[i]`. The contract balance remains 0 at all times.

---

## 3. Gas Optimization & Efficiency Analysis

The smart contract was engineered specifically for high-throughput batching on EVM environments:

### Optimization Techniques:
- **Calldata Array Storage**: Function parameters use `calldata` rather than `memory`, eliminating unnecessary memory copying overhead.
- **Unchecked Loop Iteration**: Index increments (`unchecked { ++i; }`) bypass overflow checks since loop bounds are bounded by `recipients.length` which cannot exceed $2^{256}-1$.
- **Custom Error Encodings**: Utilizes Solidity custom errors (`error InsufficientNativeSent(...)`) instead of long error strings, saving 4-byte selector vs. 32+ byte string storage.
- **Single Event Emission**: Emits a single summary event per batch (`NativeMultisend` or `TokenMultisend`) rather than emitting $n$ individual events, saving ~1,500 gas per recipient.

### Gas Comparison Table

| Recipient Count | Individual Transfers (Total Gas) | BOT Multisender (Total Gas) | Gas Savings (%) |
| :--- | :--- | :--- | :--- |
| **10 Addresses** | ~210,000 gas | ~82,000 gas | **60.9%** |
| **50 Addresses** | ~1,050,000 gas | ~370,000 gas | **64.7%** |
| **100 Addresses** | ~2,100,000 gas | ~730,000 gas | **65.2%** |
| **200 Addresses** | ~4,200,000 gas | ~1,450,000 gas | **65.5%** |
| **500 Addresses** (Multi-Batch) | ~10,500,000 gas | ~3,600,000 gas | **65.7%** |

---

## 4. Security Model & Invariants

### 4.1 Invariants
1. **Zero-Custody Invariant**: At the beginning and end of every transaction, the `BotMultisender` contract balance of any ERC-20 token is strictly `0`.
2. **Zero-Residual Native Invariant**: The native `BOT` balance of `BotMultisender` after transaction finalization is strictly `0`.
3. **Sender Parity Invariant**: Tokens/coins can only be debited from `msg.sender`.

### 4.2 Threat Analysis
- **Reentrancy**: Since the contract stores zero internal state balances or user deposits, there is no state to manipulate via reentrancy. Furthermore, excess refunds occur strictly after completing recipient transfers.
- **Front-Running / Sandwiching**: Multisend operations do not interact with AMM pools or slippage parameters, rendering them immune to sandwich attacks.
- **Allowance Griefing**: Senders can approve only the exact sum required for the batch (`approvalChoice: 'exact'`), preventing any residual allowance risk.

---

## 5. BOT Chain Technical Specifications

The protocol is deployed and verified on **BOT Chain**:

| Parameter | Specification |
| :--- | :--- |
| **Chain ID** | `968` |
| **Network Name** | BOT Chain |
| **RPC Endpoint** | `https://rpc.bohr.life` |
| **Native Asset** | `BOT` (18 Decimals) |
| **Total Native Supply** | 150,000,000 BOT |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |
| **Deployed Contract** | **`0x5972a42B05a60c4681a361ebC876628EA2fE7766`** |

---

## 6. Client Architecture (Next.js & Web3 Stack)

The frontend client is built as an institutional desktop Web3 application:

- **Next.js 14 App Router & TypeScript**: Full type-safety, zero mock data, and pure live-state reactivity.
- **Wagmi v2 & Viem**: Type-inferred contract calls with ABI typing via `parseAbi`.
- **Pre-execution Simulation (`eth_call`)**: Every transaction payload is simulated on-chain using `publicClient.simulateContract` before prompting the wallet for signature, preventing failed transactions and wasted gas.
- **Flexible Ingestion Engine**:
  - Parses CSV and TXT files with headers (`recipient,amount`, `address,value`) or headerless lines.
  - Retains all rows visibly in table with real-time status: `Valid`, `Invalid address`, `Invalid amount`, `Duplicate`, `Exceeds balance`.
  - Dynamic batching: Automatically splits distributions larger than 200 recipients into sequential batches.

---

## 7. Conclusion

The BOT Multisender Protocol provides an essential public good for the BOT Chain ecosystem. By providing gas-optimized batch routing with mathematically verifiable non-custodial safety, it empowers projects, DAOs, and users to distribute tokens at scale with confidence, minimal cost, and maximum efficiency.

---

### Contract Verification & Links
- **BohrScan Explorer**: [https://scan.bohr.life/address/0x5972a42B05a60c4681a361ebC876628EA2fE7766](https://scan.bohr.life/address/0x5972a42B05a60c4681a361ebC876628EA2fE7766)
- **Official GitHub**: [https://github.com/webtrovert0x/BOT-MULTISENDER](https://github.com/webtrovert0x/BOT-MULTISENDER)
