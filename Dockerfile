# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Build ứng dụng NestJS
RUN npm run build

# Stage 2: Run (Production)
FROM node:18 AS production
WORKDIR /app

# Copy dependencies từ builder
COPY --from=builder /app/node_modules ./node_modules

# Copy mã build từ builder
COPY --from=builder /app/dist ./dist

COPY --from=builder /app/src/dump ./dist/src/dump

# Copy các file cần thiết (package.json)
COPY package.json ./

# Expose cổng
EXPOSE 8081

# Lệnh chạy ứng dụng (chỉnh sửa đường dẫn main.js)
CMD ["node", "dist/src/main"]
