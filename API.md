# Matola Logistics Platform - API Documentation

## Overview

The Matola Logistics Platform API uses JWT for authentication and follows REST conventions.

## Authentication

### Register

**POST** `/api/auth/register`

Register a new user account.

```json
{
  "phone": "+265123456789",
  "name": "John Doe",
  "email": "john@example.com",
  "pin": "1234",
  "role": "shipper|transporter|broker",
  "preferredLanguage": "en|ny"
}
```

Response: `201 Created`
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "phone": "+265123456789",
    "role": "shipper"
  },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### Login

**POST** `/api/auth/login`

Login with phone and PIN.

```json
{
  "phone": "+265123456789",
  "pin": "1234"
}
```

Response: `200 OK`
```json
{
  "success": true,
  "user": { ... },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### Refresh Token

**POST** `/api/auth/refresh`

Get a new access token using refresh token.

```json
{
  "refreshToken": "refresh_token_here"
}
```

Response: `200 OK`
```json
{
  "success": true,
  "accessToken": "new_jwt_token_here"
}
```

### Logout

**POST** `/api/auth/logout`

Logout and invalidate tokens.

Response: `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Send OTP

**POST** `/api/auth/send-otp`

Send OTP code to phone number.

```json
{
  "phone": "+265123456789"
}
```

Response: `200 OK`
```json
{
  "message": "OTP sent successfully",
  "phone": "+265****6789"
}
```

### Verify OTP

**POST** `/api/auth/verify`

Verify OTP code and login.

```json
{
  "phone": "+265123456789",
  "otp": "123456"
}
```

Response: `200 OK`
```json
{
  "success": true,
  "user": { ... },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

## Shipments

All endpoints require `Authorization: Bearer <accessToken>` header.

### List Shipments

**GET** `/api/shipments?status=posted&limit=20&offset=0`

List shipments (filtered by user role).

Query Parameters:
- `status` - Filter by status (draft, posted, matched, in_transit, completed, cancelled)
- `originCity` - Filter by pickup location
- `destinationCity` - Filter by destination
- `cargoType` - Filter by cargo type
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset (default: 0)

Response: `200 OK`
```json
{
  "shipments": [
    {
      "id": "shipment_123",
      "reference": "MAT20250101001",
      "description": "Electronics shipment",
      "cargoType": "electronics",
      "weight": 50,
      "status": "posted",
      "originCity": "Lilongwe",
      "destinationCity": "Blantyre",
      "pickupDate": "2025-01-05T08:00:00Z",
      "price": 25000
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Create Shipment

**POST** `/api/shipments`

Create a new shipment (shipper only).

```json
{
  "description": "Electronics shipment",
  "cargoType": "electronics",
  "weight": 50,
  "estimatedValue": 500000,
  "pickupLocation": "Lilongwe",
  "deliveryLocation": "Blantyre",
  "pickupDate": "2025-01-05T08:00:00Z",
  "deliveryDate": "2025-01-06T18:00:00Z"
}
```

Response: `201 Created`
```json
{
  "success": true,
  "shipment": {
    "id": "shipment_123",
    "reference": "MAT20250101001",
    ...
  }
}
```

### Get Shipment

**GET** `/api/shipments/{id}`

Get shipment details.

Response: `200 OK`
```json
{
  "shipment": { ... }
}
```

## Payments

### Initiate Payment

**POST** `/api/payments`

Initiate payment for a shipment.

```json
{
  "shipmentId": "shipment_123",
  "amount": 25000,
  "method": "airtel_money|tnm_mpamba|cash|bank_transfer",
  "phoneNumber": "+265123456789"
}
```

Response: `201 Created`
```json
{
  "success": true,
  "transaction": {
    "id": "txn_123",
    "status": "pending",
    "amount": 25000,
    "method": "airtel_money"
  },
  "ussdPrompt": "*787# → Send Money → ...",
  "instructions": "Dial the USSD code above to complete payment."
}
```

### Get Payments

**GET** `/api/payments?shipmentId=shipment_123&limit=20&offset=0`

List payment transactions.

Response: `200 OK`
```json
{
  "transactions": [ ... ],
  "pagination": { ... }
}
```

## Notifications

### List Notifications

**GET** `/api/notifications/list?limit=20&offset=0`

List user notifications.

Response: `200 OK`
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "match_found",
      "title": "New Load Available",
      "message": "Load from Lilongwe to Blantyre",
      "read": false,
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Mark as Read

**POST** `/api/notifications/{id}/read`

Mark notification as read.

Response: `200 OK`
```json
{
  "success": true,
  "notification": { ... }
}
```

### Mark All as Read

**POST** `/api/notifications/read-all`

Mark all notifications as read.

Response: `200 OK`
```json
{
  "success": true,
  "count": 5
}
```

## Health & Status

### Health Check

**GET** `/api/health`

Get application health status.

Response: `200 OK` (or `503` if unhealthy)
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2025-01-01T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": { "status": "up", "responseTime": 5 },
    "redis": { "status": "up", "responseTime": 2 },
    "api": { "status": "up" }
  },
  "metrics": {
    "uptime": 3600,
    "memory": { ... }
  }
}
```

### Readiness Check

**GET** `/api/health/ready`

Check if services are ready to handle requests.

Response: `200 OK` (or `503` if not ready)
```json
{
  "status": "ready|not_ready",
  "timestamp": "2025-01-01T10:00:00Z",
  "checks": [
    { "name": "database", "status": "healthy", "latency": 5 },
    { "name": "redis", "status": "healthy", "latency": 2 }
  ]
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... },
  "requestId": "req_123456"
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400) - Invalid request data
- `MISSING_TOKEN` (401) - Missing authentication token
- `INVALID_TOKEN` (401) - Invalid or expired token
- `INSUFFICIENT_PERMISSIONS` (403) - User lacks required role
- `NOT_FOUND` (404) - Resource not found
- `ALREADY_EXISTS` (409) - Resource already exists
- `RATE_LIMITED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

## Rate Limiting

Rate limits are applied per IP address:

- Authentication endpoints: 5 requests/minute
- General API endpoints: 60 requests/minute
- Payment endpoints: 10 requests/minute

Response headers include rate limit info:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1704110460
Retry-After: 60
```

