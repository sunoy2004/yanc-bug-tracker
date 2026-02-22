### Multi-stage Dockerfile for building and serving the Vite React app with Nginx
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies (use legacy-peer-deps to avoid peer conflicts in CI)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

### Production image
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy entrypoint that generates runtime-config.js from container env vars
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Custom nginx config (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- --timeout=3 http://localhost:8080/ || exit 1

# Run the entrypoint which writes runtime-config.js then execs nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

