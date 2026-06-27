'use client';

import { useChainlinkPrice } from '@/hooks/useChainlinkPrice';

export function Portfolio() {
  const { price, loading, error } = useChainlinkPrice('ETH/USD');

  if (loading) {
    return <div className="p-4">Loading portfolio data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  const priceInUSD = price ? Number(price.price) / 10 ** price.decimals : 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Portfolio Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">ETH Price</p>
            <p className="text-2xl font-bold">${priceInUSD.toFixed(2)}</p>
            {price && (
              <p className="text-xs text-gray-400">
                Updated: {new Date(price.updatedAt * 1000).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div>
            <p className="text-gray-500 text-sm">ETH Balance</p>
            <p className="text-2xl font-bold">1.0 ETH</p>
            <p className="text-xs text-gray-400">${(1 * priceInUSD).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
