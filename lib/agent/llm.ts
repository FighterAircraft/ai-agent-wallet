import Anthropic from '@anthropic-ai/sdk';
import type { TradeStrategy, OraclePrice, Portfolio } from '@/types';

const client = new Anthropic();

export interface LLMDecision {
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  recommendedAmount?: bigint;
}

export async function analyzeCryptoMarket(
  currentPrice: OraclePrice,
  portfolio: Portfolio,
  triggeredStrategies: TradeStrategy[]
): Promise<LLMDecision> {
  const priceInUSD = Number(currentPrice.price) / 10 ** currentPrice.decimals;
  const portfolioValueInUSD = Number(portfolio.totalValue) / 10 ** 18;

  const prompt = `You are an AI crypto trading advisor. Analyze the following market data and provide a trading recommendation.

Current Market Data:
- ETH Price: $${priceInUSD.toFixed(2)} USD
- Round ID: ${currentPrice.roundId}
- Updated At: ${new Date(currentPrice.updatedAt * 1000).toISOString()}

Portfolio:
- Total Value: $${portfolioValueInUSD.toFixed(2)}
- ETH Balance: ${Number(portfolio.ethBalance) / 10 ** 18} ETH
- Assets: ${portfolio.tokens.map((t) => `${t.symbol}: ${Number(t.balance)} (worth $${(Number(t.balance) * Number(t.price)) / 10 ** 18})`).join(', ')}

Triggered Strategies:
${triggeredStrategies.map((s) => `- ${s.name} (${s.type}): trigger at ${Number(s.triggerPrice) / 10 ** 8}`).join('\n')}

Based on this data, provide a JSON response with:
1. action: "buy", "sell", or "hold"
2. confidence: 0-100 (confidence level)
3. reasoning: brief explanation of your decision

Consider:
- Stop loss orders should always be executed
- Take profit orders should be executed unless market momentum suggests holding
- DCA orders follow their schedule regardless of market conditions
- Price momentum and volatility
- Portfolio allocation

Respond ONLY with valid JSON, no markdown or code blocks.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    const decision = JSON.parse(content.text);
    return {
      recommendation: decision.action || decision.recommendation || 'hold',
      confidence: decision.confidence || 0,
      reasoning: decision.reasoning || 'No reasoning provided',
    };
  } catch (error) {
    console.error('Failed to parse LLM response:', content.text);
    return {
      recommendation: 'hold',
      confidence: 0,
      reasoning: 'Failed to parse AI response',
    };
  }
}
