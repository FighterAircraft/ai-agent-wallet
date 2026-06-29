/**
 * AI Agent Wallet — standalone 24/7 daemon.
 *
 * Runs the agent decision loop in its own Node process (not the Next.js web
 * process), driven by the persisted `agent_state` row in SQLite. The web UI
 * toggles enabled/config; this daemon obeys it and writes a heartbeat each
 * cycle so the web can show liveness.
 *
 * Bundled by esbuild into dist/daemon.mjs and run under systemd:
 *   node --env-file=.env.local dist/daemon.mjs
 *
 * Read-only w.r.t. funds: it never signs or sends a transaction.
 */
import { initDB, getAgentState, heartbeat } from '@/lib/db';
import { executeAgentDecision } from '@/lib/agent/engine';
import { getPortfolio } from '@/lib/blockchain/portfolio';
import type { Portfolio } from '@/types';

const WALLET = process.env.AGENT_WALLET_ADDRESS?.trim();
const CHAIN: 'mainnet' | 'sepolia' =
  process.env.AGENT_CHAIN?.trim() === 'mainnet' ? 'mainnet' : 'sepolia';
const IDLE_POLL_MS = 15000; // re-check the enabled flag this often while disabled

const MOCK_PORTFOLIO: Portfolio = {
  address: '0x0000000000000000000000000000000000000000',
  ethBalance: BigInt('1000000000000000000'), // 1 ETH
  tokens: [],
  totalValue: BigInt('1000000000000000000'),
  updatedAt: 0,
};

let stopping = false;
let timer: NodeJS.Timeout | null = null;
let warnedMockOnce = false;

function log(fields: Record<string, unknown>): void {
  console.log(JSON.stringify({ t: new Date().toISOString(), ...fields }));
}

async function resolvePortfolio(): Promise<Portfolio> {
  const updatedAt = Math.floor(Date.now() / 1000);
  if (!WALLET) {
    if (!warnedMockOnce) {
      log({ level: 'warn', msg: 'AGENT_WALLET_ADDRESS not set — using mock 1 ETH portfolio' });
      warnedMockOnce = true;
    }
    return { ...MOCK_PORTFOLIO, updatedAt };
  }
  try {
    return await getPortfolio(WALLET, CHAIN);
  } catch (err) {
    log({ level: 'error', msg: 'getPortfolio failed, falling back to mock', err: String(err) });
    return { ...MOCK_PORTFOLIO, updatedAt };
  }
}

async function tick(): Promise<void> {
  if (stopping) return;
  let nextDelay = IDLE_POLL_MS;
  try {
    heartbeat();
    const state = getAgentState();
    nextDelay = state.enabled
      ? state.checkInterval > 0
        ? state.checkInterval
        : 30000
      : IDLE_POLL_MS;

    if (!state.enabled) {
      log({ level: 'info', msg: 'idle', enabled: false });
    } else {
      const portfolio = await resolvePortfolio();
      const summary = await executeAgentDecision(portfolio, {
        minConfidence: state.minConfidence,
        autoExecute: state.autoExecute,
        chain: CHAIN,
      });
      log({
        level: 'info',
        msg: 'cycle',
        enabled: true,
        addr: portfolio.address,
        balanceEth: Number(portfolio.ethBalance) / 1e18,
        ...summary,
      });
    }
  } catch (err) {
    log({ level: 'error', msg: 'tick error', err: String((err as Error)?.stack || err) });
  } finally {
    if (!stopping) timer = setTimeout(tick, nextDelay);
  }
}

function shutdown(signal: string): void {
  log({ level: 'info', msg: 'shutting down', signal });
  stopping = true;
  if (timer) clearTimeout(timer);
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

initDB();
log({
  level: 'info',
  msg: 'daemon started',
  chain: CHAIN,
  wallet: WALLET ? `${WALLET.slice(0, 6)}…${WALLET.slice(-4)}` : '(mock)',
  idlePollMs: IDLE_POLL_MS,
});
void tick();
