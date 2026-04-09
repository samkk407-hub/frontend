# Photocopy Backend API Testing Guide

## Start Server

```bash
cd c:\Users\sandy2025\Desktop\photocopy\backend
npm install
npm run dev
```

Base URL:
```
http://localhost:5000
```

---

## 1) Admin APIs

### Register admin
POST `/api/admin/register`

Body:
```json
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Login admin
POST `/api/admin/login`

Body:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response contains `token`.

### Get all shops
GET `/api/admin/shops`

Headers:
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

### Get all customers
GET `/api/admin/customers`

Headers:
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

### Get all orders
GET `/api/admin/orders`

Headers:
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

---

## 2) Shop APIs

### Register shop
POST `/api/shop/register`

Body:
```json
{
  "shopName": "Speed Copy",
  "email": "shop1@example.com",
  "phone": "9999000011",
  "password": "shop123"
}
```

### Login shop
POST `/api/shop/login`

Body:
```json
{
  "email": "shop1@example.com",
  "password": "shop123"
}
```

Response contains `token` and shop status.

### Shop dashboard
GET `/api/shop/dashboard`

Headers:
```
Authorization: Bearer SHOP_JWT_TOKEN
```

---

## 3) Customer APIs

### Register customer
POST `/api/customer/register`

Body:
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "phone": "8888000011"
}
```

### Login customer
POST `/api/customer/login`

Body:
```json
{
  "phone": "8888000011"
}
```

Response contains `token`.

### Customer profile
GET `/api/customer/profile`

Headers:
```
Authorization: Bearer CUSTOMER_JWT_TOKEN
```

---

## 4) Order APIs

### Create order
POST `/api/order/create`

Body:
```json
{
  "shopId": "SHOP_OBJECT_ID",
  "customerName": "Ravi Kumar",
  "customerPhone": "8888000011",
  "documentUrl": "https://example.com/doc.pdf",
  "printType": "portrait",
  "colorMode": "bw"
}
```

Response:
```json
{
  "message": "Order created successfully",
  "orderId": "ORDER_ID",
  "otp": "1234"
}
```

### Get shop orders
GET `/api/order/shop/SHOP_OBJECT_ID`

Headers:
```
Authorization: Bearer SHOP_JWT_TOKEN
```

### Shop dashboard stats
GET `/api/order/shop/SHOP_OBJECT_ID/dashboard`

Headers:
```
Authorization: Bearer SHOP_JWT_TOKEN
```

Returns:
```json
{
  "stats": {
    "totalOrders": 1,
    "waitingOrders": 1,
    "confirmedOrders": 0,
    "printingOrders": 0,
    "doneOrders": 0
  }
}
```

### Verify OTP
POST `/api/order/verify-otp`

Headers:
```
Authorization: Bearer SHOP_JWT_TOKEN
```

Body:
```json
{
  "shopId": "SHOP_OBJECT_ID",
  "otp": "1234"
}
```

Response:
```json
{
  "message": "OTP verified",
  "orderId": "ORDER_ID",
  "documentUrl": "https://example.com/doc.pdf",
  "printType": "portrait",
  "colorMode": "bw",
  "status": "confirmed"
}
```

---

## 5) Shop detail fields for later update

Example shop extra details:
```json
{
  "address": {
    "street": "12 Main Road",
    "city": "Lucknow",
    "state": "Uttar Pradesh",
    "zip": "226001",
    "country": "India"
  },
  "location": {
    "type": "Point",
    "coordinates": [80.9462, 26.8467]
  },
  "rating": 4.5,
  "reviewCount": 120,
  "printRates": {
    "bw": 5,
    "color": 15
  },
  "services": ["photocopy", "scan", "lamination"],
  "openHours": "09:00 - 20:00"
}
```

---

## 6) Socket.IO test

Use a client to connect and join shop room:

```js
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");
socket.emit("join-shop", "SHOP_OBJECT_ID");
socket.on("new-order", (data) => console.log("new-order", data));
socket.on("order-stats", (data) => console.log("order-stats", data));
```

This will show order count updates in real time.
