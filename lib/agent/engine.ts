import { getChainlinkPrice } from '@/lib/blockchain/oracle';
import { getTriggeredStrategies } from '@/lib/agent/rules';
import { analyzeCryptoMarket } from '@/lib/agent/llm';
import { getStrategies, saveDecision } from '@/lib/db';
import type { Portfolio, AgentDecision } from '@/types';

export interface DecisionOptions {
  minConfidence: number; // 0-100
  autoExecute: boolean;
  chain?: 'mainnet' | 'sepolia';
}

export interface DecisionSummary {
  priceUsd: number; // ETH/USD for logging convenience
  strategyCount: number;
  triggeredCount: number;
  decisionId?: string;
  status?: AgentDecision['status'];
  confidence?: number;
  recommendation?: 'buy' | 'sell' | 'hold';
}

/**
 * Run one agent decision cycle against the given portfolio.
 *
 * Pure-ish core reused by both the standalone daemon and (previously) the web
 * loop. Fetches price, evaluates rules, and — only when a rule triggers — asks
 * the LLM and persists a decision. Idle cycles (no trigger) are NOT written to
 * the decisions table to keep it meaningful at 24/7 polling rates.
 */
export async function executeAgentDecision(
  portfolio: Portfolio,
  opts: DecisionOptions
): Promise<DecisionSummary> {
  const chain = opts.chain ?? 'sepolia';
  const strategies = getStrategies();
  const price = await getChainlinkPrice('ETH/USD', chain);
  const priceUsd = Number(price.price) / 10 ** price.decimals;

  const summary: DecisionSummary = {
    priceUsd,
    strategyCount: strategies.length,
    triggeredCount: 0,
  };

  if (strategies.length === 0) return summary;

  const triggeredStrategies = getTriggeredStrategies(strategies, price);
  summary.triggeredCount = triggeredStrategies.length;
  if (triggeredStrategies.length === 0) return summary;

  const decision: AgentDecision = {
    id: `decision_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    timestamp: Math.floor(Date.now() / 1000),
    price: price.price,
    portfolioValue: portfolio.totalValue,
    triggeredRules: triggeredStrategies.map((s) => s.id),
    status: 'pending',
  };

  try {
    const llm = await analyzeCryptoMarket(price, portfolio, triggeredStrategies);
    decision.llmAnalysis = {
      confidence: llm.confidence,
      recommendation: llm.recommendation,
      reasoning: llm.reasoning,
    };

    // NOTE: "executed" only marks the decision — there is no real on-chain swap
    // yet (signing is the user's MetaMask, not the server). See DEPLOY.md / MVP
    // limitations. autoExecute + high confidence gates this flag only.
    decision.status =
      opts.autoExecute && llm.confidence >= opts.minConfidence ? 'executed' : 'pending';

    summary.confidence = llm.confidence;
    summary.recommendation = llm.recommendation;
  } catch (error) {
    console.error('LLM analysis failed:', error);
    decision.status = 'rejected';
  }

  saveDecision(decision);
  summary.decisionId = decision.id;
  summary.status = decision.status;
  return summary;
}
