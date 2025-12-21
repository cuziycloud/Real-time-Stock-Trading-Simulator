# Giai đoạn 1: Build React App
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Build ra file tĩnh (html, css, js) vào thư mục dist
RUN npm run build

# Giai đoạn 2: Chạy Web Server nhẹ (Nginx) để phục vụ file tĩnh
# (Cách này tối ưu hơn là dùng 'npm run dev' trên production)
FROM nginx:alpine as production-stage
# Copy file build từ giai đoạn 1 sang thư mục của Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Cấu hình Nginx để hỗ trợ React Router (F5 không bị lỗi 404)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]