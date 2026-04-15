# Book My Ticket

A simplified movie seat booking backend with JWT authentication, built on top of the [ChaiCode starter codebase](https://github.com/chaicodehq/book-my-ticket).

---

## What I Built

The starter code already had seat listing and booking endpoints. My job was to extend it with:

- User registration and login
- JWT-based authentication (access + refresh tokens)
- `authenticate` middleware to protect booking routes
- Bookings associated with the logged-in user
- Duplicate seat booking prevention (via SQL transactions + `FOR UPDATE`)

> Email verification is implemented but disabled for demo purposes — users are auto-verified on registration so the evaluator can test the flow without SMTP setup.

---

## Setup

### Prerequisites

- Node.js v18+
- PostgreSQL

### Installation

```bash
git clone <your-repo-url>
cd book-my-ticket
npm install
```

### Environment Variables

```bash
cp env.example .env
```

```env
PORT=8080

# Database
DB_HOST=localhost
DB_PORT=5431
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=book_my_ticket

# JWT
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Email (implemented but disabled for demo)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

### Database Setup

```bash
psql -U postgres -d book_my_ticket -f src/common/db/schema.sql
```

This creates the `users` and `seats` tables and pre-seeds 20 seats.

### Start the Server

```bash
node index.mjs
```

Server runs on `http://localhost:8080`

---

## Project Structure

```
src/
├── common/
│   ├── config/         # Email config
│   ├── db/             # DB connection + schema
│   ├── dto/            # Base DTO
│   ├── middleware/     # Validation middleware
│   └── utils/          # JWT, password, API response/error helpers
└── modules/
    └── auth/
        ├── dto/        # Request validation schemas
        ├── controller.js
        ├── middleware.js   # authenticate middleware
        ├── routes.js
        └── services.js
index.mjs               # Entry point — starter code + auth integration
```

---

## Auth Flow

```
Register → auto-verified → Login → receive accessToken + refreshToken
                                            ↓
                                 use token in requests
                                 (cookie or Bearer header)
                                            ↓
                                 accessToken expires (15m)
                                            ↓
                                 POST /api/auth/refresh → new accessToken
```

Tokens are set as `httpOnly` cookies on login. For API clients (Postman etc.), tokens are also returned in the response body and can be passed via `Authorization: Bearer <token>`.

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint                          | Auth Required | Description              |
| ------ | --------------------------------- | ------------- | ------------------------ |
| POST   | `/api/auth/register`              | No            | Register a new user      |
| POST   | `/api/auth/login`                 | No            | Login, receive tokens    |
| POST   | `/api/auth/logout`                | Yes           | Logout, clear tokens     |
| POST   | `/api/auth/refresh`               | No            | Get new access token     |
| POST   | `/api/auth/forgot-password`       | No            | Send password reset email|
| POST   | `/api/auth/reset-password/:token` | No            | Reset password           |

### Booking (Starter Code — Protected)

| Method | Endpoint     | Auth Required | Description              |
| ------ | ------------ | ------------- | ------------------------ |
| GET    | `/seats`     | Yes           | Get all seats            |
| PUT    | `/:id/:name` | Yes           | Book a seat by ID        |

---

## Request Examples

### Register

```json
POST /api/auth/register
{
  "name": "Tamal",
  "email": "tamal@example.com",
  "password": "Securepassword@123"
}
```

### Login

```json
POST /api/auth/login
{
  "email": "tamal@example.com",
  "password": "Securepassword@123"
}
```

### Get All Seats

```
GET /seats
Authorization: Bearer <accessToken>
```

### Book a Seat

```
PUT /3/tamal
Authorization: Bearer <accessToken>
```

Trying to book an already-booked seat returns:
```json
{ "error": "Seat already booked" }
```

---

## Key Implementation Notes

- **Raw SQL** used intentionally — this is a SQL class follow-up assignment
- **JWT** — short-lived access token (15m) + long-lived refresh token (7d)
- **Refresh token** is hashed before storing in DB, cleared on logout
- **`authenticate` middleware** checks cookies first, falls back to `Authorization` header
- **Seat booking** uses PostgreSQL transactions with `FOR UPDATE` to prevent race conditions and double booking
- **Passwords** hashed with bcrypt
- **Email verification + password reset** implemented with hashed one-time tokens (email disabled for demo)