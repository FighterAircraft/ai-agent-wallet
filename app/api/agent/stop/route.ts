import { NextResponse } from 'next/server';
import { setAgentState } from '@/lib/db';

export async function POST() {
  try {
    setAgentState({ enabled: false });
    return NextResponse.json({ message: 'Agent stopped', status: 'stopped' });
  } catch (error) {
    console.error('Error stopping agent:', error);
    return NextResponse.json({ error: 'Failed to stop agent' }, { status: 500 });
  }
}
