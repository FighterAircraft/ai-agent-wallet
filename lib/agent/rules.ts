import type { TradeStrategy, OraclePrice } from '@/types';

export interface RuleEvaluation {
  strategy: TradeStrategy;
  triggered: boolean;
  reason?: string;
}

export function evaluateRules(
  strategies: TradeStrategy[],
  currentPrice: OraclePrice
): RuleEvaluation[] {
  return strategies
    .filter((s) => s.enabled && s.assetSymbol === currentPrice.symbol)
    .map((strategy) => {
      let triggered = false;
      let reason = '';

      switch (strategy.type) {
        case 'stop_loss':
          if (strategy.action === 'sell' && currentPrice.price <= strategy.triggerPrice) {
            triggered = true;
            reason = `Price ${currentPrice.price} <= stop loss ${strategy.triggerPrice}`;
          }
          break;

        case 'take_profit':
          if (strategy.action === 'sell' && currentPrice.price >= strategy.triggerPrice) {
            triggered = true;
            reason = `Price ${currentPrice.price} >= take profit ${strategy.triggerPrice}`;
          }
          break;

        case 'dca':
          // DCA logic is time-based, not price-based
          // This would be handled separately in the agent loop
          break;

        case 'alert':
          if (currentPrice.price >= strategy.triggerPrice) {
            triggered = true;
            reason = `Price alert triggered: ${currentPrice.price}`;
          }
          break;
      }

      return {
        strategy,
        triggered,
        reason: triggered ? reason : undefined,
      };
    });
}

export function getTriggeredStrategies(
  strategies: TradeStrategy[],
  currentPrice: OraclePrice
): TradeStrategy[] {
  return evaluateRules(strategies, currentPrice)
    .filter((eval) => eval.triggered)
    .map((eval) => eval.strategy);
}
