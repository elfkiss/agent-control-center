# OpenClaw Monitor Dashboard
# 实时监控 OpenClaw AI助手运行状态

基于 Node.js 的监控看板，通过 OpenClaw CLI 获取实时数据。

## 功能特性

- 🚀 Gateway 状态实时监控
- ⏰ 定时任务 (Cron) 监控
- 📱 渠道状态（飞书/Telegram等）
- 💬 会话管理监控
- 🔒 安全警告提醒
- 📊 Token 使用统计
- 🔄 自动刷新（30秒）

## 快速开始

### 方法一：Docker Compose（推荐）

```bash
# 克隆后直接启动
docker-compose up -d
```

访问 http://localhost:8899

### 方法二：Docker Build

```bash
# 构建镜像
docker build -t openclaw-monitor .

# 运行
docker run -d -p 8899:8899 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name openclaw-monitor \
  openclaw-monitor
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | `8899` |
| `OPENCLAW_PATH` | OpenClaw CLI 路径 | `/usr/local/bin/openclaw` |
| `REFRESH_INTERVAL` | 刷新间隔(毫秒) | `30000` |

## 数据来源

看板通过调用 `openclaw` CLI 获取数据：
- `openclaw health` - 系统健康状态
- `openclaw status` - 详细状态信息
- `openclaw cron list` - 定时任务列表

确保宿主机已安装 OpenClaw，并挂载相关路径。

## 部署架构

```
┌─────────────────┐     ┌──────────────────┐
│   Browser       │────▶│  Dashboard       │
│   (用户浏览器)   │     │  (Node.js :8899) │
└─────────────────┘     └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │   OpenClaw CLI   │
                         │  (宿主机)        │
                         └──────────────────┘
```

## 开源协议

MIT License
