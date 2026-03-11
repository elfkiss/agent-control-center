# Agent Control Center (ACC)

<p align="center">
  <img src="https://img.shields.io/badge/Version-v0.1.3-blue" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/Docker-Ready-blue" alt="Docker">
</p>

> 基于 OpenClaw 的 AI Agent 管理与控制面板

## 简介

一个现代化、可扩展的 AI Agent 控制中心，提供可视化的 Web 界面来管理和控制 AI Agent。

## 版本规划

| 类型 | 命名规则 | 更新频率 | 内容 |
|------|----------|----------|------|
| 小版本 | v0.1, v0.2, v1.1... | 每日 | Bug 修复、小功能优化 |
| 大版本 | v1.0, v2.0, v3.0 | 每周 | 新功能、重大改进 |

### 当前版本: v0.1.3 (2026-03-11)

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

### 2026-03-11 v0.1.3
- [FIX] 设置默认API地址
- [UPDATE] Docker镜像添加版本号

### 2026-03-11 v0.1.2
- [UPDATE] 优化界面加载状态
- [UPDATE] 对话历史 localStorage 存储
- [UPDATE] 错误处理增强
- [UPDATE] 测试 OpenClaw API 连接

### 2026-03-11 v0.1.0
- 初始版本发布
- 基本对话界面
- Agent 列表
- 配置面板

---

## 开发规范

### 分支管理
- `main` - 主分支，稳定版本
- `develop` - 开发分支

### 提交规范
```
[REFIX] 修复问题
[FEAT] 新功能
[UPDATE] 优化改进
[DOCS] 文档更新
```

### 更新频率
- 每日: 小版本更新 (Bug 修复、小调整)
- 每周: 大版本更新 (新功能)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
