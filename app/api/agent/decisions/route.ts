import { NextResponse } from 'next/server';
import { getDecisions } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const decisions = getDecisions(limit);

    // Serialize BigInt values to strings for JSON response
    const serialized = decisions.map((decision) => ({
      ...decision,
      price: decision.price.toString(),
      portfolioValue: decision.portfolioValue.toString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching decisions:', error);
    return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
  }
}
