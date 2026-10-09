# X-Ray Report

> MicroMinds Escrow | 0 nSLOC | f1af04b (`main`) | foundry | 09/10/26

---

## 1. Protocol Overview

**What it does:** Escrows native token (MON) deposits for API consumption, relying on a centralized operator to reserve, release, or refund.

- **Users**: Consumers depositing funds, Providers offering services.
- **Core flow**: Consumer deposits MON, Operator reserves funds per API call, then releases to provider.
- **Key mechanism**: Escrow state machine.
- **Token model**: Native Token (MON) only.
- **Admin model**: Owner can change Operator.

For a visual overview of the protocol's architecture, see the [architecture diagram](architecture.svg).

### Contracts in Scope

| Subsystem | Key Contracts | nSLOC | Role |
|-----------|--------------|------:|------|
| Core | Escrow | 0 | Holds balances and manages call state transitions |

### How It Fits Together

The core trick: The operator acts as the source of truth for off-chain API calls, managing reservations against pre-funded on-chain balances.

### User Flow
```solidity
Escrow.deposit() /* Increases consumer balance */
  └── Escrow.withdraw() /* User pulls available funds */
```

### Operator Flow
```solidity
Escrow.reserve() /* Locks funds for a specific API call */
  ├─ Escrow.release() /* Credits provider balance */
  └─ Escrow.refund() /* Returns funds to consumer balance */
```

---

## 2. Threat & Trust Model

> Protocol classified as: **Governance/Admin** with **Payment/Escrow** characteristics
Protocol heavily relies on a trusted operator and owner to facilitate state transitions and system continuity.

### Actors & Adversary Model

| Actor | Trust Level | Capabilities |
|-------|-------------|-------------|
| Owner | Trusted | Instant `setOperator` |
| Operator | Trusted | Instant `reserve`, `release`, `refund` |

**Adversary Ranking**:

1. **Compromised Operator** — Centralized entity controlling state transitions and accounting.
2. **Compromised Owner** — Can change the operator instantly.

### Trust Boundaries

**Owner** — Instant control over the Operator address.
**Operator** — Instant control over user balances via reserve, release, and refund.

### Key Attack Surfaces

- **Operator operational powers** &nbsp;&#91;[G-2](invariants.md#g-2)&#93; — Operator has full control over state transitions; worth confirming implementation handles limits or checks if operator goes rogue.
- **Skeleton implementation** — Most functions are currently `revert("TODO")`; full audit needed once logic is implemented.

---

## 3. Invariants

> ### 📋 Full invariant map: **[invariants.md](invariants.md)**
>
> A dedicated reference file contains the complete invariant analysis — do not look here for the catalog.
>
> - **4 Enforced Guards** (`G-1` … `G-4`) — per-call preconditions with `Check` / `Location` / `Purpose`
> - **0 Single-Contract Invariants** (`I-1` … `I-N`) — Conservation, Bound, Ratio, StateMachine, Temporal
> - **0 Cross-Contract Invariants** (`X-1` … `X-N`) — caller/callee pairs that cross scope boundaries
> - **0 Economic Invariants** (`E-1` … `E-N`) — higher-order properties deriving from `I-N` + `X-N`
>

---

## 4. Documentation Quality

| Aspect | Status | Notes |
|--------|--------|-------|
| README | Present | README.md |
| NatSpec | ~23 annotations | Thorough coverage on functions |
| Spec/Whitepaper | Present | docs/ESCROW_SPEC.md |
| Inline Comments | Sparse | Functions are skeletons |

---

## 5. Test Analysis

| Metric | Value | Source |
|--------|-------|--------|
| Test files | 0 | File scan (always reliable) |
| Test functions | 0 | File scan (always reliable) |
| Line coverage | 0.00% | Coverage tool |
| Branch coverage | 0.00% | Coverage tool |

### Test Depth

| Category | Count | Contracts Covered |
|----------|-------|-------------------|
| Unit | 0 | None |
| Stateless Fuzz | 0 | None |
| Stateful Fuzz (Foundry) | 0 | None |
| Formal Verification (Certora) | 0 | None |

### Gaps

Missing unit tests, fuzz testing, and formal verification. Skeleton contract.

---

## 6. Developer & Git History

> Repo shape: squashed_import — All source arrived in 1 commit (f1af04b); no development history visible.

### Contributors

| Author | Commits | Source Lines (+/-) | % of Source Changes |
|--------|--------:|--------------------|--------------------:|
| westoryyyy | 4     | +180 / -3       | 100%                |

### Review & Process Signals

| Signal | Value | Assessment |
|--------|-------|------------|
| Unique contributors | 1 | Single-dev |
| Merge commits | 0 of 4 (0%) | No merge commits — likely no peer review |
| Repo age | 2026-10-09 → 2026-10-09 | 0 days |
| Recent source activity (30d) | 2 commits | Active |
| Test co-change rate | 0% | No tests modified |

### File Hotspots

| File | Modifications | Note |
|------|-------------:|------|
| src/Escrow.sol | 2 | High churn — prioritize review |

### Security Observations

- **Single-developer dominance** — westoryyyy authored 100% of all commits.
- **Missing code review signals** — 0 merge commits detected.
- **Fix commits without corresponding test file changes** — Tests are missing.

### Cross-Reference Synthesis

- **Escrow.sol is a skeleton** — Logic needs to be implemented before a complete threat model can be determined.

---

## X-Ray Verdict

**EXPOSED** — Zero test functions and skeleton code implementation.

**Structural facts:**
1. 0 nSLOC across 1 subsystems
2. 0 test files with 0 test functions
3. 1 developers wrote 100% of code
