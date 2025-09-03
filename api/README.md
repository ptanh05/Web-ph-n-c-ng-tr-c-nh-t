# 🚀 API Documentation - Hệ thống Quản lý Trực nhật

## 📋 Tổng quan

API này cung cấp các endpoint để quản lý hệ thống trực nhật, bao gồm:

- **Authentication**: Đăng nhập, đăng ký, quản lý người dùng
- **Duty Management**: Quản lý lịch trực nhật
- **Notifications**: Hệ thống thông báo
- **Reports**: Báo cáo và thống kê
- **Calendar**: Lịch trực nhật theo tháng

## 🔐 Authentication

### Base URL

```
http://localhost:3000/api
```

### Headers

```http
Authorization: Bearer {token}
Content-Type: application/json
```

## 📚 API Endpoints

### 1. Authentication

#### Đăng nhập

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "admin@school.edu.vn",
  "password": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "1",
    "name": "Admin User",
    "email": "admin@school.edu.vn",
    "role": "admin"
  },
  "token": "mock-jwt-token-1-1234567890",
  "message": "Đăng nhập thành công"
}
```

#### Đăng ký

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "name": "Nguyen Van A",
  "email": "nguyenvana@student.edu.vn",
  "password": "123456",
  "role": "student",
  "class": "12A1",
  "phone": "0123456789"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "3",
    "name": "Nguyen Van A",
    "email": "nguyenvana@student.edu.vn",
    "role": "student",
    "class": "12A1",
    "phone": "0123456789"
  },
  "message": "Đăng ký thành công"
}
```

### 2. Duty Management

#### Lấy danh sách lịch trực

```http
GET /api/duties?userId=2&status=completed&shift=morning
```

**Query Parameters:**

- `userId`: ID người dùng (optional)
- `status`: Trạng thái (scheduled, completed, missed, excused)
- `shift`: Ca trực (morning, afternoon, evening)
- `date`: Ngày cụ thể (ISO string)

#### Tạo lịch trực mới

```http
POST /api/duties
```

**Request Body:**

```json
{
  "userId": "2",
  "date": "2024-01-25T07:00:00Z",
  "shift": "morning",
  "location": "Sân trường",
  "task": "Quét sân trường",
  "status": "scheduled",
  "notes": "Ghi chú nếu có"
}
```

#### Cập nhật lịch trực

```http
PUT /api/duties
```

**Request Body:**

```json
{
  "id": "1",
  "status": "completed",
  "notes": "Hoàn thành tốt"
}
```

#### Xóa lịch trực

```http
DELETE /api/duties?id=1
```

### 3. Notifications

#### Lấy danh sách thông báo

```http
GET /api/notifications?userId=2&type=reminder&isRead=false&page=1&limit=10
```

**Query Parameters:**

- `userId`: ID người dùng (optional)
- `type`: Loại thông báo (reminder, assignment, change, alert)
- `isRead`: Trạng thái đã đọc (true/false)
- `page`: Trang (default: 1)
- `limit`: Số lượng mỗi trang (default: 50)

#### Tạo thông báo mới

```http
POST /api/notifications
```

**Request Body:**

```json
{
  "userId": "2",
  "title": "Nhắc nhở trực nhật",
  "message": "Bạn có lịch trực nhật vào ngày mai",
  "type": "reminder"
}
```

#### Đánh dấu đã đọc

```http
PATCH /api/notifications
```

**Request Body:**

```json
{
  "id": "1",
  "isRead": true
}
```

### 4. Reports & Statistics

#### Lấy báo cáo thống kê

```http
GET /api/reports?userId=2&startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z&status=completed
```

**Query Parameters:**

- `userId`: ID người dùng (optional)
- `startDate`: Ngày bắt đầu (ISO string)
- `endDate`: Ngày kết thúc (ISO string)
- `status`: Trạng thái lọc
- `shift`: Ca trực lọc

#### Tạo báo cáo tùy chỉnh

```http
POST /api/reports
```

**Request Body:**

```json
{
  "reportType": "performance",
  "filters": {
    "userId": "2",
    "status": "completed"
  }
}
```

**Report Types:**

- `performance`: Báo cáo hiệu suất
- `attendance`: Báo cáo điểm danh
- `location`: Báo cáo theo địa điểm

### 5. Calendar

#### Lấy lịch theo tháng

```http
GET /api/calendar?year=2024&month=1&userId=2&status=scheduled
```

**Query Parameters:**

- `year`: Năm (4 chữ số)
- `month`: Tháng (1-12)
- `userId`: ID người dùng (optional)
- `status`: Trạng thái lọc

#### Tạo lịch trực cho tháng

```http
POST /api/calendar
```

**Request Body:**

```json
{
  "year": 2024,
  "month": 2,
  "duties": [
    {
      "userId": "2",
      "date": "2024-02-01T07:00:00Z",
      "shift": "morning",
      "location": "Sân trường",
      "task": "Quét sân trường"
    }
  ]
}
```

#### Thống kê theo tháng

```http
PATCH /api/calendar
```

**Request Body:**

```json
{
  "year": 2024,
  "month": 1,
  "userId": "2"
}
```

### 6. Health Check

#### Kiểm tra trạng thái hệ thống

```http
GET /api/health
```

#### Kiểm tra tùy chỉnh

```http
POST /api/health
```

**Request Body:**

```json
{
  "checkType": "full"
}
```

**Check Types:**

- `database`: Kiểm tra database
- `external`: Kiểm tra dịch vụ bên ngoài
- `system`: Kiểm tra hệ thống
- `full`: Kiểm tra tất cả

## 🔒 Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Mô tả lỗi",
  "details": [
    {
      "field": "email",
      "message": "Email không hợp lệ"
    }
  ]
}
```

### HTTP Status Codes

- `200`: Thành công
- `201`: Tạo thành công
- `400`: Dữ liệu không hợp lệ
- `401`: Không có quyền truy cập
- `403`: Không có quyền thực hiện
- `404`: Không tìm thấy
- `409`: Xung đột dữ liệu
- `500`: Lỗi server
- `503`: Dịch vụ không khả dụng

## 📊 Data Models

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student";
  class?: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Duty

```typescript
interface Duty {
  id: string;
  userId: string;
  user: User;
  date: Date;
  shift: "morning" | "afternoon" | "evening";
  location: string;
  task: string;
  status: "scheduled" | "completed" | "missed" | "excused";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification

```typescript
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "reminder" | "assignment" | "change" | "alert";
  isRead: boolean;
  createdAt: Date;
}
```

## 🚀 Testing

### Sử dụng cURL

#### Đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.edu.vn","password":"123456"}'
```

#### Lấy lịch trực

```bash
curl -X GET "http://localhost:3000/api/duties?userId=2" \
  -H "Authorization: Bearer mock-jwt-token-2-1234567890"
```

### Sử dụng Postman

1. Import collection từ file `postman_collection.json`
2. Set base URL: `http://localhost:3000/api`
3. Set environment variables cho token

## 📝 Notes

- Tất cả API đều trả về response với format `{ success: boolean, data?: any, error?: string }`
- Timestamps sử dụng ISO 8601 format
- Pagination bắt đầu từ trang 1
- Filtering hỗ trợ multiple parameters
- Validation sử dụng Zod schema
- Error messages bằng tiếng Việt

## 🔧 Development

### Cài đặt dependencies

```bash
npm install
```

### Chạy development server

```bash
npm run dev
```

### Build production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ:

- Email: support@school.edu.vn
- Documentation: `/api/docs`
- Health Check: `/api/health`
