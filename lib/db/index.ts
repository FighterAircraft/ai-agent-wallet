import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs';
import type { Trade, TradeStrategy, AgentDecision, AgentState } from '@/types';

const dbDir = path.join(os.homedir(), '.ai-agent-wallet');
const dbPath = path.join(dbDir, 'data.db');

let db: Database.Database | null = null;

export function initDB(): Database.Database {
  if (db) return db;

  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);

    // WAL lets the web process read while the daemon writes (one writer + many
    // readers). busy_timeout avoids SQLITE_BUSY when both briefly contend.
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 5000');

    db.exec(`
      CREATE TABLE IF NOT EXISTS strategies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        assetSymbol TEXT NOT NULL,
        triggerPrice INTEGER NOT NULL,
        action TEXT NOT NULL,
        amount INTEGER,
        enabled INTEGER NOT NULL DEFAULT 1,
        createdAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        hash TEXT NOT NULL,
        "from" TEXT NOT NULL,
        "to" TEXT NOT NULL,
        amount INTEGER NOT NULL,
        price INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL,
        agentDecided INTEGER NOT NULL,
        reason TEXT
      );

      CREATE TABLE IF NOT EXISTS decisions (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        price INTEGER NOT NULL,
        portfolioValue INTEGER NOT NULL,
        triggeredRules TEXT,
        llmConfidence REAL,
        llmRecommendation TEXT,
        llmReasoning TEXT,
        executedTradeId TEXT,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS agent_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        enabled INTEGER NOT NULL DEFAULT 0,
        checkInterval INTEGER NOT NULL DEFAULT 30000,
        minConfidence INTEGER NOT NULL DEFAULT 60,
        autoExecute INTEGER NOT NULL DEFAULT 0,
        lastHeartbeat INTEGER NOT NULL DEFAULT 0,
        updatedAt INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_strategies_enabled ON strategies(enabled);
      CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp);
      CREATE INDEX IF NOT EXISTS idx_decisions_timestamp ON decisions(timestamp);
    `);

    // Ensure the single agent_state row exists (id = 1) with defaults.
    db.prepare(
      `INSERT OR IGNORE INTO agent_state (id, updatedAt) VALUES (1, ?)`
    ).run(Math.floor(Date.now() / 1000));

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export function saveStrategy(strategy: TradeStrategy): void {
  const database = db || initDB();
  const stmt = database.prepare(`
    INSERT OR REPLACE INTO strategies
    (id, name, type, assetSymbol, triggerPrice, action, amount, enabled, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    strategy.id,
    strategy.name,
    strategy.type,
    strategy.assetSymbol,
    strategy.triggerPrice.toString(),
    strategy.action,
    strategy.amount?.toString() || null,
    strategy.enabled ? 1 : 0,
    strategy.createdAt
  );
}

export function getStrategies(): TradeStrategy[] {
  const database = db || initDB();
  const stmt = database.prepare('SELECT * FROM strategies');
  const rows = stmt.all() as any[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    assetSymbol: row.assetSymbol,
    triggerPrice: BigInt(row.triggerPrice),
    action: row.action,
    amount: row.amount ? BigInt(row.amount) : undefined,
    enabled: Boolean(row.enabled),
    createdAt: row.createdAt,
  }));
}

export function saveTrade(trade: Trade): void {
  const database = db || initDB();
  const stmt = database.prepare(`
    INSERT OR REPLACE INTO trades
    (id, hash, "from", "to", amount, price, timestamp, status, agentDecided, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    trade.id,
    trade.hash,
    trade.from,
    trade.to,
    trade.amount.toString(),
    trade.price.toString(),
    trade.timestamp,
    trade.status,
    trade.agentDecided ? 1 : 0,
    trade.reason
  );
}

export function saveDecision(decision: AgentDecision): void {
  const database = db || initDB();
  const stmt = database.prepare(`
    INSERT OR REPLACE INTO decisions
    (id, timestamp, price, portfolioValue, triggeredRules, llmConfidence, llmRecommendation, llmReasoning, executedTradeId, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    decision.id,
    decision.timestamp,
    decision.price.toString(),
    decision.portfolioValue.toString(),
    decision.triggeredRules.join(','),
    decision.llmAnalysis?.confidence || null,
    decision.llmAnalysis?.recommendation || null,
    decision.llmAnalysis?.reasoning || null,
    decision.executedTrade?.id || null,
    decision.status
  );
}

export function getDecisions(limit = 100): AgentDecision[] {
  const database = db || initDB();
  const stmt = database.prepare(`
    SELECT * FROM decisions ORDER BY timestamp DESC LIMIT ?
  `);
  const rows = stmt.all(limit) as any[];

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    price: BigInt(row.price),
    portfolioValue: BigInt(row.portfolioValue),
    triggeredRules: row.triggeredRules ? row.triggeredRules.split(',') : [],
    llmAnalysis: row.llmConfidence
      ? {
          confidence: row.llmConfidence,
          recommendation: row.llmRecommendation,
          reasoning: row.llmReasoning,
        }
      : undefined,
    status: row.status,
  }));
}

// --- Agent control/runtime state (single row id=1) ---
// Coordinates the web process and the standalone daemon: the web toggles
// `enabled`/config, the daemon obeys it and writes `lastHeartbeat` each cycle.

export function getAgentState(): AgentState {
  const database = db || initDB();
  const row = database
    .prepare('SELECT * FROM agent_state WHERE id = 1')
    .get() as {
      enabled: number;
      checkInterval: number;
      minConfidence: number;
      autoExecute: number;
      lastHeartbeat: number;
      updatedAt: number;
    };

  return {
    enabled: Boolean(row.enabled),
    checkInterval: row.checkInterval,
    minConfidence: row.minConfidence,
    autoExecute: Boolean(row.autoExecute),
    lastHeartbeat: row.lastHeartbeat,
    updatedAt: row.updatedAt,
  };
}

export function setAgentState(
  patch: Partial<Omit<AgentState, 'updatedAt'>>
): AgentState {
  const database = db || initDB();
  const current = getAgentState();
  const next: AgentState = {
    ...current,
    ...patch,
    updatedAt: Math.floor(Date.now() / 1000),
  };

  database
    .prepare(
      `UPDATE agent_state
         SET enabled = ?, checkInterval = ?, minConfidence = ?, autoExecute = ?, updatedAt = ?
       WHERE id = 1`
    )
    .run(
      next.enabled ? 1 : 0,
      next.checkInterval,
      next.minConfidence,
      next.autoExecute ? 1 : 0,
      next.updatedAt
    );

  return next;
}

// Daemon liveness ping; cheap, isolated from setAgentState so it never clobbers
// a concurrent config change from the web.
export function heartbeat(ts: number = Math.floor(Date.now() / 1000)): void {
  const database = db || initDB();
  database.prepare('UPDATE agent_state SET lastHeartbeat = ? WHERE id = 1').run(ts);
}
