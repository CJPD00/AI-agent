FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm cache clean --force && npm run build

# Production Stage
FROM nginx:alpine
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
