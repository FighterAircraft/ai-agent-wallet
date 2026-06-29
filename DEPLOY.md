# 部署:将 wallet.work4sky.com 指向 M8 内网 web(Cloudflare Tunnel)

## 背景

M8 开发机(`sky@192.168.1.7`)在局域网内、**没有独立公网 IP 出口**、不能做端口转发,需要把它上面运行的 Next.js web 对外暴露为 `https://wallet.work4sky.com/`。

已确认环境(实测):
- `work4sky.com` 的 DNS **托管在 Cloudflare**。
- **没有公网 VPS**,希望**零服务器**(不维护任何公网中转机)。
- M8 处于**普通 NAT**,能主动发起出站 443 连接。
- M8 系统:**Ubuntu 22.04.5 LTS**,用户 `sky`,家目录 `/home/sky`,服务守护用 **systemd**。
- web 为 Next.js 16,`npm run start`(`next start`)默认监听 **localhost:3000**。
- 平时 SSH 进去是纯命令行(tty),但**机器装有 GNOME 桌面、必要时能开图形界面**,故可使用需要浏览器的 `cloudflared tunnel login`。

结论:采用 **Cloudflare Tunnel(`cloudflared`)**,走 **CLI 命名隧道 + `config.yml`(配置即代码)**。M8 上的 `cloudflared` 守护进程主动向 Cloudflare 边缘建立出站长连接,Cloudflare 把入站流量经隧道回灌到本地端口。无需公网 IP、无需入站端口转发、HTTPS 由 Cloudflare 边缘自动签发与续期。

## 架构

```
浏览器 ──HTTPS──> Cloudflare 边缘 ──加密隧道(出站443)──> M8 上 cloudflared ──> localhost:3000 (Next.js)
                       │
              wallet.work4sky.com 的 CNAME 指向 <tunnel-id>.cfargotunnel.com
```

---

## 当前实际部署(速查)

