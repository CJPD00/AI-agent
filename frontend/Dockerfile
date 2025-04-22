FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm cache clean --force && npm run build

# Production Stage
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf && \
    echo "http { \
    server { \
        listen 80; \
        server_name localhost; \
\
        location / { \
            root   /usr/share/nginx/html; \
            index  index.html; \
            try_files \$uri \$uri/ /index.html; \
        } \
\
        location /n8n/ { \
            proxy_pass http://n8n:5678/; \
            proxy_set_header Host \$host; \
            proxy_set_header X-Real-IP \$remote_addr; \
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; \
        } \
    } \
} \
events {}" > /etc/nginx/conf.d/default.conf

COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
