import { NextResponse } from 'next/server';
import { runAgentLoop } from '@/lib/agent/engine';
import type { Portfolio } from '@/types';

// Mock portfolio for demo - in production this would come from wallet connection
const MOCK_PORTFOLIO: Portfolio = {
  address: '0x0000000000000000000000000000000000000000',
  ethBalance: BigInt('1000000000000000000'), // 1 ETH
  tokens: [],
  totalValue: BigInt('1000000000000000000'),
  updatedAt: Math.floor(Date.now() / 1000),
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await runAgentLoop(MOCK_PORTFOLIO, {
      enabled: true,
      checkInterval: body.checkInterval || 30000,
      minConfidence: body.minConfidence || 60,
      autoExecute: body.autoExecute || false,
    });

    return NextResponse.json({ message: 'Agent started', status: 'running' });
  } catch (error) {
    console.error('Error starting agent:', error);
    return NextResponse.json({ error: 'Failed to start agent' }, { status: 500 });
  }
}
