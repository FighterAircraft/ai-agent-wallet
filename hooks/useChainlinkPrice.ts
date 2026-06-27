'use client';

import { useEffect, useState } from 'react';
import { getChainlinkPrice } from '@/lib/blockchain/oracle';
import type { OraclePrice } from '@/types';

export function useChainlinkPrice(symbol: 'ETH/USD' = 'ETH/USD', interval = 30000) {
  const [price, setPrice] = useState<OraclePrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    async function fetchPrice() {
      try {
        const data = await getChainlinkPrice(symbol);
        if (isMounted) {
          setPrice(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch price'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPrice();
    pollInterval = setInterval(fetchPrice, interval);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [symbol, interval]);

  return { price, loading, error };
}
