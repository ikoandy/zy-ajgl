# 管理后台Dockerfile
FROM nginx:alpine

# 复制构建产物到Nginx静态目录
COPY dist/ /usr/share/nginx/html/admin/

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]