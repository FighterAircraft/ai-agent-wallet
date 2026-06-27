import { getChainlinkPrice } from '@/lib/blockchain/oracle';
import { evaluateRules, getTriggeredStrategies } from '@/lib/agent/rules';
import { analyzeCryptoMarket } from '@/lib/agent/llm';
import { getStrategies, saveDecision } from '@/lib/db';
import type { Portfolio, OraclePrice, TradeStrategy, AgentDecision } from '@/types';

export interface AgentConfig {
  enabled: boolean;
  checkInterval: number; // milliseconds
  minConfidence: number; // 0-100
  autoExecute: boolean;
  notifyOnDecision?: (decision: AgentDecision) => void;
}

const DEFAULT_CONFIG: AgentConfig = {
  enabled: true,
  checkInterval: 30000, // 30 seconds
  minConfidence: 60,
  autoExecute: false,
  notifyOnDecision: undefined,
};

let agentRunning = false;
let agentConfig = DEFAULT_CONFIG;
let pollInterval: NodeJS.Timeout | null = null;

export async function runAgentLoop(
  portfolio: Portfolio,
  config?: Partial<AgentConfig>
): Promise<void> {
  agentConfig = { ...DEFAULT_CONFIG, ...config };

  if (agentRunning) {
    console.warn('Agent is already running');
    return;
  }

  agentRunning = true;
  console.log('Agent loop started with config:', agentConfig);

  if (pollInterval) clearInterval(pollInterval);

  pollInterval = setInterval(async () => {
    if (!agentRunning || !agentConfig.enabled) return;

    try {
      await executeAgentDecision(portfolio);
    } catch (error) {
      console.error('Agent loop error:', error);
    }
  }, agentConfig.checkInterval);
}

export async function executeAgentDecision(portfolio: Portfolio): Promise<void> {
  const strategies = getStrategies();
  if (strategies.length === 0) return;

  const price = await getChainlinkPrice('ETH/USD');
  const triggeredStrategies = getTriggeredStrategies(strategies, price);

  const decision: AgentDecision = {
    id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Math.floor(Date.now() / 1000),
    price: price.price,
    portfolioValue: portfolio.totalValue,
    triggeredRules: triggeredStrategies.map((s) => s.id),
    status: 'pending',
  };

  // If any rule-based strategies are triggered, prepare for execution
  if (triggeredStrategies.length > 0) {
    // Analyze with LLM for context
    if (agentConfig.enabled) {
      try {
        const llmDecision = await analyzeCryptoMarket(price, portfolio, triggeredStrategies);
        decision.llmAnalysis = llmDecision;

        // Auto-execute if confidence is high and auto-execute is enabled
        if (llmDecision.confidence >= agentConfig.minConfidence && agentConfig.autoExecute) {
          decision.status = 'executed';
        } else {
          decision.status = 'pending';
        }
      } catch (error) {
        console.error('LLM analysis failed:', error);
        decision.status = 'rejected';
      }
    }
  }

  saveDecision(decision);
  agentConfig.notifyOnDecision?.(decision);
}

export function stopAgentLoop(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  agentRunning = false;
  console.log('Agent loop stopped');
}

export function isAgentRunning(): boolean {
  return agentRunning;
}

export function updateAgentConfig(config: Partial<AgentConfig>): void {
  agentConfig = { ...agentConfig, ...config };
}

export function getAgentConfig(): AgentConfig {
  return { ...agentConfig };
}
