# Stage 1: Build
FROM node:20-alpine AS build-stage
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build


# Stage 2: Servir con nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build-stage /app/dist .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]