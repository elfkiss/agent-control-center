# AI Agent 控制中心 (Agent Control Center)

> 基于 OpenClaw 的 AI Agent 管理与控制面板

## 项目介绍

一个现代化的 AI Agent 控制中心，提供可视化的界面来管理和控制 AI Agent。

## 功能特性

### ✅ 已完成
- [x] Agent 列表展示与搜索
- [x] 实时对话界面
- [x] 模型选择
- [x] 系统提示词配置
- [x] 工具标签展示
- [x] 消息统计
- [x] API 连接配置

### 🚧 开发中
- [ ] OpenClaw API 对接
- [ ] 多 Agent 管理
- [ ] 对话历史持久化

### 📋 计划功能
- [ ] 工具权限配置
- [ ] Agent 创建/编辑
- [ ] 会话管理
- [ ] 性能监控面板
- [ ] 插件系统
- [ ] 主题自定义

## 技术栈

- 前端: HTML5 + CSS3 + Vanilla JavaScript
- 后端: OpenClaw Gateway API
- 部署: Docker + Nginx

## 快速开始

```bash
# 克隆项目
git clone https://github.com/elfkiss/agent-control-center.git
cd agent-control-center

# 构建 Docker 镜像
docker build -t agent-control .

# 启动服务
docker run -d -p 8899:80 agent-control
```

访问 http://localhost:8899

## 配置

在界面右侧填写：
- API 地址: http://your-openclaw-gateway:18789
- API Token: 你的 Gateway Token

## 更新日志

### 2026-03-11 v0.1.0
- 初始版本发布
- 基本对话界面
- Agent 列表
- 配置面板
