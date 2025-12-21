# 1. Dùng Node.js phiên bản nhẹ (Alpine) làm nền
FROM node:20-alpine

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package.json vào trước (để tận dụng cache của Docker)
COPY package*.json ./

# 4. Cài đặt các thư viện (dependencies)
RUN npm install

# 5. Copy toàn bộ code nguồn vào container
COPY . .

# 6. Build code TypeScript sang JavaScript
RUN npm run build

# 7. Mở cổng 3000 (Cổng mặc định của NestJS)
EXPOSE 3000

# 8. Lệnh chạy server khi container khởi động
CMD ["npm", "run", "start:prod"]