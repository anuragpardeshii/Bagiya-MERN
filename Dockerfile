FROM node:22-bookworm-slim AS api-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
FROM api-deps AS api-dev
COPY --chown=node:node backend ./
USER node
EXPOSE 3000
CMD ["npm","run","dev"]
FROM api-deps AS api-production
RUN npm prune --omit=dev
COPY --chown=node:node backend ./
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node","index.js"]
FROM node:22-bookworm-slim AS web-deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
FROM web-deps AS web-dev
COPY --chown=node:node scripts/package-extension.cjs /app/scripts/package-extension.cjs
COPY --chown=node:node backend/lib/focusPolicy.js /app/backend/lib/focusPolicy.js
COPY --chown=node:node extension /app/extension
COPY --chown=node:node frontend ./
USER node
EXPOSE 5173
CMD ["npm","run","dev","--","--host","0.0.0.0"]
FROM web-deps AS web-build
COPY scripts/package-extension.cjs /app/scripts/package-extension.cjs
COPY backend/lib/focusPolicy.js /app/backend/lib/focusPolicy.js
COPY extension /app/extension
COPY frontend ./
RUN npm run build
FROM nginx:stable-alpine AS web-production
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=web-build /app/frontend/dist /usr/share/nginx/html
RUN sed -i 's@/var/run/nginx.pid@/tmp/nginx.pid@g; s@/run/nginx.pid@/tmp/nginx.pid@g; /^user /d' /etc/nginx/nginx.conf
RUN chown -R nginx:nginx /var/cache/nginx /var/run /etc/nginx /usr/share/nginx/html
USER nginx
EXPOSE 8080
CMD ["nginx","-g","daemon off;"]
