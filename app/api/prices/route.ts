import { NextResponse } from 'next/server';
import { getChainlinkPrice } from '@/lib/blockchain/oracle';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = (searchParams.get('symbol') || 'ETH/USD') as 'ETH/USD';

    const price = await getChainlinkPrice(symbol);

    return NextResponse.json({
      symbol: price.symbol,
      price: price.price.toString(),
      decimals: price.decimals,
      roundId: price.roundId.toString(),
      updatedAt: price.updatedAt,
      priceInUSD: Number(price.price) / 10 ** price.decimals,
    });
  } catch (error) {
    console.error('Error fetching price:', error);
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
  }
}
