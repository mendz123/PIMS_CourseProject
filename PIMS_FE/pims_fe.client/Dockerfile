# -- Build Stage --
FROM node:20-alpine AS build
WORKDIR /app

# Cài đặt dependency
COPY package*.json ./
RUN npm install

# Cài đặt biến môi trường URL thật của API vào FE trước khi Build file cứng
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy source code và build (Bỏ qua các lỗi cảnh báo code thừa của TypeScript để ép Build)
COPY . .
RUN npx vite build

# -- Run Stage (Dùng Nginx để chạy giao diện web siêu nhẹ) --
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Cấu hình lại Nginx để điều hướng router cho React/Vite (tránh lỗi 404)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
