# AI Agent Wallet — Project Status

**Status:** ✅ MVP Foundation Complete  
**Date:** June 27, 2026  
**Location:** `/Users/macf/Desktop/work4sky/ai-agent-wallet`

## What's Built

### Core Infrastructure ✅
- Next.js 14 full-stack setup with TypeScript
- Blockchain client (viem) configured for Ethereum Sepolia
- Chainlink Oracle price feed integration (30s polling)
- SQLite database for persistent storage (trades, strategies, decisions)
- Anthropic Claude API integration for AI decision-making

### Rule Engine ✅
- Stop-loss strategy evaluation
- Take-profit strategy evaluation
- Price alert notifications
- DCA (Dollar-Cost Averaging) framework (logic ready, needs scheduling)

### Agent System ✅
- Hybrid decision engine (rules + Claude LLM)
- Confidence scoring and auto-execute logic
- Decision history logging
- Configurable polling interval and confidence thresholds

### Frontend Dashboard ✅
- Real-time price display (ETH/USD from Chainlink)
- Portfolio overview (mock holdings for now)
- Agent status monitor (start/stop controls)
- Recent decisions display

### API Endpoints ✅
- `GET /api/prices?symbol=ETH/USD` — Chainlink price
- `GET /api/agent/status` — Agent running state
- `POST /api/agent/start` — Start Agent with config
- `POST /api/agent/stop` — Stop Agent
- `GET /api/agent/decisions` — Decision history

## What's Next (Not Yet Built)

### High Priority
1. **Wallet Connection** — Wire wagmi + MetaMask for real holdings
2. **Trading Execution** — Uniswap v3 swap signing flow
3. **Strategy Management UI** — Create/edit/delete strategies
4. **Trade Confirmation** — MetaMask signature dialog

### Medium Priority
5. **DCA Scheduling** — Time-based buying execution
6. **Multi-Asset Support** — Not just ETH, but other tokens
7. **Advanced Analytics** — Charts, backtesting, performance tracking
8. **Persistent Agent** — Run as background service, not just in-process

### Lower Priority
9. **Mobile App** — React Native version
10. **Mainnet Support** — Switch from Sepolia to mainnet
11. **Multi-Wallet** — Not just MetaMask (Ledger, WalletConnect, etc.)

## How to Run

### 1. Setup
```bash
cd /Users/macf/Desktop/work4sky/ai-agent-wallet
cp .env.local.example .env.local
# Edit .env.local and add ANTHROPIC_API_KEY
npm install
```

### 2. Start Dev Server
```bash
npm run dev
# Open http://localhost:3000
```

### 3. Test the Agent
- **Via Dashboard:** Click "Start Agent" button
- **Via API:** 
  ```bash
  curl -X POST http://localhost:3000/api/agent/start
  ```

### 4. Monitor Decisions
```bash
curl http://localhost:3000/api/agent/decisions | jq
```

## Project Structure

```
ai-agent-wallet/
├── lib/
│   ├── agent/
│   │   ├── engine.ts        # Main agent loop
│   │   ├── rules.ts         # Rule evaluation
│   │   └── llm.ts           # Claude integration
│   ├── blockchain/
│   │   ├── client.ts        # viem setup
│   │   ├── oracle.ts        # Chainlink prices
│   │   └── uniswap.ts       # [TODO] Swap execution
│   └── db/
│       └── index.ts         # SQLite schema + CRUD
├── components/
│   ├── Portfolio/           # Holdings display
│   ├── AgentStatus/         # Agent control panel
│   └── TradeConfirm/        # [TODO] Trade signature dialog
├── hooks/
│   ├── useChainlinkPrice.ts # Price polling hook
│   └── useAgentStatus.ts    # Agent state hook
├── app/
│   ├── api/
│   │   ├── agent/           # Agent control endpoints
│   │   └── prices/          # Oracle price endpoint
│   └── page.tsx             # Dashboard
├── types/                   # TypeScript interfaces
├── .env.local.example       # Configuration template
├── CLAUDE.md                # Architecture guide
├── QUICKSTART.md            # Getting started
└── PROJECT_STATUS.md        # This file
```

## Key Design Decisions

### 1. Private Key Management
- **Zero Server Storage:** All keys in user's MetaMask
- **Browser-Only Signing:** Transactions signed on client
- **Database Logs Only:** Hash, from/to, amount, timestamp

### 2. Hybrid AI Decision Model
- **Rules First:** Stop-loss/take-profit always trigger instantly
- **LLM Context:** Analyzes market if rule triggered, adds confidence
- **Human-in-Loop:** Low confidence → notify user before executing

### 3. Database Choice
- **SQLite:** Local persistence, no network needed, simple to backup
- **Location:** `~/.ai-agent-wallet/data.db`
- **Schema:** Strategies, trades, decisions with indexes on timestamp

### 4. Chainlink Oracle
- **Direct Contract Calls:** No intermediary API
- **Feeds:** Mainnet & Sepolia price feeds configured
- **Polling:** 30 seconds (heartbeat ~1 hour, but change-triggered)

### 5. LLM Model Choice
- **Haiku 4.5:** Fast + cheap (frequent polling requirement)
- **Fallback to Sonnet 4.6:** Complex decision scenarios
- **Tool Use:** Ensures reliable JSON output parsing

## Testing Checklist

- [ ] Build succeeds (`npm run build`)
- [ ] Dev server starts (`npm run dev`)
- [ ] Dashboard loads at localhost:3000
- [ ] Chainlink price fetches correctly
- [ ] Agent starts via dashboard button
- [ ] Decision logged to SQLite
- [ ] Claude API responds with valid JSON
- [ ] Stop button stops agent
- [ ] Recent decisions appear in UI

## Environment Variables

```bash
NEXT_PUBLIC_MAINNET_RPC=https://eth.public.syfl.io
NEXT_PUBLIC_SEPOLIA_RPC=https://rpc.sepolia.org
ANTHROPIC_API_KEY=sk-ant-...
AGENT_MIN_CONFIDENCE=60
AGENT_CHECK_INTERVAL=30000
AGENT_AUTO_EXECUTE=false
```

## Git History

- Initial commit: Project setup with Next.js, dependencies, and core modules
- All source code committed (no private keys in repo)
- Ready for feature branches

## Next Session TODO

1. Wire MetaMask connection (wagmi + ethers.js)
2. Fetch real portfolio data from wallet
3. Build Uniswap swap flow
4. Implement trade confirmation dialog
5. Create strategy management UI

---

**Built with:** Next.js 14, TypeScript, Chainlink Oracle, Claude AI, SQLite  
**Network:** Ethereum Sepolia (testnet)  
**Ready to extend!** 🚀
