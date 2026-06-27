'use client';

import { useState } from 'react';
import { useAgentStatus } from '@/hooks/useAgentStatus';

export function AgentStatus() {
  const { running, error, startAgent, stopAgent, decisions } = useAgentStatus();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (running) {
        await stopAgent();
      } else {
        await startAgent({
          checkInterval: 30000,
          minConfidence: 60,
          autoExecute: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Agent Status</h2>
          <div className={`w-3 h-3 rounded-full ${running ? 'bg-green-500' : 'bg-gray-400'}`} />
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Status: <span className="font-semibold">{running ? 'Running' : 'Stopped'}</span>
        </p>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`w-full py-2 px-4 rounded font-semibold transition ${
            running
              ? 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300'
              : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-green-300'
          }`}
        >
          {loading ? 'Loading...' : running ? 'Stop Agent' : 'Start Agent'}
        </button>

        {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
      </div>

      {decisions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Recent Decisions</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {decisions.slice(0, 5).map((decision) => (
              <div key={decision.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm text-gray-600">
                  {new Date(decision.timestamp * 1000).toLocaleTimeString()}
                </p>
                <p className="text-sm font-semibold">Status: {decision.status}</p>
                {decision.llmAnalysis && (
                  <p className="text-sm text-gray-700">
                    Confidence: {decision.llmAnalysis.confidence}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
