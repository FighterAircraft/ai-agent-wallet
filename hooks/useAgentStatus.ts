'use client';

import { useEffect, useState } from 'react';
import type { AgentDecision } from '@/types';

export function useAgentStatus() {
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        const response = await fetch('/api/agent/decisions');
        if (!response.ok) throw new Error('Failed to fetch decisions');
        const data = await response.json();
        setDecisions(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    };

    const checkStatus = async () => {
      try {
        const response = await fetch('/api/agent/status');
        if (!response.ok) throw new Error('Failed to check status');
        const data = await response.json();
        setRunning(data.running);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    };

    fetchDecisions();
    checkStatus();

    const interval = setInterval(() => {
      fetchDecisions();
      checkStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const startAgent = async (config?: any) => {
    try {
      const response = await fetch('/api/agent/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config || {}),
      });
      if (!response.ok) throw new Error('Failed to start agent');
      setRunning(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  };

  const stopAgent = async () => {
    try {
      const response = await fetch('/api/agent/stop', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to stop agent');
      setRunning(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  };

  return { decisions, running, error, startAgent, stopAgent };
}
