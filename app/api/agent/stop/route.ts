import { NextResponse } from 'next/server';
import { stopAgentLoop } from '@/lib/agent/engine';

export async function POST() {
  try {
    stopAgentLoop();
    return NextResponse.json({ message: 'Agent stopped', status: 'stopped' });
  } catch (error) {
    console.error('Error stopping agent:', error);
    return NextResponse.json({ error: 'Failed to stop agent' }, { status: 500 });
  }
}
