#!/usr/bin/env bash
#
# redeploy.sh — 在 M8 上一键重部署 AI Agent Wallet 的 web 服务。
#
# 流程: git pull → npm ci → npm run build →(先构建成功才)restart → 本地+外网健康检查。
# 「先构建后重启」保证:构建失败时旧版本继续在线,零停机。
#
# 用法(在 M8 上交互式运行,sudo 会提示输密码):
#   bash scripts/redeploy.sh                # 更新 web + daemon(默认)
#   bash scripts/redeploy.sh --with-tunnel  # 顺带重启 cloudflared 隧道
#   bash scripts/redeploy.sh --skip-daemon  # 只更新 web,不动 daemon
#
# 不管理 .env.local(密钥不进 git);改了密钥请先单独 scp 再跑本脚本。

set -euo pipefail

# ---- 可配置变量 ----
REPO="${REPO:-/home/sky/ai-agent-wallet}"
SERVICE="${SERVICE:-ai-agent-wallet}"
DAEMON_SERVICE="${DAEMON_SERVICE:-ai-agent-wallet-daemon}"
TUNNEL_SERVICE="${TUNNEL_SERVICE:-cloudflared-wallet}"
LOCAL_URL="${LOCAL_URL:-http://localhost:3000}"
PUBLIC_URL="${PUBLIC_URL:-https://wallet.work4sky.com/}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-25}"   # 本地健康检查最长等待秒数

WITH_TUNNEL=0
WITH_DAEMON=1
for arg in "$@"; do
  case "$arg" in
    --with-tunnel) WITH_TUNNEL=1 ;;
    --skip-daemon) WITH_DAEMON=0 ;;
  esac
done

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

[ -d "$REPO" ] || die "仓库目录不存在: $REPO"
cd "$REPO"

log "拉取最新代码 (git pull --ff-only)"
git pull --ff-only

log "安装依赖 (npm ci)"
npm ci

log "构建 web (npm run build) —— 失败则不重启,旧版本继续在线"
npm run build || die "web 构建失败,已保留旧版本在线。看日志: sudo journalctl -u $SERVICE -n 50"

if [ "$WITH_DAEMON" = "1" ]; then
  log "构建 daemon (npm run build:daemon)"
  npm run build:daemon || die "daemon 构建失败,未重启任何服务,旧版本继续在线。"
fi

log "重启 web 服务: $SERVICE"
sudo systemctl restart "$SERVICE"

if [ "$WITH_DAEMON" = "1" ]; then
  log "重启 daemon 服务: $DAEMON_SERVICE"
  sudo systemctl restart "$DAEMON_SERVICE"
fi

if [ "$WITH_TUNNEL" = "1" ]; then
  log "重启隧道服务: $TUNNEL_SERVICE"
  sudo systemctl restart "$TUNNEL_SERVICE"
fi

log "本地健康检查: $LOCAL_URL (最多 ${HEALTH_TIMEOUT}s)"
local_code=""
for i in $(seq 1 "$HEALTH_TIMEOUT"); do
  local_code="$(curl -s -o /dev/null -w '%{http_code}' "$LOCAL_URL" || true)"
  case "$local_code" in
    200|301|302|307|308) break ;;
  esac
  sleep 1
done
case "$local_code" in
  200|301|302|307|308) printf '  本地 OK: HTTP %s\n' "$local_code" ;;
  *) die "本地健康检查失败 (HTTP '${local_code}')。看日志: sudo journalctl -u $SERVICE -n 80" ;;
esac

log "外网健康检查: $PUBLIC_URL"
public_code="$(curl -s -o /dev/null -w '%{http_code}' "$PUBLIC_URL" || true)"
case "$public_code" in
  200|301|302|307|308) printf '  外网 OK: HTTP %s\n' "$public_code" ;;
  *) die "外网健康检查失败 (HTTP '${public_code}')。隧道问题看: sudo journalctl -u $TUNNEL_SERVICE -n 80" ;;
esac

daemon_state="skipped"
if [ "$WITH_DAEMON" = "1" ]; then
  log "daemon 健康检查: $DAEMON_SERVICE"
  daemon_state="$(systemctl is-active "$DAEMON_SERVICE" || true)"
  if [ "$daemon_state" = "active" ]; then
    printf '  daemon OK: active\n'
  else
    die "daemon 未运行 (状态 '${daemon_state}')。看日志: sudo journalctl -u $DAEMON_SERVICE -n 80"
  fi
fi

log "完成 ✅  web=$(systemctl is-active "$SERVICE")  daemon=${daemon_state}  tunnel=$(systemctl is-active "$TUNNEL_SERVICE")  本地=$local_code  外网=$public_code"
