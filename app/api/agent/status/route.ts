import { NextResponse } from 'next/server';
import { isAgentRunning, getAgentConfig } from '@/lib/agent/engine';

export async function GET() {
  return NextResponse.json({
    running: isAgentRunning(),
    config: getAgentConfig(),
  });
}