> 已于 2026-06-29 在 M8 上线。日常迭代直接看「[四、迭代更新](#四迭代更新日常重复部署)」即可,无需重做下面的首次部署。

| 项 | 值 |
|---|---|
| 仓库目录 | `/home/sky/ai-agent-wallet` |
| web 服务(systemd) | `ai-agent-wallet.service` — `npm run start` @ `:3000`,`enabled` + `Restart=always` |
| **agent daemon(systemd)** | `ai-agent-wallet-daemon.service` — `node --env-file=.env.local dist/daemon.mjs`,`User=sky`,`enabled` + `Restart=always` |
| 隧道服务(systemd) | `cloudflared-wallet.service` — `User=sky`,`enabled` + `Restart=always` |
| 隧道名 / UUID | `wallet-m8` / `872ad250-4f10-48ae-98ee-135169c87724` |
| 隧道凭证目录 | `/home/sky/.cloudflared/`(`config.yml`、`cert.pem`、`<UUID>.json`,**勿进 git**) |
| Node / npm | `/usr/bin/node`、`/usr/bin/npm`(系统装,非 nvm) |
| cloudflared | `2026.6.1`(apt 安装) |
| sudo | 需密码(部署时临时开过 NOPASSWD,已撤销) |
| 一键重部署 | `bash scripts/redeploy.sh`(见第四节) |

---

## 一、隧道部署(在 M8 上操作)

### 1. 安装 cloudflared(Ubuntu)
```bash
# 官方 apt 源
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \
  | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main" \
  | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt-get update && sudo apt-get install -y cloudflared
cloudflared --version
```

### 2. 登录授权
```bash
cloudflared tunnel login
```
会打开浏览器,选择 `work4sky.com` 这个 zone 授权;完成后在 `/home/sky/.cloudflared/` 生成 `cert.pem`。
> 若不想在 M8 上开图形界面:在**自己笔记本**上 `cloudflared tunnel login`,再把生成的 `~/.cloudflared/cert.pem` 用 `scp` 拷到 M8 的 `/home/sky/.cloudflared/cert.pem` 即可。

### 3. 创建命名隧道
```bash
cloudflared tunnel create wallet-m8
```
生成隧道 UUID 与凭证 `/home/sky/.cloudflared/<UUID>.json`(隧道私钥,**勿提交 git**)。

### 4. 写配置 `/home/sky/.cloudflared/config.yml`
```yaml
tunnel: <UUID>
credentials-file: /home/sky/.cloudflared/<UUID>.json
ingress:
  - hostname: wallet.work4sky.com
    service: http://localhost:3000
  - service: http_status:404            # 兜底,必须有
```

### 5. 绑定 DNS 路由
```bash
cloudflared tunnel route dns wallet-m8 wallet.work4sky.com
```
自动在 Cloudflare DNS 写入 `wallet` 的 CNAME → `<UUID>.cfargotunnel.com`(橙云代理)。

> **若已存在 `wallet` 记录**(本次首部署就遇到旧记录,报 `An A, AAAA, or CNAME record with that host already exists`),直接用 `--overwrite-dns` 覆盖,无需手动去面板删:
> ```bash
> cloudflared tunnel route dns --overwrite-dns wallet-m8 wallet.work4sky.com
> ```
> 写完可 `cloudflared tunnel ingress validate` 校验 config。

### 6. 手动联调
确保 web 已在 3000 监听后,前台跑:
```bash
cloudflared tunnel run wallet-m8
```
外网访问 `https://wallet.work4sky.com/` 验证;通了再 Ctrl-C,进入下一步装守护。

### 7. 装成 systemd 守护(开机自启 + 断线重连)
实测**没用** `sudo cloudflared service install`(它生成的 unit 以 root 运行,root 家目录 `/root/.cloudflared` 里没有凭证,易踩坑)。改为**手写 unit、以 `User=sky` 运行**,直接读 `/home/sky/.cloudflared` 下的 config 和凭证:

新建 `/etc/systemd/system/cloudflared-wallet.service`:
```ini
[Unit]
Description=cloudflared tunnel (wallet-m8)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=sky
ExecStart=/usr/bin/cloudflared --no-autoupdate --config /home/sky/.cloudflared/config.yml tunnel run wallet-m8
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```
启用并核对连接:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared-wallet
systemctl is-active cloudflared-wallet
cloudflared tunnel info wallet-m8        # 应显示活跃 CONNECTOR + edge 节点
```

---

## 二、让 web 进程也 7×24 常驻(systemd)

隧道只负责把公网流量送到 `localhost:3000`;**web 进程本身也必须常驻**,否则隧道通了但后端没起会 502。用生产模式跑,别用 `next dev`。

### 1. 构建
```bash
cd /home/sky/ai-agent-wallet     # 按 M8 上仓库实际路径调整
npm ci
npm run build
```

### 2. 新建 `/etc/systemd/system/ai-agent-wallet.service`
```ini
[Unit]
Description=AI Agent Wallet (Next.js)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=sky
WorkingDirectory=/home/sky/ai-agent-wallet
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```
> **不需要 `EnvironmentFile`**:`next start` 会自动从 `WorkingDirectory` 加载 `.env.local`(启动日志里的 `- Environments: .env.local` 即为证),交给 systemd 反而要处理 env 文件解析。`.env.local` 不在 git 里,需单独放到仓库目录(首部署是从本机 `scp` 过去的)。
> `ExecStart` 的 `npm` 路径以 `which npm` 为准(本机实测 `/usr/bin/npm`;若用 nvm 装则不是这个路径,需填实际路径或改用绝对路径的 node)。

### 3. 启用
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ai-agent-wallet
systemctl status ai-agent-wallet --no-pager
curl -I http://localhost:3000
```

> 三个服务(web / agent daemon / cloudflared)统一用 systemd 管理。

---

## 二·五、Agent 常驻 daemon(systemd)

交易 agent 跑在**独立 Node 进程**(不在 web 进程里),由 SQLite 的 `agent_state` 表驱动:网页上 Start/Stop 切 `enabled` 标志,daemon 按标志运行并每轮写心跳。只读链上余额,**不签名、不下单**。

### 1. 构建产物
```bash
cd /home/sky/ai-agent-wallet
npm run build:daemon         # esbuild 打包 → dist/daemon.mjs(@/ 别名已解析,deps 外部化)
```
> `dist/` 不进 git(产物),每次部署用 `build:daemon` 生成。`scripts/redeploy.sh` 默认已包含这步。

### 2. 配置监控钱包(可选)
在 `/home/sky/ai-agent-wallet/.env.local` 里设:
```bash
AGENT_WALLET_ADDRESS=0x....   # 要监控的钱包地址;留空则用 mock 1 ETH
AGENT_CHAIN=sepolia           # sepolia(默认) 或 mainnet
```
改完需 `scp` 同步并重启 daemon。

### 3. 新建 `/etc/systemd/system/ai-agent-wallet-daemon.service`
```ini
[Unit]
Description=AI Agent Wallet Daemon
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=sky
WorkingDirectory=/home/sky/ai-agent-wallet
ExecStart=/usr/bin/node --env-file=/home/sky/ai-agent-wallet/.env.local /home/sky/ai-agent-wallet/dist/daemon.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```
> Node 22 用 `--env-file` 原生加载 `.env.local`,无需 dotenv。`ExecStart` 的 `node` 路径以 `which node` 为准(M8 实测 `/usr/bin/node`)。

### 4. 启用
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ai-agent-wallet-daemon
journalctl -u ai-agent-wallet-daemon -n 20 --no-pager   # 应看到 "daemon started" + 每轮 idle/cycle
```
> 默认 `agent_state.enabled=0`(idle)。在网页点 Start,或直接 `POST /api/agent/start`,daemon 即开始决策。

---

## 三、验证(端到端)
```bash
# 1) 本机 web 在跑
curl -s -o /dev/null -w "local  HTTP %{http_code}\n" http://localhost:3000
# 2) 隧道有活跃连接
cloudflared tunnel info wallet-m8 | head
# 3) 外网可达 + 证书为 Cloudflare(从任意外网设备 / 本机均可)
curl -sS -I https://wallet.work4sky.com/ | grep -iE "^(HTTP|server|cf-ray)"
curl -s -o /dev/null -w "/api/agent/status  HTTP %{http_code}\n" https://wallet.work4sky.com/api/agent/status
# 4) 两个服务开机自启 + 正在运行
systemctl is-enabled ai-agent-wallet cloudflared-wallet
systemctl is-active  ai-agent-wallet cloudflared-wallet
```
- **重启自恢复**:`sudo reboot` 后不手动操作,1~2 分钟再访问 `https://wallet.work4sky.com/` 仍 200。
- **守护自拉起**:`sudo systemctl kill cloudflared-wallet`(或 `ai-agent-wallet`)后稍等,`systemctl is-active` 应恢复 `active`。

---

## 四、迭代更新(日常重复部署)

代码改完、本地验证 OK 后,在 M8 上更新线上版本。**日常只动 web,不碰隧道。**

### 一键脚本(推荐)
仓库内已带 `scripts/redeploy.sh`,在 M8 上跑(`sudo` 会提示输密码):
```bash
cd /home/sky/ai-agent-wallet
git pull --ff-only          # 先把脚本本身和代码拉下来
bash scripts/redeploy.sh            # 只更新 web
bash scripts/redeploy.sh --with-tunnel   # 顺带重启隧道(一般不需要)
```
脚本做了 `pull → npm ci → npm run build →(构建成功才)restart → 本地+外网健康检查`。**先构建后重启**:构建失败就不重启,旧版本继续在线(零停机)。任一健康检查失败会非零退出并提示看哪个 journal。

### 手动等价步骤
```bash
cd /home/sky/ai-agent-wallet
git pull --ff-only
npm ci                      # 依赖(package-lock)没变可省;变了必须跑
npm run build               # 旧进程仍在服务,几乎零停机
sudo systemctl restart ai-agent-wallet
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000
```

> 改了密钥/环境变量(`.env.local`):它不在 git 里,需先从本机 `scp .env.local sky@192.168.1.7:/home/sky/ai-agent-wallet/` 再跑上面流程。
> 改了隧道映射(`config.yml`):`sudo systemctl restart cloudflared-wallet`。

---

## 五、查看日志 / 排错

```bash
# 实时跟踪(Ctrl-C 退出)
sudo journalctl -u ai-agent-wallet -f        # web 应用日志(Next 的 console 输出都在这)
sudo journalctl -u ai-agent-wallet-daemon -f # agent daemon 日志(每轮 idle/cycle 的单行 JSON)
sudo journalctl -u cloudflared-wallet -f     # 隧道日志

# 最近 N 行 / 按时间 / 只看错误
sudo journalctl -u ai-agent-wallet -n 100
sudo journalctl -u ai-agent-wallet --since "30 min ago"
sudo journalctl -u ai-agent-wallet -p err

# 服务状态(含最近几行)
systemctl status ai-agent-wallet cloudflared-wallet
```
- **免 sudo 看日志**:`sudo usermod -aG systemd-journal sky` 后重新登录,之后 `journalctl -u ...` 不用 sudo。
- **该看哪个**:502 / 打不开 → 先看 `cloudflared-wallet`;页面或 API 报 500 → 看 `ai-agent-wallet`。
- **`EADDRINUSE :::3000`**:有残留进程占着 3000(常因手动 `npm start` 没杀干净)。`fuser -k 3000/tcp` 后 `sudo systemctl restart ai-agent-wallet`。

## 安全注意
- `/home/sky/.cloudflared/<UUID>.json`、`cert.pem` 是隧道凭证,**不要进 git**(它们在家目录、不在仓库内;若拷进项目记得加 `.gitignore`)。
- `.env.local`(含 `ANTHROPIC_API_KEY` 等)同理,不要提交。
- 如需限制访问,可在 Cloudflare Zero Trust 给 `wallet.work4sky.com` 加 Access 策略(可选,后续)。

## 附:备选方式(面板 token,纯命令行)
若哪天不想维护 `config.yml`/`cert.pem`:Cloudflare → Zero Trust → Networks → Tunnels 新建隧道,加 public hostname `wallet.work4sky.com` → `http://localhost:3000`,面板给一条 `cloudflared tunnel run --token <TOKEN>`,用 `sudo cloudflared service install <TOKEN>` 装成 systemd 即可,无需 `login`/`cert.pem`,映射全在面板维护。
