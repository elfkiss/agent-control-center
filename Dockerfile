FROM node:20-alpine

LABEL maintainer="OpenClaw Community"
LABEL description="OpenClaw AI Assistant Real-time Monitoring Dashboard"

# 设置工作目录
WORKDIR /app

# 复制应用文件
COPY package.json .
COPY server.js .
COPY index.html .

# 安装依赖
RUN npm install --production

# 创建非root用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# 设置权限
RUN chown -R appuser:appgroup /app

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 8899

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8899/api/health || exit 1

# 启动服务
CMD ["node", "server.js"]
