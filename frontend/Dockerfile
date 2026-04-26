# Build stage — VITE_API_BASE_URL is baked in at build time
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8081
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Serve static SPA
FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
