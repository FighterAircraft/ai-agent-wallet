import { isAddress } from 'viem';
import { getPublicClient } from './client';
import type { Portfolio } from '@/types';

/**
 * Read a wallet's live on-chain ETH balance and return a Portfolio.
 *
 * Read-only (no signing, no trades). ERC-20 token valuation is out of scope for
 * now, so `tokens` is empty and `totalValue` mirrors the wei ETH balance —
 * matching the previous mock semantics so downstream (LLM prompt, decisions)
 * stays unchanged.
 */
export async function getPortfolio(
  address: string,
  chain: 'mainnet' | 'sepolia' = 'sepolia'
): Promise<Portfolio> {
  if (!isAddress(address)) {
    throw new Error(`Invalid wallet address: ${address}`);
  }

  const client = getPublicClient(chain);
  const ethBalance = await client.getBalance({ address });

  return {
    address,
    ethBalance,
    tokens: [],
    totalValue: ethBalance,
    updatedAt: Math.floor(Date.now() / 1000),
  };
}
