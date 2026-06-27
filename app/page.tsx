'use client';

import { Portfolio } from '@/components/Portfolio/Portfolio';
import { AgentStatus } from '@/components/AgentStatus/AgentStatus';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">AI Agent Wallet</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Portfolio />
          <AgentStatus />
        </div>
      </div>
    </main>
  );
}
