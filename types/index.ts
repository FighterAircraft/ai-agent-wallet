export interface TradeStrategy {
  id: string;
  name: string;
  type: 'stop_loss' | 'take_profit' | 'dca' | 'alert';
  assetSymbol: string;
  triggerPrice: bigint;
  action: 'buy' | 'sell';
  amount?: bigint;
  enabled: boolean;
  createdAt: number;
}

export interface Trade {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: bigint;
  price: bigint;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  agentDecided: boolean;
  reason: string;
}

export interface AgentDecision {
  id: string;
  timestamp: number;
  price: bigint;
  portfolioValue: bigint;
  triggeredRules: string[];
  llmAnalysis?: {
    confidence: number;
    recommendation: 'buy' | 'sell' | 'hold';
    reasoning: string;
  };
  executedTrade?: Trade;
  status: 'pending' | 'executed' | 'rejected';
}

export interface Portfolio {
  address: string;
  ethBalance: bigint;
  tokens: {
    symbol: string;
    balance: bigint;
    price: bigint;
  }[];
  totalValue: bigint;
  updatedAt: number;
}

export interface OraclePrice {
  symbol: string;
  price: bigint;
  decimals: number;
  roundId: bigint;
  updatedAt: number;
}

// Persisted agent control/runtime state (shared between the web process and the
// standalone daemon via SQLite — see lib/db agent_state table).
export interface AgentState {
  enabled: boolean;
  checkInterval: number; // milliseconds
  minConfidence: number; // 0-100
  autoExecute: boolean;
  lastHeartbeat: number; // unix seconds, 0 if never
  updatedAt: number; // unix seconds
}