## CORS

CORS is enabled for configured origins only. See `.env.example` for `ALLOWED_ORIGINS`.

## Webhooks

### Payment Webhooks

Airtel Money and TNM send webhook notifications for payment status updates.

**Endpoint:** `POST /api/payments/webhook/airtel` or `/api/payments/webhook/tnm`

**Headers:**
```
x-airtel-signature: <HMAC-SHA256 signature>
x-tnm-signature: <HMAC-SHA256 signature>
```

**Payload:**
```json
{
  "reference": "AM20250101001",
  "transaction": {
    "id": "txn_ext_123",
    "status_code": "TS",
    "amount": 25000,
    "timestamp": "2025-01-01T10:00:00Z"
  }
}
```

Status codes:
- `TS` - Transaction succeeded
- `TF` - Transaction failed
- `TP` - Transaction pending
- `TIP` - Transaction in progress

## SDKs & Libraries

JavaScript/TypeScript client SDK (coming soon)

```javascript
import { MatolaClient } from "@matola/client"

const client = new MatolaClient({
  baseUrl: "https://api.matola.mw",
  apiKey: "pk_live_...",
})

// Register
const { user, accessToken } = await client.auth.register({
  phone: "+265123456789",
  name: "John Doe",
  pin: "1234",
})

// Create shipment
const shipment = await client.shipments.create({
  cargoType: "electronics",
  weight: 50,
  pickupLocation: "Lilongwe",
  deliveryLocation: "Blantyre",
})
```

---

**Version:** 1.0.0  
**Last Updated:** Jan 1, 2025  
**Status:** Production Ready
