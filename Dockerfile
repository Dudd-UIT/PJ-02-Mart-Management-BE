# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build


FROM node:18 AS production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/dump ./dist/src/dump

COPY package.json ./

EXPOSE 8081

CMD ["node", "dist/src/main"]