# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Agent Wallet** — A next-generation crypto wallet with autonomous trading capabilities powered by AI. The Agent uses a hybrid decision model (rules engine + Claude LLM) to analyze market conditions and execute trades. User private keys are never stored on the server (MetaMask signing model).

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Wallet:** wagmi v2 + viem (read-only, MetaMask for signing)
- **Blockchain:** Ethereum (Sepolia testnet by default)
- **Oracle:** Chainlink Price Feeds
- **AI:** Anthropic Claude API (haiku-4-5 for fast analysis)
- **Database:** SQLite (better-sqlite3) for trade/decision logging
- **State:** Zustand

## Common Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint

# Database
npm run db:init      # Initialize SQLite database
npm run db:reset     # Clear all data
```

## Architecture

### Core Modules

**`lib/blockchain/`**
- `client.ts` — viem publicClient for Ethereum
- `oracle.ts` — Chainlink price feed queries (30s polling by default)
- `uniswap.ts` — Uniswap v3 swap building (not yet implemented)

**`lib/agent/`**
- `rules.ts` — Rule engine: evaluates stop-loss, take-profit, DCA strategies
- `llm.ts` — Claude API wrapper for market analysis and confidence scoring
- `engine.ts` — Main agent loop: polls prices, triggers rules, calls LLM, logs decisions

**`lib/db/`**
- `index.ts` — SQLite schema + CRUD ops for strategies, trades, decisions

**`hooks/`**
- `useChainlinkPrice.ts` — Real-time price subscription hook
- `useAgentStatus.ts` — Agent running status and decision history

**`components/`**
- `Portfolio/` — Display holdings and portfolio value
- `AgentStatus/` — Start/stop Agent, show recent decisions
- `TradeConfirm/` — Pre-execution confirmation (not yet implemented)

### API Routes

- `GET /api/prices?symbol=ETH/USD` — Fetch Chainlink price
- `GET /api/agent/status` — Agent running state + config
- `GET /api/agent/decisions?limit=100` — Agent decision history
- `POST /api/agent/start` — Start Agent with config
- `POST /api/agent/stop` — Stop Agent

## Agent Decision Flow

```
Chainlink Price Update (every 30s)
    ↓
Evaluate Rules (stop-loss, take-profit, etc.)
    ↓
If rule triggered:
  ├─ Use Claude to analyze market context
  ├─ Return confidence + recommendation
  ├─ If confidence > threshold: auto-execute (with user MetaMask signature)
  └─ If confidence < threshold: notify user, wait for approval
    ↓
Log decision + trade to SQLite
```

## Key Implementation Details

### Chainlink Integration
- Direct contract call to `latestRoundData()` and `decimals()`
- Price feeds on Ethereum: ETH/USD → `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`
- Fallback for testing: Sepolia → `0x694AA1769357215DE4FAC081bf1f309aDC325306`

### Rule Engine
- Strategies stored in SQLite, evaluated in-memory every poll cycle
- Types: `stop_loss`, `take_profit`, `dca`, `alert`
- DCA (Dollar-Cost Averaging) is time-based; other rules are price-based

### LLM Decisions
- Model: `claude-haiku-4-5-20251001` (fast + cheap for frequent polling)
- Context: current price, holdings, triggered strategies, portfolio value
- Output: action (`buy|sell|hold`) + confidence (0-100) + reasoning
- Claude's tool use ensures JSON parsing reliability

### Private Key Management
- Zero server-side key storage
- All transactions signed by MetaMask on client
- Database only logs: tx hash, from/to, amount, reason
- Signers managed entirely by user's browser wallet

## Testing Notes

- Use Sepolia testnet (chain ID 11155111) for development
- Mock portfolio in API responses until wagmi wallet connection is wired
- SQLite database file: `~/.ai-agent-wallet/data.db`
- Set `NEXT_PUBLIC_SEPOLIA_RPC` env var to override default RPC

## Known Limitations (MVP)

- No Uniswap swap execution yet (route built but not signed); `autoExecute` only marks a decision as `executed`, it does NOT send a transaction
- No DCA execution scheduling (logic in rules.ts but not time-triggered)
- Portfolio: the standalone daemon reads real on-chain ETH balance when `AGENT_WALLET_ADDRESS` is set (read-only), else falls back to mock 1 ETH; ERC-20 valuation still not done

### Persistent daemon (implemented)

The agent runs as a standalone 24/7 process — `daemon/agent.ts`, bundled by esbuild (`npm run build:daemon`) to `dist/daemon.mjs`, run under systemd as `ai-agent-wallet-daemon.service` (see DEPLOY.md). The web process no longer runs an in-process loop. Coordination is via the SQLite `agent_state` table (single row id=1, WAL mode): the web `start/stop` routes toggle `enabled`/config, the daemon obeys it and writes `lastHeartbeat` each cycle; `status` reports `running = enabled && heartbeat-fresh`. Core decision logic stays in `lib/agent/engine.ts` `executeAgentDecision(portfolio, opts)`, reused by the daemon.

## Future Enhancements

1. Wire MetaMask connection with wagmi for real holdings
2. Implement Uniswap swap execution + gas estimation
3. Add more Oracle data sources (Pyth Network)
4. Support multiple assets (not just ETH)
5. Persistent agent running (backend service)
6. Advanced charting + backtesting
