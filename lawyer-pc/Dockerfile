# 律师端Dockerfile
FROM nginx:alpine

# 复制构建产物到Nginx静态目录
COPY dist/ /usr/share/nginx/html/lawyer/

# 暴露端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]