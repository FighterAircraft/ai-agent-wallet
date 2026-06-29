import { NextResponse } from 'next/server';
import { getAgentState } from '@/lib/db';

export async function GET() {
  const state = getAgentState();
  const now = Math.floor(Date.now() / 1000);

  // The daemon heartbeats every cycle. Consider it actually running only if
  // enabled AND a heartbeat arrived within ~2 poll intervals — otherwise the
  // flag is on but the daemon process is down.
  const staleAfter = (2 * state.checkInterval) / 1000;
  const heartbeatAgeSec = state.lastHeartbeat ? now - state.lastHeartbeat : Infinity;
  const daemonAlive = heartbeatAgeSec < Math.max(staleAfter, 30);
  const running = state.enabled && daemonAlive;

  return NextResponse.json({
    running,
    daemonAlive,
    lastHeartbeat: state.lastHeartbeat,
    heartbeatAgeSec: Number.isFinite(heartbeatAgeSec) ? heartbeatAgeSec : null,
    config: {
      enabled: state.enabled,
      checkInterval: state.checkInterval,
      minConfidence: state.minConfidence,
      autoExecute: state.autoExecute,
    },
  });
}
