'use client';

import { Portfolio } from '@/components/Portfolio/Portfolio';
import { AgentStatus } from '@/components/AgentStatus/AgentStatus';
import { SiteNav } from '@/components/SiteNav';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <SiteNav />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-5xl font-bold mb-3">🚀 AI Agent Wallet</h1>
          <p className="text-lg opacity-90">自动化加密货币交易 Agent — 规则引擎 + Claude LLM</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-sm font-semibold text-gray-600 mb-2">Status</div>
            <div className="text-2xl font-bold text-green-600">✓ Ready</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="text-sm font-semibold text-gray-600 mb-2">Network</div>
            <div className="text-2xl font-bold text-blue-600">Sepolia</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="text-sm font-semibold text-gray-600 mb-2">Database</div>
            <div className="text-2xl font-bold text-purple-600">SQLite</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="text-sm font-semibold text-gray-600 mb-2">AI Model</div>
            <div className="text-2xl font-bold text-orange-600">Claude</div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Portfolio (Spans 1 column) */}
          <div className="lg:col-span-1">
            <Portfolio />
          </div>

          {/* Agent Status (Spans 2 columns) */}
          <div className="lg:col-span-2">
            <AgentStatus />
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-lg shadow p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            ✨ Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition">
              <div className="text-lg font-semibold text-purple-600 mb-2">🔗 Chainlink Oracle</div>
              <p className="text-sm text-gray-600">Real-time ETH/USD price feeds with 30s polling</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
              <div className="text-lg font-semibold text-blue-600 mb-2">🤖 Hybrid AI</div>
              <p className="text-sm text-gray-600">Rules engine + Claude LLM confidence scoring</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition">
              <div className="text-lg font-semibold text-green-600 mb-2">📋 Stop Loss & Take Profit</div>
              <p className="text-sm text-gray-600">Automated trading strategies with price triggers</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition">
              <div className="text-lg font-semibold text-orange-600 mb-2">💾 SQLite Database</div>
              <p className="text-sm text-gray-600">Persistent decision logs and trade history</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition">
              <div className="text-lg font-semibold text-red-600 mb-2">🔒 Zero Server Keys</div>
              <p className="text-sm text-gray-600">MetaMask signing, client-side transactions</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition">
              <div className="text-lg font-semibold text-indigo-600 mb-2">📡 REST APIs</div>
              <p className="text-sm text-gray-600">Prices, status, decisions, start/stop agent</p>
            </div>
          </div>
        </div>

        {/* API Quick Reference */}
        <div className="bg-white rounded-lg shadow p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            📡 API Endpoints
          </h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
              <span className="font-bold text-blue-600">GET</span> /api/prices?symbol=ETH/USD
            </div>
            <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
              <span className="font-bold text-green-600">POST</span> /api/agent/start
            </div>
            <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
              <span className="font-bold text-orange-600">POST</span> /api/agent/stop
            </div>
            <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
              <span className="font-bold text-purple-600">GET</span> /api/agent/status
            </div>
            <div className="bg-indigo-50 p-3 rounded border-l-4 border-indigo-500">
              <span className="font-bold text-indigo-600">GET</span> /api/agent/decisions?limit=100
            </div>
          </div>
        </div>

        {/* Agent Decision Flow */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg shadow p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">🔄 Agent Decision Flow</h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-bold">1.</span>
              <span>Chainlink price update (every 30s)</span>
            </div>
            <div className="flex items-center gap-3 ml-8">
              <span className="text-yellow-400">↓</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-bold">2.</span>
              <span>Evaluate rules (Stop Loss, Take Profit, DCA)</span>
            </div>
            <div className="flex items-center gap-3 ml-8">
              <span className="text-yellow-400">↓</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-bold">3.</span>
              <span>If triggered → Claude LLM analyzes market</span>
            </div>
            <div className="flex items-center gap-3 ml-8">
              <span className="text-yellow-400">↓</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-bold">4.</span>
              <span>Confidence &gt; 60% → Auto-execute | Notify user</span>
            </div>
            <div className="flex items-center gap-3 ml-8">
              <span className="text-yellow-400">↓</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-bold">5.</span>
              <span>Log decision to SQLite database</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-yellow-900">🎯 Next Steps</h2>
          <ol className="space-y-3 text-yellow-900 ml-6 list-decimal">
            <li>Wire MetaMask connection (wagmi) for real wallet holdings</li>
            <li>Implement Uniswap v3 swap execution flow</li>
            <li>Build Strategy Management UI</li>
            <li>Create trade confirmation dialog</li>
            <li>Enable DCA time-based scheduling</li>
          </ol>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="opacity-75">AI Agent Wallet MVP • Next.js 14 • Claude AI • Chainlink Oracle</p>
          <p className="text-sm opacity-50 mt-2">Running on Ethereum Sepolia (testnet)</p>
        </div>
      </footer>
    </main>
  );
}
