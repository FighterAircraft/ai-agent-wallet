# Quick Start Guide — AI Agent Wallet

## Setup (5 minutes)

### 1. Environment Setup
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your:
- `ANTHROPIC_API_KEY` from [Anthropic Console](https://console.anthropic.com)
- RPC URLs (Sepolia for testing, mainnet for production)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Dev Server
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

## First Steps

### 1. Check Current Price
The dashboard will automatically fetch ETH/USD from Chainlink Oracle on load.

### 2. Create Your First Strategy
_(Feature coming soon)_ For now, test via API:

```bash
# Fetch current ETH price
curl http://localhost:3000/api/prices?symbol=ETH/USD | jq

# Example response:
# {
#   "symbol": "ETH/USD",
#   "price": "328949000000",  # 8 decimals
#   "decimals": 8,
#   "priceInUSD": 3289.49,
#   "updatedAt": 1719529000
# }
```

### 3. Start the Agent
In the dashboard, click "Start Agent" or via API:

```bash
curl -X POST http://localhost:3000/api/agent/start \
  -H "Content-Type: application/json" \
  -d '{
    "checkInterval": 30000,
    "minConfidence": 60,
    "autoExecute": false
  }'
```

### 4. View Agent Decisions
```bash
curl http://localhost:3000/api/agent/decisions?limit=10 | jq
```

## Development

### Key Files to Know
- **Core Logic:** `lib/agent/` (rules engine, LLM, main loop)
- **Blockchain:** `lib/blockchain/` (oracle, uniswap, client)
- **UI:** `components/` (Portfolio, AgentStatus)
- **Database:** `lib/db/index.ts` (SQLite schema + CRUD)
- **Hooks:** `hooks/` (React state management)
- **API:** `app/api/` (Next.js route handlers)

### Running Tests
```bash
npm test
# (test suite coming soon)
```

### Database
SQLite data stored in: `~/.ai-agent-wallet/data.db`

To explore:
```bash
sqlite3 ~/.ai-agent-wallet/data.db
sqlite> SELECT * FROM decisions LIMIT 5;
```

## Troubleshooting

### "Failed to fetch price"
- Check RPC URL in `.env.local`
- Verify network connectivity: `curl https://rpc.sepolia.org`

### "Agent won't start"
- Ensure `ANTHROPIC_API_KEY` is set
- Check browser console for errors
- Verify Chainlink Oracle is accessible

### Database locked
- Stop the dev server
- Remove any stuck processes: `lsof | grep ai-agent-wallet`
- Restart

## Next Steps

1. **Wire Wallet Connection:** Add MetaMask via wagmi (see `hooks/` for examples)
2. **Create Trading Rules:** Implement stop-loss, take-profit strategies UI
3. **Execute Trades:** Build Uniswap swap signing flow
4. **Deploy:** Docker setup + cloud hosting options
5. **Monitor:** Add logging/alerting for agent decisions

## Support

- Docs: See `CLAUDE.md` for architecture details
- Issues: Check console logs in dev tools
- Improvements: Edit core modules in `lib/agent/`, `lib/blockchain/`

Happy trading! 🚀
