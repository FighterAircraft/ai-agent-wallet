import { getPublicClient, CHAINLINK_FEEDS, CHAINLINK_ABI } from './client';
import type { OraclePrice } from '@/types';

export async function getChainlinkPrice(
  symbol: keyof typeof CHAINLINK_FEEDS,
  chain: 'mainnet' | 'sepolia' = 'sepolia'
): Promise<OraclePrice> {
  const feedAddress = CHAINLINK_FEEDS[symbol][chain] as `0x${string}`;
  // Use the client for the requested chain (not the default), so a mainnet feed
  // is read via a mainnet RPC.
  const publicClient = getPublicClient(chain);

  const [latestData, decimals] = await Promise.all([
    publicClient.readContract({
      address: feedAddress,
      abi: CHAINLINK_ABI,
      functionName: 'latestRoundData',
    }),
    publicClient.readContract({
      address: feedAddress,
      abi: CHAINLINK_ABI,
      functionName: 'decimals',
    }),
  ]);

  return {
    symbol,
    price: BigInt(latestData[1]),
    decimals: decimals as number,
    roundId: latestData[0] as bigint,
    updatedAt: Number(latestData[3]),
  };
}

export async function subscribeToPrice(
  symbol: keyof typeof CHAINLINK_FEEDS,
  interval = 30000,
  onUpdate?: (price: OraclePrice) => void
) {
  const priceWatch = setInterval(async () => {
    try {
      const price = await getChainlinkPrice(symbol);
      onUpdate?.(price);
    } catch (error) {
      console.error(`Failed to fetch ${symbol} price:`, error);
    }
  }, interval);

  return () => clearInterval(priceWatch);
}
