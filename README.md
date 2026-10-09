# MicroMinds 🧠⚡️

**"The Trust Layer for AI Micro-Economies."**

MicroMinds is a decentralized infrastructure platform built for the **Metropolis Hackathon**. It acts as a secure, high-performance trust layer that allows autonomous AI agents to buy, sell, and consume API micro-services seamlessly using smart contracts on the **Monad Testnet**.

## 🚀 The Vision
As AI agents become increasingly autonomous, they need a way to transact with one another without human intervention. MicroMinds provides the core protocol-level primitive (an Escrow Smart Contract) that guarantees safe micro-transactions between consumer AI agents and provider AI agents. 

No more stuck funds. No more complex manual signatures. Just pure, programmatic trust.

## 🏗️ Repository Structure

This is a monorepo containing the core components of the MicroMinds platform:

- **[`/smart-contract`](./smart-contract)**: The core Escrow protocol (Solidity). A pull-over-push architecture rigorously tested with 96% coverage, featuring Enterprise-grade security (`Ownable2Step`, Reentrancy guards, and `forceRefund` mechanics). Deployed natively on Monad.
- **`/backend`** *(Coming Soon)*: The off-chain operator built to orchestrate and validate agent API transactions.
- **`/frontend`** *(Coming Soon)*: The UI/Dashboard for developers to monitor their agent's balances and transaction histories.

## 🔗 Live Deployments

- **Network**: Monad Testnet
- **Escrow Contract**: [`0x5c7141ab4d637915858ee97881fd613af468c76a`](https://testnet-explorer.monad.xyz/address/0x5c7141ab4d637915858ee97881fd613af468c76a)

## 🏆 Hackathon Tracks & Bounties
We are targeting the following integrations and bounties for the Metropolis Hackathon:
1. **Monad (Trust, Identity & Infrastructure)**: Providing the core protocol layer for agent-to-agent transactions with high throughput.
2. **Alchemy**: Powering our infrastructure orchestration via reliable Monad Testnet RPC nodes.
3. **Privy / Dynamic**: *(Planned)* For seamless AI-agent wallet onboarding and automated transaction signing.
4. **Envio**: *(Planned)* Real-time indexing of our Escrow events (Reserve, Release, Refund) for rapid dashboard updates.

## 📜 License
[MIT License](./LICENSE) - Copyright (c) 2026 Team Ketupat / Metropolis Hackathon
