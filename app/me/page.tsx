import type { Metadata } from 'next';
import { SiteNav } from '@/components/SiteNav';
import { SmartLink } from '@/components/SmartLink';
import { WALLET_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '马昌锋 (Sky Ma) — 高级后端工程师 · Web3 / 交易所核心系统',
  description:
    '7 年后端开发，5 年深耕加密货币交易所核心系统（永续合约 / 现货 / 做市）。高并发撮合引擎、清算与强平系统、DeFi 协议与链上数据分析，Java / Solidity，深度 AI Agent 工作流落地。',
};

const stack: { label: string; items: string }[] = [
  { label: '后端语言', items: 'Java（精通） · Solidity' },
  { label: '高并发架构', items: '多线程 / 高并发 / 网络编程 · 订单系统 8,000 → 50,000 TPS 优化方案' },
  { label: '区块链', items: 'Go-Ethereum · Web3j · ERC20/721 · DeFi（Uniswap v2/v3 · AAVE · PancakeSwap） · Solidity' },
  { label: '中间件', items: 'MySQL · PostgreSQL · Redis（分布式锁） · Kafka · Elasticsearch' },
  { label: 'DevOps', items: 'Linux · AWS · Docker · Kubernetes · Git · Maven · CI/CD' },
  { label: '业务领域', items: '永续合约 · 标准合约 · 现货撮合 · 做市商 · 高频交易 · NFT 套利 · 清算 / 强平' },
  { label: 'AI 工具', items: 'Claude（深度用户） · Kiro · WorkBuddy · AI Agent 工作流 · OpenClaw（自搭建）' },
];

const experience: {
  role: string;
  org: string;
  period: string;
  accent: string;
  points: string[];
}[] = [
  {
    role: '合约负责人',
    org: 'DEEBIT 交易所',
    period: '2025.02 – 2026.05',
    accent: 'border-purple-500',
    points: [
      '主导永续合约模块全面改造与上线，支持 400+ 币对并发交易，协调现货 / 行情 / 做市 / 用户 / 资产等多个后端模块同步上线',
      '引入穿仓机制重构强平模块，解决全仓仓位在不同强平顺序下结算结果不一致的核心问题',
      '改造合约订单表与成交记录表架构，实现大规模币对水平扩展；研发 Launchpad 与交易返佣系统',
      '代理技术负责人职责，主持各部门日会、协调跨团队技术交付',
      '深度使用 AI 工具辅助研发：Claude 主力做需求分析 / 代码审查 / 方案设计，Kiro + WorkBuddy 搭建 Agent 工作流，自建 OpenClaw 本地知识库',
    ],
  },
  {
    role: '合约负责人',
    org: 'UPTX 交易所',
    period: '2023.06 – 2025.02',
    accent: 'border-blue-500',
    points: [
      '从 0 到 1 搭建永续合约系统（200+ 币对）及标准合约系统（400+ 币对，含美股 / 港股 / ETF / 外汇 / 指数 / 大宗商品）',
      '重写撮合引擎：WebSocket 实时监听 Binance 成交，价格变动即时触发用户挂单撮合，大幅降低延迟',
      'Redis 分布式锁替换数据库锁，根除高并发死锁风险；订单表按用户维度分表，重构 MQ Topic，IO 显著下降',
      '重写强平价格计算逻辑，统一逐仓与全仓双向持仓公式，解决计算口径不一致问题',
      '提出并设计订单系统 8,000 → 50,000 TPS 优化方案，对标 Gate.io；开发大户持仓监控与风控（按价格 / 步长插针爆仓）',
    ],
  },
  {
    role: 'Java 开发工程师',
    org: '北京赛伯斯 (CyberX)',
    period: '2021.03 – 2023.04',
    accent: 'border-indigo-500',
    points: [
      '交易所接口对接（CoinBase / Gate.io / MEXC / Bitrue / Phemex）：REST + WebSocket 实现资产 / 行情 / 下单撤单 / 链上转账',
      'NFT 套利平台：实时监听 Collection 上架 / 下架 / 地板价，按策略自动交易并异常报警',
      'DeFi 做市：Web3j + Uniswap v2 / Sushi / PancakeSwap ABI 签名广播，实现流动性注入 / 提取与大额交易监控',
      'Uniswap v3 数据分析平台：按区块拉取 mint / burn / swap 日志，统计各池 TVL / Fee / 成交量 / 价格波动等 alpha 指标',
    ],
  },
  {
    role: '全栈开发工程师',
    org: '北京中科蜂巢',
    period: '2018.07 – 2021.02',
    accent: 'border-green-500',
    points: [
      '基于 Java Swing / Eclipse 开发桌面建模工具 MetaGraph：建模、代码生成、架构驱动',
      '参与数据可视化工具 DataVis / DataLink 研发',
    ],
  },
];

