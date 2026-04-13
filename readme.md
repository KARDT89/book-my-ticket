# Book My Ticket

A simplified movie seat booking backend with JWT authentication, built on top of the ChaiCode starter codebase.

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

Copy `.env.example` to `.env` and fill in the values:

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

# Email (for verification & password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

### Database Setup

Run the schema file to create the tables:

```bash
psql -U postgres -d book_my_ticket -f src/common/db/schema.sql
```

The seats table is pre-seeded with 20 seats via:

```sql
INSERT INTO seats (isbooked) SELECT 0 FROM generate_series(1, 20);
```

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
│   ├── middleware/      # Validation middleware
│   └── utils/          # JWT, password, API response/error helpers
└── modules/
    └── auth/
        ├── dto/        # Request validation schemas
        ├── controller.js
        ├── middleware.js   # authenticate middleware
        ├── routes.js
        └── services.js
index.mjs               # Entry point (starter code + auth integration)
```

---

## API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint                          | Auth Required | Description               |
| ------ | --------------------------------- | ------------- | ------------------------- |
| POST   | `/api/auth/register`              | No            | Register a new user       |
| POST   | `/api/auth/login`                 | No            | Login and receive tokens  |
| POST   | `/api/auth/logout`                | Yes           | Logout and clear tokens   |
| POST   | `/api/auth/refresh`               | No            | Get new access token      |
| GET    | `/api/auth/verify-email/:token`   | No            | Verify email address      |
| POST   | `/api/auth/forgot-password`       | No            | Send password reset email |
| POST   | `/api/auth/reset-password/:token` | No            | Reset password            |

### Booking Routes (Starter Code — Protected)

| Method | Endpoint     | Auth Required | Description       |
| ------ | ------------ | ------------- | ----------------- |
| GET    | `/seats`     | Yes           | Get all seats     |
| PUT    | `/:id/:name` | Yes           | Book a seat by ID |

---

## Auth Flow

```
Register → verify email → Login → receive accessToken + refreshToken
                                        ↓
                             use accessToken in requests
                             (Bearer header or cookie)
                                        ↓
                             accessToken expires → POST /api/auth/refresh
```

### Token Delivery

Tokens are set as `httpOnly` cookies on login. For API clients (Postman etc.), tokens are also returned in the response body and can be passed as a `Bearer` token in the `Authorization` header.

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

### Book a Seat

```
PUT /3/tamal
Authorization: Bearer <accessToken>
```

---

## Key Implementation Notes

- Authentication uses JWT — short-lived access token (15m) + long-lived refresh token (7d)
- Refresh token is stored in the database and cleared on logout
- `authenticate` middleware checks cookies first, then falls back to `Authorization` header
- Seat booking uses PostgreSQL transactions with `FOR UPDATE` to prevent double booking
- Passwords are hashed with bcrypt
- Email verification and password reset use hashed one-time tokens
