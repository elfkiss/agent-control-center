FROM nginx:alpine

# 版本: v0.1.3
LABEL version="v0.1.3"
LABEL description="Agent Control Center - OpenClaw UI"

COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
