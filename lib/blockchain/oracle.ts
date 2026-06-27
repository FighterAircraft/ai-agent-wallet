import { publicClient, CHAINLINK_FEEDS, CHAINLINK_ABI } from './client';
import type { OraclePrice } from '@/types';

export async function getChainlinkPrice(
  symbol: keyof typeof CHAINLINK_FEEDS,
  chain: 'mainnet' | 'sepolia' = 'sepolia'
): Promise<OraclePrice> {
  const feedAddress = CHAINLINK_FEEDS[symbol][chain] as `0x${string}`;

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
    roundId: latestData[0],
    updatedAt: latestData[3] as number,
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
