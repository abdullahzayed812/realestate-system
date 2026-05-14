# 🏢 منصة برج العرب العقارية
## Real Estate Platform — Borg El Arab, Egypt

A complete production-ready real estate platform similar to Property Finder / Bayut / Airbnb.

---

## 🏗️ Architecture Overview

```
realestate/
├── apps/
│   ├── customer-mobile/        # React Native — Customer App
│   ├── broker-mobile/          # React Native — Broker/Agent App
│   └── admin-dashboard/        # React.js + Vite + Tailwind + Shadcn
│
├── services/
│   ├── auth-service/           # Port 3001 — JWT + OTP Authentication
│   ├── property-service/       # Port 3002 — Property CRUD + Search
│   ├── booking-service/        # Port 3003 — Visit & Rental Bookings
│   ├── chat-service/           # Port 3004 — Real-time Chat (Socket.IO)
│   ├── notification-service/   # Port 3005 — Firebase Push Notifications
│   └── media-service/          # Port 3006 — Cloudflare R2 Storage
│
├── shared/
│   ├── database/               # MySQL + Redis connections (Singleton)
│   ├── types/                  # Shared TypeScript interfaces
│   ├── errors/                 # AppError + typed error classes
│   ├── middlewares/            # Auth, rate limiter, validator
│   ├── response/               # ApiResponse helper
│   └── utils/                  # Logger, crypto, pagination
│
├── nginx/                      # API Gateway configuration
├── docker-compose.yml          # Full infrastructure
└── .github/workflows/ci.yml    # CI/CD Pipeline
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- Docker & Docker Compose
- Yarn >= 1.22

### 1. Clone & Install
```bash
git clone <repo>
cd realestate
yarn install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start Infrastructure
```bash
docker-compose up -d mysql redis nginx
```

### 4. Run Database Migrations
```bash
docker exec -i realestate_mysql mysql -u root -p realestate_db < shared/database/src/migrations/001_initial_schema.sql
```

### 5. Start Services (Development)
```bash
# Terminal 1: Auth Service
yarn dev:auth

# Terminal 2: Property Service
yarn dev:property

# Terminal 3: Chat Service
yarn dev:chat

# Terminal 4: Admin Dashboard
yarn dev:dashboard
```

### 6. Docker (Production)
```bash
docker-compose up -d
```

---

## 🌐 API Endpoints

### Auth Service (`:3001`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/otp/send` | Send OTP to phone |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with OTP |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/profile` | Get profile |

### Property Service (`:3002`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | Search properties (with filters) |
| GET | `/api/properties/featured` | Featured properties |
| GET | `/api/properties/:id` | Property details |
| POST | `/api/properties` | Create property (BROKER) |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |
| PATCH | `/api/properties/:id/approve` | Approve (ADMIN) |
| PATCH | `/api/properties/:id/reject` | Reject (ADMIN) |
| POST | `/api/properties/:id/favorite` | Toggle favorite |
| GET | `/api/properties/user/favorites` | My favorites |

### Chat Service (`:3004`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats` | Get user's chats |
| POST | `/api/chats` | Start a chat |
| GET | `/api/chats/:chatId/messages` | Get messages |
| WS | `socket.io` | Real-time messaging |

### Socket.IO Events
```
Client → Server:
  join_chat      { chatId }
  send_message   { chatId, type, content?, mediaUrl? }
  typing         { chatId }
  stop_typing    { chatId }
  mark_read      { chatId }

Server → Client:
  new_message      Message object
  user_typing      { chatId, userId }
  user_stop_typing { chatId, userId }
  messages_read    { chatId, readBy }
  chat_notification { chatId, message }
```

---

## 📱 Mobile Apps

### Customer App Features
- OTP Authentication (phone-based)
- Arabic RTL Support
- Browse & Search Properties
- Advanced Filters (type, price, area, location, bedrooms)
- Interactive Google Maps
- Save Favorites
- Real-time Chat with Brokers
- Book Property Visits
- Firebase Push Notifications
- Share Properties

### Broker App Features
- Add/Edit/Delete Properties
- Upload Images/Videos (Cloudflare R2)
- Manage Leads & Chat
- Booking Management
- Analytics Dashboard
- Subscription Plans
- Broker Profile

---

## 🗄️ Database Schema

18 tables with full relational integrity:
- `users` — All user accounts (customers, brokers, admins)
- `brokers` — Broker profiles
- `companies` — Real estate companies
- `properties` — Property listings
- `property_locations` — GPS coordinates + addresses
- `property_images` — Images with thumbnails
- `property_videos` — Video uploads
- `property_features` — Indoor/outdoor features
- `favorites` — User saved properties
- `chats` — Chat rooms
- `messages` — Chat messages (text/image/voice/property cards)
- `bookings` — Visit & rental bookings
- `notifications` — Push notification records
- `subscription_plans` — Broker subscription tiers
- `subscriptions` — Active broker subscriptions
- `payments` — Payment records
- `advertisements` — Banner ads management
- `reports` — User reports/complaints

---

## 🔐 Authentication Flow

```
1. User enters phone number
2. Server sends OTP via Twilio SMS
3. User enters OTP
4. Server validates OTP (6 digits, 10 min expiry, max 5 attempts)
5. Server returns: { user, accessToken (15min), refreshToken (30d) }
6. Client stores tokens in AsyncStorage/localStorage
7. Automatic token refresh via interceptor
```

---

## 📦 Property Types Supported
- شقق (Apartments)
- فيلل (Villas)
- أراضي (Land)
- مكاتب (Offices)
- محلات (Shops)
- مخازن (Warehouses)
- مصانع (Factories)
- مباني تجارية (Commercial Buildings)
- استوديو (Studio)
- دوبلكس (Duplex)
- بنتهاوس (Penthouse)

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Express.js
- **Database:** MySQL 8 (no ORM — raw SQL)
- **Cache:** Redis 7
- **Real-time:** Socket.IO
- **Auth:** JWT (access + refresh) + OTP
- **Storage:** Cloudflare R2 (S3-compatible)
- **Images:** Sharp (WebP optimization)
- **Notifications:** Firebase Admin SDK
- **SMS:** Twilio

### Frontend
- **Admin Dashboard:** React 18 + Vite + TypeScript + TailwindCSS + Shadcn UI
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod

### Mobile Apps
- **Framework:** React Native CLI 0.74
- **Navigation:** React Navigation v6
- **Data Fetching:** TanStack Query
- **HTTP Client:** Axios
- **Forms:** React Hook Form
- **State:** Zustand + AsyncStorage
- **Maps:** React Native Maps (Google Maps)

---

## 🚢 Deployment

### Docker Compose (Recommended)
```bash
# Production
docker-compose -f docker-compose.yml up -d

# With SSL (update nginx/nginx.conf)
docker-compose up -d nginx
```

### Environment Variables
All services require `.env` files. Copy `.env.example` for each service.

---

## 📞 Support

Platform built for: **Borg El Arab, Alexandria, Egypt**

Features Arabic RTL support throughout all interfaces.
