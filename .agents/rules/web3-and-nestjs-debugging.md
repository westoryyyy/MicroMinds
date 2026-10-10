---
description: Critical debugging guardrails for Web3 interactions (Viem/Alchemy) and NestJS watch mode constraints.
---

# Web3 Debugging & NestJS Best Practices

These rules were learned from past debugging sessions to prevent recurring issues and save time.

## 1. Viem/Alchemy Error Interpretation
**Constraint:** When encountering generic `Missing or invalid parameters` errors in Viem/Alchemy during `writeContract` or `sendTransaction`, you must immediately check if the operator/signer wallet has sufficient native token balance (gas) on the target network before debugging ABI or parameters.
**Reason:** Alchemy's RPC often masks "insufficient funds for gas" behind this generic error code. The true error is usually hidden in the `details` field (e.g., `Signer had insufficient balance`).

## 2. Smart Contract Operator Recovery
**Behavior:** If a background task or API fails because an operator wallet lacks gas fees, but you have access to a funded deployer/owner wallet, do not passively wait for the user to fund the operator.
**Action:** Proactively suggest and execute an on-chain transaction (using a quick Viem script) to call `setOperator()` and promote the funded owner wallet to be the new operator to unblock development immediately.

## 3. NestJS Watch Mode Trap
**Constraint:** NEVER place temporary, scratch, or debugging scripts (e.g., `test.ts`) inside project directories that are actively watched by `nest start --watch` (such as `src/`, or `scripts/` if included in `tsconfig.json`).
**Reason:** Placing unrelated scripts in watched directories triggers the NestJS compiler, which can lead to cascading compilation failures from unrelated `node_modules` (e.g., `ox/core/Errors.ts` types issues).
**Action:** Always execute temporary TypeScript/Node scripts from the Antigravity `scratch/` directory or a completely external `/tmp` path to avoid polluting the project's build process.
