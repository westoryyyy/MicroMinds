<div align="center">

<img src="./frontend/src/app/icon.png" width="115" alt="MicroMinds Logo" />

# MicroMinds

### The Decentralized Tool Gateway & Smart Contract Escrow Protocol for Autonomous AI Agents

*The OpenRouter for AI Agent Tools. Deposit MON, get 1 API key, and let autonomous agents discover, invoke, and settle micro-APIs via trustless on-chain escrow on Monad.*

<br/>

[![Network](https://img.shields.io/badge/Network-Monad%20Testnet%20(10143)-836EF9?style=flat-square)](https://testnet.monadscan.com/address/0x5c7141ab4d637915858ee97881fd613af468c76a)
[![Protocol](https://img.shields.io/badge/Protocol-Anthropic%20MCP-orange?style=flat-square)](https://modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)
[![Hackathon](https://img.shields.io/badge/Monad-Metropolis%20Hackathon-purple?style=flat-square)](https://monad.xyz)

<br/>

[🌐 Live App](https://www.microminds.tech) &nbsp;&bull;&nbsp;
[📖 How it Works](https://www.microminds.tech/docs) &nbsp;&bull;&nbsp;
[⚡ API Gateway](https://microminds-production.up.railway.app) &nbsp;&bull;&nbsp;
[📜 Smart Contract](https://testnet.monadscan.com/address/0x5c7141ab4d637915858ee97881fd613af468c76a)

</div>

---

## ⚡ The Problem: Why Autonomous AI Agents Are Paralyzed & Broke

Meet **Ketupat**, an AI engineer building autonomous multi-agent systems in Cursor and Claude. Ketupat's agents are capable of remarkable multi-step reasoning. But the moment an agent needs to perform real-world tasks—scraping live data, formatting messy JSON, verifying a smart contract, or running specialized financial queries—it hits a brick wall.

**Web2 payment rails were built for humans with credit cards, not autonomous machines with code.**

Every time Ketupat's agent needs an external capability, it encounters four major friction points:

| Friction Point | Traditional Web2 Pain (Today) | Why It Breaks AI Agents |
| :--- | :--- | :--- |
| **💳 SaaS Subscription Trap** | Ketupat pays $250+/month across 6 separate SaaS platforms | Tools only needed 5 times a week, but billed as recurring monthly plans |
| **🔑 API Key Sprawl** | Juggling 10 developer portals, 10 `.env` keys, and rate limits | High maintenance overhead and brittle production setups |
| **🤖 Zero Agent Commerce** | Machine execution halts at credit card, 2FA, and checkout gates | Agents cannot fill checkout forms or approve MetaMask popups mid-loop |
| **⚖️ The Trust Dilemma** | Pre-paying unverified APIs risks rug-pulls; delivering first invites scraping | Zero escrow protection or verification in traditional HTTP APIs |

---

## 💡 The Solution: MicroMinds — The OpenRouter for AI Agent Tools

**MicroMinds** removes human friction from the machine commerce loop completely. 

Instead of forcing developers to buy subscriptions or manually approve transactions, MicroMinds introduces a unified **Discovery, Execution & Escrow Protocol** powered by Monad's high-speed consensus:

| Phase | Actor | Action & Mechanism |
| :--- | :--- | :--- |
| **1. One-Time Setup** | **Ketupat** *(Human Developer)* | Connects Monad wallet once $\rightarrow$ Deposits `MON` into `Escrow.sol` $\rightarrow$ Generates universal `x-api-key`. |
| **2. Autonomous Discovery** | **AI Agent** *(Autonomous)* | Calls `search_api("data extraction")` via MCP to find live tool listings, prices, and schemas. |
| **3. Autonomous Execution** | **AI Agent** *(Autonomous)* | Calls `call_api(listingId, input)` directly—zero human approval or checkout forms needed. |
| **4. On-Chain Settlement** | **Monad Escrow Protocol** | Reserves funds on Monad $\rightarrow$ verifies response $\rightarrow$ releases MON upon success (or 100% refund). |

### The Three Core Pillars:
1. **One Universal Key (`x-api-key`):** Access hundreds of community and enterprise micro-APIs through a single credential. No more API key sprawl.
2. **One On-Chain Escrow Balance:** Deposit native `MON` once. Pay strictly **per call** (as low as $0.001 / call) directly from the smart contract escrow ledger.
3. **Autonomous Discovery (No Human Shopping Carts):** Humans never shop manually on the website. The website is strictly a setup panel and discovery showcase. The AI Agent itself dynamically queries `/listings`, picks the best tool, and executes it on the fly.

---

## 🏪 The Provider Opportunity: Monetize Micro-APIs for Machines

The next billion API consumers aren't humans reading documentation—**they are autonomous AI agents executing code 24/7**.

Until now, developers building specialized utilities (e.g. smart contract vulnerability scanners, dynamic web scrapers, or token risk analyzers) had no viable way to monetize them:

* **Stripe & PayPal overhead** is economically impossible for $0.002 micro-transactions.
* **Human users won't subscribe** to niche utilities they only need occasionally.
* **Non-payment risk:** Delivering data upfront leaves providers vulnerable to unpaid scraping.

### How MicroMinds Empowers Sellers:
* **List in 60 Seconds:** Connect your wallet, register your endpoint URL, specify input/output schemas, and set your price in native `MON` (e.g. `0.005 MON / call`).
* **Guaranteed Settlement (Zero Non-Payment Risk):** Before any payload reaches your server, the Gateway verifies that consumer funds are already securely locked (`reserve`) on Monad. When your API returns `200 OK`, Monad's smart contract instantly credits your balance (`release`).
* **Non-Custodial Direct Withdrawals:** Providers can invoke `withdraw(amount)` directly on `Escrow.sol` at any time to pull accumulated MON straight into their personal wallet.
* **Instant Global Distribution:** Once listed, your tool is immediately searchable via `search_api` to thousands of autonomous agents running on Claude Desktop, Cursor, and LangChain worldwide.

---

## 💼 Business Model & Sustainable Unit Economics

MicroMinds is architected from the ground up to monetize **high-frequency, machine-to-machine commerce** where traditional Web2 payment aggregators fail.

### 💰 Four Diversified Revenue Streams:

| Revenue Stream | Mechanism | Target Audience | Projected Economics |
| :--- | :--- | :--- | :--- |
| **1. Protocol Take-Rate** | **2.5% fee** deducted on-chain upon successful `release()` of funds | All Tool Providers | 0% on Testnet; 2.5% on Mainnet. Highly scalable across millions of daily agent calls. |
| **2. Staked Tool Discovery** | Providers stake `MON` to boost ranking and trust score in `search_api` results | Tool Creators & Sellers | Locked liquidity reduces circulating MON supply while generating curation yields. |
| **3. Enterprise Agent Gateway** | Dedicated egress infrastructure, custom rate-limits, and guaranteed TPS SLAs | Enterprise AI Agent Swarms | Tiered B2B subscription for hedge funds, legal tech, and automated auditing swarms. |
| **4. Serverless Tool Hosting** *(Roadmap)* | 1-Click containerized microservice hosting with built-in escrow integration | Independent Developers | Infrastructure margin on decentralized serverless compute and egress bandwidth. |

---

### 📊 The Micro-Transaction Math: Why Web2 Fails & Monad Wins

Traditional payment processors make micro-transactions economically unviable. MicroMinds leverages Monad's parallel architecture to make sub-cent transactions profitable:

| Economic Metric | Web2 Payment Rails (Stripe / PayPal) | Traditional EVM / L2s | **MicroMinds on Monad** |
| :--- | :--- | :--- | :--- |
| **Target Transaction Size** | $10.00 – $250.00 | $5.00 – $50.00 | **$0.001 – $0.05 per API call** |
| **Fixed Processing Fee** | $0.30 per transaction | $0.05 – $2.50 (Gas volatility) | **<$0.0001 per transaction** |
| **Effective Fee on $0.002 Call** | **1,500%** *(Completely Impossible)* | **2,500%** *(Unviable for Agents)* | **2.5% protocol fee ($0.00005)** |
| **Settlement Time** | 2 – 5 business days | 12 – 60 seconds | **Sub-second atomic settlement** |
| **Refund Mechanism** | Manual dispute (chargeback fee) | Manual multisig interaction | **Automated 100% on-chain refund** |

---

### 🛡️ Competitive Moat: The Flywheel of Autonomous Commerce

```text
               +-------------------------------------------+
               |  More Autonomous Agents (Cursor / Claude) |
               +---------------------+---------------------+
                                     |
                                     ▼
                      +-----------------------------+
                      | Higher Daily Transaction    |
                      | Volume Settled in MON       |
                      +--------------+--------------+
                                     |
                                     ▼
   +-------------------------+       |       +-------------------------+
   | Lower Per-Call Fees &   |<------+------>| Greater Revenue for     |
   | Deeper Tool Liquidity   |               | Tool Creators (Sellers) |
   +-------------------------+               +-------------------------+
                                     ▲
                                     |
               +---------------------+---------------------+
               | More Specialized Tools & Micro-APIs Listed |
               +-------------------------------------------+
```

1. **First-Mover MCP Advantage:** By deploying native Model Context Protocol (MCP) servers, MicroMinds becomes the default runtime tool provider for developers in Claude Desktop and Cursor.
2. **Defensible Network Effects:** As more AI agents query `/listings`, providers receive immediate paying machine traffic, attracting more tool creators and deepening the catalog.
3. **Trustless On-Chain Moat:** Unlike centralized API aggregators that can withhold payouts, MicroMinds' non-custodial `Escrow.sol` contract ensures sellers can pull their accumulated MON at any time, cementing provider loyalty.

---

## 📈 Go-to-Market & User Acquisition Strategy

### Overview & The Two-Sided Flywheel
MicroMinds is a two-sided marketplace. Our go-to-market is a self-reinforcing flywheel: high-utility tool creators on the supply side, autonomous agent developers on the demand side, and the Model Context Protocol (MCP) as the distribution bridge that connects them. On-chain escrow-backed settlement is what keeps it turning without counterparty risk.

### 1. Why Now? (Macro Tailwinds)
* **Distribution Already Exists:** MCP boasts 97M+ monthly SDK downloads and 10,000+ public servers, governed by the Agentic AI Foundation under the Linux Foundation.
* **Machine Payments Are Real:** The x402 protocol recorded ~75M transactions worth $24M over a 30-day window in mid-2026, and Stripe unveiled its Machine Payments Protocol in March 2026.
* **Measurable Subscription Fatigue:** Zylo's 2026 SaaS Management Index reports that **46% of SaaS licenses go unused in any 30-day window** (costing ~$19.8M annually per enterprise). AI agent developers inherit the same broken model: rigid monthly plans for occasional tools.
* **Monad Enables True Micro-Commerce:** Traditional card rails charge `2.9% + $0.30` (150x the cost of a $0.002 API call). A native transfer on Monad costs ~0.0021 MON (~$0.00005 at $0.02/MON), making sub-cent machine transactions economically viable.

> *"Payment standards answer how an agent pays. MicroMinds answers what comes before and after: which tool to use, and what happens if the call fails."*

### 2. Target Audience & First Adopters
* **Demand Side (Buyers):** AI engineers building multi-agent systems, power users of Claude Desktop and Cursor, hackathon teams building rapid prototypes, and automated Web3 trading/analytics bots.
* **Supply Side (Sellers):** Independent developers, scrapers, ML engineers, and smart contract researchers with specialized scripts who want instant monetization without building billing systems or Stripe portals.

### 3. Acquisition Channels
* **MCP Hub Distribution (Demand Side):** Publish open-source MCP server to the Official MCP Registry, Smithery.ai, and PulseMCP. Lightweight TypeScript and Python client SDKs for LangChain, CrewAI, and Microsoft Agent Framework.
* **Supply-Side Bootstrap ("First 50 Providers" Program):** Hand-picked launch cohort across smart contract auditors, DEX arbitrage calculators, social sentiment parsers, and wallet analytics. Funded launch credits ensure providers see real paid calls from Day 1. Zero protocol fees during bootstrap.
* **Monad Native Ecosystem & DeltaV:** Partner with Monad DeFi protocols to list on-chain state feeds. Carry MicroMinds into DeltaV (800+ Monad startups) and leverage Metropolis ecosystem support to fund provider incentives.

### 4. Rollout Phases
* **Phase 1 (Launch):** Live product on Monad Testnet, MCP server published to registries, interactive Playground live.
* **Phase 2 (Bootstrap):** Onboard the first 50 providers with launch credits, zero protocol fees, and first-party seed tools.
* **Phase 3 (Scale):** Open permissionless listings, add ecosystem data feeds, and transition the escrow protocol to Monad Mainnet.

### 5. Key Metrics We Track
* Active verified tool listings
* Weekly successful paid agent invocations
* Agent retention (share of agents returning for repeat calls)
* Refund rate (vital health metric for provider quality)
* Time from provider sign-up to first paid call


---

## 🔄 Sequence Diagrams

### 1. Developer Setup & Autonomous Agent Discovery (MCP)
How a human configures once, and how the AI Agent autonomously discovers and consumes tools via MCP without any manual human purchasing:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer (Ketupat)
    participant Web as MicroMinds Web App (Vercel)
    participant Escrow as Monad Escrow Contract
    actor Agent as Autonomous AI Agent (Cursor / Claude)
    participant MCP as MicroMinds MCP Server
    participant Gateway as MicroMinds API Gateway (Railway)

    Note over Dev,Escrow: Phase 1: One-Time Human Setup
    Dev->>Web: Connect Wallet (Privy) & Deposit MON
    Web->>Escrow: deposit{value: 0.5 MON}()
    Escrow-->>Web: Balance credited on Monad Testnet
    Dev->>Web: Generate 1 Universal API Key (x-api-key)
    Dev->>Agent: Add MicroMinds MCP configuration

    Note over Agent,Gateway: Phase 2: Autonomous Agent Discovery, Execution & Settlement Loop
    Dev->>Agent: "Fetch latest customer feedback & extract contact leads"
    Agent->>MCP: check_balance()
    MCP->>Gateway: GET /me (Verify Escrow Balance)
    Gateway-->>MCP: Balance: 4.9994 tMON (Active on Monad Testnet)
    Agent->>MCP: search_api(q: "extract")
    MCP->>Gateway: GET /listings?q=extract
    Gateway-->>MCP: [ { id: "ec024b...", name: "Text Extraction", price: "0.0001 MON" } ]
    MCP-->>Agent: Available tools, schemas, and live pricing

    Agent->>MCP: call_api(listingId: "ec024b...", input: { text: "..." })
    MCP->>Gateway: POST /call (with x-api-key + payload)
    Gateway->>Escrow: reserve() -> verify provider -> release()
    Escrow-->>Gateway: 200 OK + On-Chain Tx Hash (0xc14bef...)
    Gateway-->>MCP: Output (emails, phones) + Settlement Receipt
    MCP-->>Agent: Data ingested directly into context window
    Agent-->>Dev: Final contact leads delivered with verified Monad TxHash!
```

---

### 2. Provider Lifecycle: Listing, Execution & Non-Custodial Earnings
How developers list their microservices, earn MON per call, and withdraw revenue non-custodially:

```mermaid
sequenceDiagram
    autonumber
    actor Seller as Tool Creator / Provider
    participant Portal as MicroMinds Provider Portal
    participant Registry as Listings Database
    participant Escrow as Monad Escrow Contract
    actor Agent as Autonomous AI Agent
    participant Gateway as MicroMinds API Gateway

    Note over Seller,Registry: Step 1: Provider Lists Tool (Zero Stripe / Billing Setup)
    Seller->>Portal: Connect Wallet & Register Endpoint
    Portal->>Registry: POST /listings (URL, JSON Schema, Price: 0.005 MON)
    Registry-->>Seller: Listing Live & Globally Searchable!

    Note over Agent,Seller: Step 2: Agent Discovers & Pays per Call
    Agent->>Gateway: POST /call (Invokes Seller's Listing)
    Gateway->>Escrow: reserve(callId, consumer, seller, 0.005 MON)
    Gateway->>Seller: Forward Input Payload to Provider Endpoint
    Seller-->>Gateway: HTTP 200 OK + Valid Output Data
    Gateway->>Escrow: release(callId)
    Escrow-->>Seller: 0.005 MON credited on-chain to Provider balance!

    Note over Seller,Escrow: Step 3: Non-Custodial Earnings Withdrawal
    Seller->>Escrow: withdraw(totalEarnedMON)
    Escrow-->>Seller: MON transferred directly to Provider's Personal Wallet
```

---

### 3. On-Chain Escrow Lifecycle & Fault-Tolerant Settlement on Monad
How the off-chain Gateway Operator and on-chain `Escrow.sol` contract protect funds with atomic reservation, verification, and instant refunds:

```mermaid
sequenceDiagram
    autonumber
    actor Consumer as Consumer / AI Agent
    participant Escrow as Escrow.sol (Monad Testnet)
    participant Gateway as MicroMinds Gateway (NestJS)
    participant Provider as API Provider / Micro-Service

    Note over Consumer,Escrow: One-time setup: Deposit MON on website
    Consumer->>Escrow: deposit{value: 0.1 MON}()
    Escrow-->>Consumer: Balance credited in on-chain ledger

    Note over Consumer,Gateway: Autonomous Agent Execution Loop
    Consumer->>Gateway: POST /call (with x-api-key, listingId, input)
    Gateway->>Escrow: reserve(callId, consumer, provider, amount)
    Escrow-->>Gateway: Event Reserved (Status = Reserved)

    Gateway->>Provider: Forward payload to microservice

    alt Success Case (Provider Responds 200 OK)
        Provider-->>Gateway: Valid JSON Response
        Gateway->>Escrow: release(callId)
        Escrow-->>Provider: Balance credited on-chain (Status = Released)
        Gateway-->>Consumer: Return data output to AI Agent
    else Error Case (Provider 400 / 500 / Timeout)
        Provider-->>Gateway: HTTP Error / Timeout
        Gateway->>Escrow: refund(callId)
        Escrow-->>Consumer: 100% Funds restored on-chain (Status = Refunded)
        Gateway-->>Consumer: Return Error + Refund Tx Hash
    end

    Note over Consumer,Escrow: Non-Custodial Guarantee: If Gateway stalls past 24h,<br/>Consumer can call forceRefund(callId) directly on-chain.
```

---

## 🤖 For AI Agents: Model Context Protocol (MCP)

MicroMinds natively supports Anthropic's **Model Context Protocol (MCP)**. Any MCP-compliant environment (**Claude Desktop**, **Cursor IDE**, **Zed**, **Windsurf**, or **Antigravity**) can instantly discover and invoke tools.

### 1. Add Configuration
Add this to your `claude_desktop_config.json` or Cursor MCP settings (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "microminds": {
      "command": "npx",
      "args": ["-y", "microminds-mcp"],
      "env": {
        "MICROMINDS_API_KEY": "mm_your_api_key_here",
        "MICROMINDS_BASE_URL": "https://microminds-production.up.railway.app"
      }
    }
  }
}
```

### 2. The Three Universal Autonomous Agent Primitives

When installed, your AI Agent gains access to three universal MCP tools:

| MCP Tool Primitive | Function & Purpose | Autonomous Machine Behavior |
| :--- | :--- | :--- |
| **`check_balance`** | Autonomous Financial Awareness | Checks current available prepaid `tMON` balance and wallet status on Monad Testnet before or after shopping micro-APIs. |
| **`search_api`** | Dynamic Tool Discovery | Searches the MicroMinds registry dynamically by capability keyword or max price in wei. |
| **`call_api`** | Escrow Execution & Settlement | Executes the target micro-API with atomic on-chain reservation, output ingestion, and Monad settlement receipt. |

---

### 3. Tested Ready-to-Use Natural Prompts

Copy and paste any of these tested prompts directly into your AI chat (Claude Desktop, Cursor, or VS Code):

* **🔍 Prompt A (Discovery):**
  > *"Please search the MicroMinds marketplace for available AI tools and API services on Monad."*
* **💳 Prompt B (Autonomous Balance Check):**
  > *"Please check my available tMON balance on MicroMinds to see if I have enough funds for micro-API calls."*
* **⚡ Prompt C (Lead & Contact Extraction):**
  > *"Morning! Can you search MicroMinds for an API on Monad, and buy/call it to extract emails and phone numbers from: 'Hey! Contact our team at partnerships@innovatecorp.com or +1-800-555-0199'?"*
* **🔗 Prompt D (OpenGraph Link Preview):**
  > *"In index.html, borrow the URL Metadata API from MicroMinds to generate preview card details for 'https://monad.xyz' on Monad testnet."*

---

## ⚡ Verified Live Execution on Monad Testnet

MicroMinds is live in production. Here is an authentic, untampered payload returned by an autonomous AI agent in **VS Code & Cursor** executing an on-chain extraction call via MicroMinds:

```json
{
  "callId": "0x65948e7454369e200e31d491a5ead1824a92bee7d8a26b64b586b3906a22f32f",
  "status": "released",
  "output": {
    "emails": [
      "partnerships@innovatecorp.com"
    ],
    "phones": [
      "+1-800-555-0199"
    ]
  },
  "settlement_receipt": {
    "status": "released",
    "network": "Monad Testnet",
    "cost": "0.000100 tMON",
    "costWei": "100000000000000",
    "txHash": "0xc14bef8e279978c5d8e27e371385841b32817e81c9e57aa24c332dfad501aa9",
    "explorerUrl": "https://testnet.monadexplorer.com/tx/0xc14bef8e279978c5d8e27e371385841b32817e81c9e57aa24c332dfad501aa9",
    "escrow": "MicroMinds Escrow Protocol"
  }
}
```

> **🛡️ Zero-Risk Escrow Guarantee:** If an external provider times out or returns an HTTP 500 error, Monad's smart contract automatically executes a **100% on-chain refund** to the consumer wallet. Zero funds are ever lost on failed executions.

---

## 🌐 Universal AI Agent Ecosystem Compatibility

MicroMinds is designed exclusively for the **Autonomous Agent Economy**. Any environment supporting Anthropic's Model Context Protocol (MCP) integrates seamlessly out of the box:

```text
                  +-----------------------------------+
                  |      MicroMinds Gateway & Escrow  |
                  |     (Monad Testnet Settlement)    |
                  +-----------------+-----------------+
                                    |
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
   [ Desktop AI ]            [ Coding IDEs ]          [ Autonomous Swarms ]
   Claude Desktop,           Cursor, VS Code (Cline),  LangChain, CrewAI,
   Antigravity               Windsurf, Zed, Devin      AutoGPT, ElizaOS
```

All interactions happen through native tool calls (`check_balance`, `search_api`, `call_api`) without human friction or manual checkout processes.

---

## 🛠️ Infrastructure & Tech Stack Overview

| Layer | Component | Technology | Role & Deployment |
|---|---|---|---|
| **Consensus & Settlement** | Escrow Contract | Solidity `^0.8.24` + Foundry | On-Chain Escrow Protocol on Monad Testnet (`10143`) |
| **Real-Time Event Indexing**| Sub-Second Indexer | Envio HyperIndex | Indexing `Escrow.sol` events into GraphQL (`Call`, `Balance`, `Deposit`) |
| **RPC & Node Infrastructure**| Monad Connection | Alchemy | Enterprise Monad Testnet RPC powering Operator Signer & Viem reads |
| **API Gateway & Operator** | Backend API | NestJS + TypeScript | Off-chain API Gateway, Operator Signer, LLM Provider Orchestrator on Railway |
| **Marketplace & Dashboard**| Frontend Web | Next.js 16 + React 19 + TailwindCSS | Wallet Connection, Escrow Deposit UI, Key Generator, Docs on Vercel |
| **Identity & Delegation**  | Web3 Auth | Privy | Social logins, embedded wallets, and session validation |
| **Database**               | Persistence | PostgreSQL (Railway) | API key hashes, tool registry, call audit logs |
| **Tool Protocol**          | Agent Plugin | `@modelcontextprotocol/sdk` | MCP Server providing `check_balance`, `search_api` & `call_api` |
| **CI / CD Pipeline**       | Quality Gates | GitHub Actions | Automated linting, typechecks, and build validations |

---

## 🔗 On-Chain Escrow Contract Details

* **Network:** Monad Testnet
* **Chain ID:** `10143`
* **RPC Endpoint:** `https://testnet-rpc.monad.xyz`
* **Escrow Address:** [`0x5c7141ab4d637915858ee97881fd613af468c76a`](https://testnet.monadscan.com/address/0x5c7141ab4d637915858ee97881fd613af468c76a)
* **Contract Architecture:**
  * Native MON balance tracking (zero ERC-20 token wrapper friction).
  * Automated `reserve()`, `release()`, and `refund()` lifecycle methods.
  * Non-custodial safety: Users can execute `forceRefund(callId)` if the off-chain operator fails to resolve an expired call.
  * Hardened with OpenZeppelin `ReentrancyGuard` and `Ownable2Step`.

---

## 🗂️ Monorepo Structure

```text
MicroMinds/
├── .github/workflows/       # GitHub Actions CI/CD Pipeline
├── backend/                 # NestJS API Gateway, Envio Indexer & MCP Server
│   ├── apps/api/            # Core REST API Gateway & Escrow Operator (Viem + Alchemy)
│   ├── apps/indexer/        # Envio HyperIndex real-time event indexer & GraphQL API
│   ├── packages/mcp-server/ # Model Context Protocol (MCP) server package
│   └── package.json         # Workspace scripts & dependencies
├── frontend/                # Next.js 16 Web Marketplace & Dashboard
│   ├── src/app/             # App Router pages (Dashboard, Explore, Docs, Dev)
│   ├── src/components/      # UI Components, Crayon Badges, Wallet Connectors
│   ├── src/lib/envio.ts     # Declarative Envio GraphQL client integration
│   └── package.json         # Frontend dependencies & Next.js config
├── smart-contract/          # Escrow protocol reference (Solidity)
│   ├── src/Escrow.sol       # Core Escrow contract
│   └── test/Escrow.t.sol    # 26 Foundry unit & fuzz tests (100% passing)
├── LICENSE                  # MIT License
└── README.md                # Flagship project documentation
```

---


---

## 🧪 How to Test MicroMinds (3-Minute Judge Walkthrough)

* **🌐 Live App:** [https://www.microminds.tech](https://www.microminds.tech)
* **⚡ Monad Testnet:** Chain ID `10143`
* **📜 Escrow Contract:** [`0x5c7141ab4d637915858ee97881fd613af468c76a`](https://testnet.monadscan.com/address/0x5c7141ab4d637915858ee97881fd613af468c76a)

### ⚡ Fastest Path (Under 3 Minutes)

#### Step 1: Sign in with Google (Zero Seed-Phrase Friction)
1. Open [https://www.microminds.tech](https://www.microminds.tech) and click **"Connect Wallet"** (top right).
2. Choose **"Continue with Google"**. Privy automatically provisions an embedded Monad Testnet wallet for your account.

#### Step 2: Fund Your Escrow Balance
1. Copy your wallet address from the user profile menu.
2. Get free testnet MON from the official faucet: [https://faucet.monad.xyz](https://faucet.monad.xyz).
3. Open the **Dashboard** tab, click **"Deposit"**, enter `0.5 tMON`, and confirm.
4. Your escrow balance updates on-chain instantly.

#### Step 3: Run a Paid Call & Test the Zero-Trust Refund
* **Success Path:**
  1. Open **Playground** (or pick **Smart Contract Auditor** from Explore).
  2. Paste this sample vulnerable contract and click **"Execute"**:
```solidity
contract Vault {
    mapping(address => uint256) public balances;
    function deposit() external payable { balances[msg.sender] += msg.value; }
    function withdraw() external {
        uint256 amount = balances[msg.sender];
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok);
        balances[msg.sender] = 0;
    }
}
```
  3. Watch the loop: funds are locked in Monad Escrow, the AI audits the contract, returns vulnerability findings, and releases payment on-chain.
* **Failure Path (Automatic Refund Guarantee):**
  1. Submit an empty or invalid payload.
  2. The call returns an error, and 100% of reserved funds are instantly refunded to your escrow balance.

#### Step 4 (Optional): Autonomous AI Agent via Claude Desktop / MCP
1. In the Dashboard, click **"Generate API Key"** and copy your key.
2. Clone this repo: `git clone https://github.com/westoryyyy/MicroMinds.git`
3. Add MicroMinds to your MCP client config (`claude_desktop_config.json` or `.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "microminds": {
      "command": "node",
      "args": ["./MicroMinds/backend/packages/mcp-server/dist/index.js"],
      "env": {
        "MICROMINDS_API_KEY": "YOUR_COPIED_KEY",
        "MICROMINDS_BASE_URL": "https://microminds-production.up.railway.app"
      }
    }
  }
}
```
4. Prompt Claude: *"Check my MicroMinds balance, find a smart contract audit tool, and review this Vault contract."*
5. Watch Claude discover, execute, and settle payments autonomously!


## 🚀 Local Development Quickstart

### Prerequisites
* Node.js `>= 20.0.0`
* `pnpm >= 9.0.0`
* [Foundry](https://getfoundry.sh/) (optional, for contract unit tests)

### 1. Clone & Install
```bash
git clone https://github.com/westoryyyy/MicroMinds.git
cd MicroMinds
```

### 2. Start Backend API
```bash
cd backend
pnpm install
cp .env.example .env
pnpm dev:api
```
*Backend runs on `http://localhost:3001`.*

### 3. Start Frontend Dashboard
```bash
cd ../frontend
pnpm install
cp .env.local.example .env.local
pnpm dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🏆 Monad Metropolis Hackathon Track Fit

### 🎯 Primary Track: Trust, Identity & Infrastructure
* **Trust:** Trustless payment escrow (`Escrow.sol`) guarantees that neither AI consumers nor tool providers can be cheated. Funds are programmatically released only upon 200 OK delivery.
* **Identity:** Privy embedded wallets seamlessly bridge Web2 users and autonomous Web3 agents with single-deposit onboarding.
* **Infrastructure:** Leverages Monad’s 10,000 TPS, sub-second block times, and microscopic gas fees to make sub-cent machine-to-machine micropayments economically feasible for the first time.

### 💎 Sponsor Integrations & Bounties
* **⚡ Envio (HyperIndex):** Indexes on-chain `Escrow.sol` events (`Reserved`, `Released`, `Refunded`) in sub-second time on Monad Testnet (`10143`). Eliminates RPC polling lag and directly powers the live Consumer Audit Ledger and Provider Revenue Dashboard via declarative GraphQL queries (`backend/apps/indexer/`).
* **🔮 Alchemy (RPC Infrastructure):** Provides enterprise-grade node connections on Monad Testnet for our automated NestJS operator signer and Viem clients. Handles high-frequency automated transaction broadcasts with zero dropped nonces or rate-limiting.
* **🔐 Privy (Embedded Wallets & Auth):** Delivers zero-friction social/wallet onboarding on Monad Testnet. Decouples human identity from autonomous machine execution via `@privy-io/react-auth` on the frontend and `@privy-io/node` on backend API guards.

---

## 👥 Team Ketupat

| Name | Role | Focus |
| :--- | :--- | :--- |
| **Nabilah Aprilia Darwin** | UI/UX Designer | User experience design, wireframing, crayon aesthetic design system & custom UI visual assets |
| **Renatha Amelia Manggala Putri** | Frontend & Backend Engineer | Next.js 16 Marketplace UI, fullstack API integration, Privy embedded wallets & Envio GraphQL hooks |
| **Grace Yoelanda Turnip** | Backend & AI Engineer | NestJS API Gateway, MCP server orchestration, agent tool execution pipelines & Viem + Alchemy RPC |
| **Rotua Paulina** | Product Manager & Smart Contract Engineer | Product strategy & roadmap, cross-functional execution, core `Escrow.sol` protocol & Monad deployment |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE) - see the LICENSE file for details.  
Copyright (c) 2026 Team Ketupat.