export default function Me() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-700">
      <SiteNav />

      {/* Hero */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            随时到岗 · 开放远程 / 合作机会
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            马昌锋 <span className="opacity-70">/ Sky Ma</span>
          </h1>
          <p className="mt-3 text-lg font-medium opacity-95">
            高级后端工程师 · Web3 / 交易所核心系统
          </p>
          <p className="mt-6 max-w-2xl leading-relaxed opacity-90">
            7 年后端开发，5 年深耕加密货币交易所核心系统（永续合约 / 现货 / 做市）。主导多个交易所从
            0 到 1 搭建与上线，具备高并发撮合引擎、清算系统、强平机制的完整研发经验。熟悉 DeFi
            协议与链上数据分析，兼具 Solidity / Java 开发能力，英语良好，有海外一年工作经历。深度使用 AI
            工具提升研发效率，具备 AI Agent 工作流搭建与落地经验。
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <a
              href="mailto:macf.fighter@gmail.com"
              className="rounded-lg bg-white px-4 py-2 font-semibold text-purple-700 transition hover:bg-slate-100"
            >
              ✉ macf.fighter@gmail.com
            </a>
            <a
              href="https://x.com/tiger_macf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-4 py-2 font-medium text-white ring-1 ring-white/40 transition hover:bg-white/10"
            >
              𝕏 @tiger_macf
            </a>
            <a
              href="https://github.com/FighterAircraft"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-4 py-2 font-medium text-white ring-1 ring-white/40 transition hover:bg-white/10"
            >
              ⌥ GitHub
            </a>
            <span className="rounded-lg px-4 py-2 text-white/80 ring-1 ring-white/20">
              📱 147 0136 3581
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            <span>🎓 长沙理工大学 · 网络工程</span>
            <span>📅 7 年经验 · 30 岁</span>
            <span>🌐 中文母语 · 英语（CET-6 · 海外经历）</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-16 px-6 py-16">
        {/* Tech stack */}
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-purple-600">
            技术栈 / Tech Stack
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow">
            {stack.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6 ${
                  i !== 0 ? 'border-t border-slate-100' : ''
                }`}
              >
                <div className="w-28 shrink-0 font-semibold text-indigo-600">{s.label}</div>
                <div className="text-slate-600">{s.items}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-purple-600">
            工作经历 / Experience
          </h2>
          <div className="space-y-6">
            {experience.map((job) => (
              <div
                key={job.org}
                className={`rounded-xl border border-slate-200 border-l-4 ${job.accent} bg-white p-6 shadow transition hover:shadow-md`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {job.role} <span className="text-slate-500">· {job.org}</span>
                  </h3>
                  <span className="font-mono text-sm text-slate-400">{job.period}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {job.points.map((p, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-600">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-purple-400" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Featured project */}
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-purple-600">
            代表项目 / Featured
          </h2>
          <SmartLink
            href={WALLET_URL}
            className="group block rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">🚀 AI Agent Wallet</h3>
              <span className="text-sm font-medium text-purple-600 transition group-hover:translate-x-1">
                进入应用 →
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              自主交易 Agent 钱包：规则引擎 + Claude LLM 的混合决策模型，结合 Chainlink 预言机实时行情，
              自动评估止盈 / 止损 / DCA 策略并生成带置信度的决策。私钥不落服务器（MetaMask 签名模型），
              24/7 独立守护进程运行。把交易所核心系统经验与 AI Agent 工作流结合的实践作品。
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              {['Next.js 14', 'TypeScript', 'viem / wagmi', 'Claude API', 'Chainlink', 'SQLite'].map(
                (t) => (
                  <span key={t} className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                    {t}
                  </span>
                ),
              )}
            </div>
          </SmartLink>
        </section>

        {/* Education */}
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-purple-600">
            教育背景 / Education
          </h2>
          <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-slate-200 bg-white p-6 shadow">
            <div>
              <h3 className="font-bold text-slate-900">网络工程 学士 · 长沙理工大学</h3>
              <p className="mt-1 text-sm text-slate-500">专业排名前 20% · 英语良好</p>
            </div>
            <span className="font-mono text-sm text-slate-400">2014.09 – 2018.06</span>
          </div>
        </section>
      </div>

      <footer className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-6 py-10 text-center text-sm">
          <p className="opacity-80">马昌锋 (Sky Ma) · 高级后端工程师 · Web3 / 交易所核心系统</p>
          <p className="opacity-70">
            <a className="hover:text-purple-300 hover:underline" href="mailto:macf.fighter@gmail.com">
              macf.fighter@gmail.com
            </a>
            <span className="mx-2 opacity-40">·</span>
            <a
              className="hover:text-purple-300 hover:underline"
              href="https://x.com/tiger_macf"
              target="_blank"
              rel="noopener noreferrer"
            >
              𝕏 @tiger_macf
            </a>
            <span className="mx-2 opacity-40">·</span>
            <a
              className="hover:text-purple-300 hover:underline"
              href="https://github.com/FighterAircraft"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <span className="mx-2 opacity-40">·</span>
            <a className="hover:text-purple-300 hover:underline" href="https://work4sky.com">
              work4sky.com
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
