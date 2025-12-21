# 📈 Real-time Stock Trading Simulator

Một nền tảng giả lập giao dịch chứng khoán thời gian thực, tích hợp đầy đủ các tính năng của một sàn giao dịch chuyên nghiệp: Khớp lệnh tự động, Bot Trading, Phân tích biểu đồ và Cổng thanh toán.


## ✨ Tính Năng Nổi Bật (Key Features)

- **Real-time Market:** Giá cổ phiếu biến động từng giây sử dụng công nghệ **WebSockets**.
- **Bot Trading System:** Hệ thống Bot tự động đặt lệnh Mua/Bán tạo thanh khoản cho thị trường (NPC Traders).
- **Matching Engine:** Cơ chế khớp lệnh **Limit Order** (Lệnh chờ) tự động khi giá thị trường chạm ngưỡng.
- **Banking System:** 
  - Tích hợp cổng thanh toán **VNPAY Sandbox**.
  - Giả lập chuyển khoản **VietQR + Webhook**.
- **Price Alerts:** Hệ thống cảnh báo giá qua **Telegram Bot** (Deep Linking Integration).
- **Admin Dashboard:** Phân quyền (RBAC), quản lý User, khóa tài khoản.
- **Interactive Charts:** Biểu đồ lịch sử giá trực quan.

## 🛠 Công Nghệ Sử Dụng (Tech Stack)

| Lĩnh vực | Công nghệ |
| :--- | :--- |
| **Backend** | NestJS, TypeORM, Socket.io, RxJS |
| **Frontend** | React (Vite), Ant Design, Recharts, Axios Interceptor |
| **Database** | MySQL 8.0 |
| **DevOps** | Docker, Docker Compose, Nginx |
| **Tools** | Postman, VNPAY Sandbox, Telegram API |

## ⚙️ Cài Đặt & Chạy Dự Án (Installation)

Dự án hỗ trợ chạy "Zero Config" với Docker. Bạn không cần cài đặt Node.js hay MySQL thủ công.

### Yêu cầu tiên quyết
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã được cài đặt và đang chạy.

### Bước 1: Clone dự án
```bash
git clone https://github.com/cuziycloud/Real-time-Stock-Trading-Simulator.git
cd Real-time-Stock-Trading-Simulator
```

### Bước 2: Cấu hình môi trường
Copy file môi trường mẫu thành file thật:
```bash
cp .env.example .env
```
*(Bạn có thể mở file `.env` để chỉnh sửa secret key nếu muốn)*

### Bước 3: Khởi chạy (Deploy)
Chạy lệnh sau để dựng toàn bộ hệ thống (DB, Backend, Frontend):
```bash
docker-compose up -d --build
```

### Bước 4: Truy cập
- **Frontend (Web App):** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000](http://localhost:3000)

## 👤 Tài Khoản Demo

Hệ thống có cơ chế **Auto Seeding**, tự động tạo tài khoản Admin và Bot khi khởi động lần đầu.

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Admin** | `cloudz@stock.com` | `admin123` |
| **User** | *(Bạn hãy đăng ký mới)* | *(Tự chọn)* |

## 🧪 Hướng Dẫn Test Tính Năng

1.  **Nạp tiền:**
    - Đăng nhập -> Click icon `+` (Nạp tiền).
    - Chọn **VietQR** -> Bấm nút **"GIẢ LẬP ĐÃ CHUYỂN KHOẢN"**.
    - Hoặc chọn **VNPAY** -> Sử dụng **thẻ test NCB** (Số thẻ: `9704198526191432198`, Tên chủ thẻ: `NGUYEN VAN A`, Ngày phát hành: `07/15`, Mật khẩu OTP: `123456`) hoặc tham khảo thêm tại đây: `https://sandbox.vnpayment.vn/apis/vnpay-demo/`.
2.  **Đặt lệnh chờ (Limit Order):**
    - Chọn mã CK (ví dụ FPT giá 90).
    - Đặt mua giá thấp (ví dụ 50).
    - Vào "Sổ Lệnh" để xem trạng thái `PENDING`.
    - Chờ giá thị trường giảm (hoặc Bot bán xuống) -> Lệnh sẽ `MATCHED`.
3.  **Kết nối Telegram:**
    - Bấm vào Avatar -> "Kết nối Telegram".
    - Quét mã QR bằng điện thoại -> Bấm Start -> Nhận thông báo thành công.
    - Tạo cảnh báo giá (Nút chuông 🔔) -> Chờ nhận tin nhắn về điện thoại.

## 🤝 Liên Hệ / Đóng Góp

Dự án được phát triển bởi **[Cloudz]**.
