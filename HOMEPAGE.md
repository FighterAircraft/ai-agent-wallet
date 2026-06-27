# AI Agent Wallet — Homepage & Documentation

## 页面关系说明

### 📄 两个"首页"的区别

#### 1. **静态演示页面** (`/private/tmp/ai-wallet-demo.html`)
- **类型**：静态 HTML 文档
- **用途**：项目演示、文档展示
- **内容**：完整的项目信息、API文档、架构说明
- **何时使用**：分享给不搭建本地环境的人查看
- **特点**：不需要运行服务器，直接在浏览器打开

#### 2. **真正的应用首页** (`http://localhost:3000`)
- **类型**：Next.js 动态网页（React）
- **用途**：实际使用、控制 Agent、查看实时数据
- **内容**：
  - 📊 实时价格显示（Portfolio 组件）
  - 🤖 Agent 控制面板（AgentStatus 组件）
  - 📡 API 快速参考
  - ✨ 核心功能卡片
  - 🔄 决策流程可视化
  - 🎯 路线图和后续开发计划
- **何时使用**：运行本地开发服务器时
- **特点**：交互式、实时更新、可以启动/停止 Agent

---

## Agent Status 与首页的关联

### 核心关联流程

```
┌─────────────────────────────────────────────┐
│         AI Agent Wallet 首页                 │
│      (http://localhost:3000)                 │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────┬──────────────────┐    │
│  │  Portfolio      │  Agent Status    │    │
│  │  (右侧面板)     │  (核心控制)      │    │
│  │                 │                  │    │
│  │  • 实时价格     │  • 运行状态      │    │
│  │  • ETH 余额     │  • 启动/停止按钮 │    │
│  │  • 总资产值     │  • 最近决策列表  │    │
│  │                 │  • 错误提示      │    │
│  └─────────────────┴──────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Core Features + API Docs + ...     │   │
│  │  (项目信息和文档)                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### 数据流向

1. **Portfolio 组件** → 调用 `/api/prices` → 显示实时 ETH/USD 价格
2. **AgentStatus 组件** → 调用 `/api/agent/status` → 显示 Agent 运行状态
3. **用户点击 "Start Agent"** → POST `/api/agent/start` → Agent 开始轮询
4. **Agent 运行** → 周期性调用规则引擎 → 生成决策记录
5. **AgentStatus 刷新** → 调用 `/api/agent/decisions` → 显示最近决策

---

## 文件结构

```
ai-agent-wallet/
├── app/
│   ├── page.tsx              ← 动态首页（改进后）
│   └── api/
│       ├── prices/           ← Chainlink 价格 API
│       └── agent/
│           ├── status/       ← Agent 状态 API
│           ├── start/        ← 启动 Agent API
│           ├── stop/         ← 停止 Agent API
│           └── decisions/    ← 决策历史 API
│
├── components/
│   ├── Portfolio/            ← 显示实时价格和余额
│   └── AgentStatus/          ← Agent 控制面板和决策列表
│
├── hooks/
│   ├── useChainlinkPrice.ts  ← 价格数据 Hook
│   └── useAgentStatus.ts     ← Agent 状态和决策 Hook
│
└── /private/tmp/ai-wallet-demo.html  ← 静态演示文档
```

---

## 改进亮点

### 新首页改进

✅ **更好的视觉层级**
- 深色梯度头部，突出项目名称
- 快速统计卡片（Status, Network, Database, AI Model）

✅ **Agent Status 中心地位**
- Portfolio 和 AgentStatus 重新排列
- AgentStatus 占据 2 列，优先级更高

✅ **项目信息集成**
- 6 个核心功能卡片
- API 端点快速参考
- 决策流程可视化
- 开发路线图

✅ **响应式设计**
- 移动设备上自动调整布局
- 所有卡片都有悬停效果

---

## 使用指南

### 本地开发

```bash
# 启动服务器
npm run dev

# 打开首页
# http://localhost:3000

# 查看静态演示（不需要服务器）
# file:///private/tmp/ai-wallet-demo.html
```

### 与 Agent 交互

```bash
# 从首页点击 "Start Agent" 按钮
# 或直接调用 API:

# 启动 Agent
curl -X POST http://localhost:3000/api/agent/start \
  -H "Content-Type: application/json" \
  -d '{"checkInterval":30000,"minConfidence":60}'

# 查看决策
curl http://localhost:3000/api/agent/decisions | jq

# 停止 Agent
curl -X POST http://localhost:3000/api/agent/stop
```

---

## 下一步

1. **钱包连接**：集成 wagmi + MetaMask
2. **策略管理**：创建专用页面来管理交易规则
3. **交易执行**：实现 Uniswap 交易签名流程
4. **实时通知**：添加 WebSocket 实时更新而不是轮询
5. **性能分析**：显示 Agent 的成功率和收益率

---

**Created:** 2026-06-27  
**Last Updated:** 2026-06-27  
**Status:** MVP 完成，持续改进中
