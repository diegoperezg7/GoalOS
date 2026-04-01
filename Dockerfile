FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_AI_PROVIDER
ARG VITE_AI_API_BASE_URL
ARG VITE_OLLAMA_BASE_URL
ARG VITE_OLLAMA_MODEL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_AI_PROVIDER=$VITE_AI_PROVIDER
ENV VITE_AI_API_BASE_URL=$VITE_AI_API_BASE_URL
ENV VITE_OLLAMA_BASE_URL=$VITE_OLLAMA_BASE_URL
ENV VITE_OLLAMA_MODEL=$VITE_OLLAMA_MODEL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
