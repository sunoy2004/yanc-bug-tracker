### Multi-stage Dockerfile for building and serving the Vite React app with Nginx
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy source and build
COPY . .
RUN npm run build

### Production image
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- --timeout=3 http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

