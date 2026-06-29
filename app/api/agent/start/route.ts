import { NextResponse } from 'next/server';
import { setAgentState } from '@/lib/db';

// Starting the agent now just flips the persisted `enabled` flag (+ config).
// The standalone daemon (dist/daemon.mjs) polls this state and does the work;
// the web process no longer runs its own in-process loop.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const state = setAgentState({
      enabled: true,
      checkInterval: body.checkInterval ?? 30000,
      minConfidence: body.minConfidence ?? 60,
      autoExecute: body.autoExecute ?? false,
    });

    return NextResponse.json({ message: 'Agent started', status: 'running', config: state });
  } catch (error) {
    console.error('Error starting agent:', error);
    return NextResponse.json({ error: 'Failed to start agent' }, { status: 500 });
  }
}
