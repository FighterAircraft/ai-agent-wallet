import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import type { Trade, TradeStrategy, AgentDecision } from '@/types';

const dbPath = path.join(os.homedir(), '.ai-agent-wallet', 'data.db');

let db: Database.Database | null = null;

export function initDB(): Database.Database {
  if (db) return db;

  try {
    db = new Database(dbPath);

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
        from TEXT NOT NULL,
        to TEXT NOT NULL,
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

      CREATE INDEX IF NOT EXISTS idx_strategies_enabled ON strategies(enabled);
      CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp);
      CREATE INDEX IF NOT EXISTS idx_decisions_timestamp ON decisions(timestamp);
    `);

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
    (id, hash, from, to, amount, price, timestamp, status, agentDecided, reason)
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
