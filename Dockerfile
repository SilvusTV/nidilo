FROM node:25-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:25-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/build ./
RUN npm ci --omit=dev
EXPOSE 3333
CMD ["sh", "-c", "node ace migration:run --force && node bin/server.js"]
