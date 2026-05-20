# CampaignOS — Bulk Email Campaign System

An enterprise-grade bulk email campaign management platform built with **Spring Boot**, **React**, and **MySQL**, fully containerised with Docker Compose.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Docker Commands](#docker-commands)
- [Configuration](#configuration)
- [Default Credentials](#default-credentials)
- [CSV Import Format](#csv-import-format)
- [Project Structure](#project-structure)

---

## Overview

CampaignOS lets you create, schedule, and send bulk email campaigns to a managed list of recipients. It features:

- JWT-based authentication with role-based access control (ADMIN / USER)
- Campaign lifecycle management: Draft → Scheduled → Executing → Completed / Failed
- Automatic campaign execution via a background scheduler (runs every 60 seconds)
- Bulk recipient import via CSV upload
- Per-email delivery logs with success/failure tracking
- Real-time dashboard with campaign stats and subscription metrics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.2.5, Java 17 |
| Security | Spring Security, JWT (jjwt 0.11.5) |
| Persistence | Spring Data JPA, Hibernate, MySQL 8 |
| Email | Spring Mail (JavaMailSender), Gmail SMTP |
| CSV Parsing | OpenCSV 5.9 |
| Frontend | React 18, Vite, Tailwind CSS |
| HTTP Client | Axios (centralised instance with interceptors) |
| Containerisation | Docker, Docker Compose |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Compose                       │
│                                                         │
│  ┌───────────────┐    ┌───────────────┐    ┌──────────┐ │
│  │   Frontend    │    │   Backend     │    │  MySQL   │ │
│  │  React/Vite   │───▶│ Spring Boot   │───▶│  DB :3306│ │
│  │  :5173        │    │  :8080        │    │          │ │
│  └───────────────┘    └──────┬────────┘    └──────────┘ │
│                              │                          │
│                    ┌─────────▼─────────┐                │
│                    │  Campaign Scheduler│                │
│                    │  (every 60s)       │                │
│                    └───────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

### Backend Layer Architecture

The Spring Boot backend follows a strict three-layer pattern, ensuring separation of concerns:

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────────┐
│  Controller Layer  (@RestController)             │
│  AuthController · CampaignController             │
│  RecipientController                             │
│  • Handles HTTP, validates input, maps DTOs      │
│  • No business logic                            │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  Service Layer  (@Service)                       │
│  AuthService · CampaignService                   │
│  RecipientService · EmailService                 │
│  • All business logic lives here                 │
│  • Orchestrates repositories, sends emails       │
│  • Manages campaign status transitions           │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  Repository Layer  (Spring Data JPA)             │
│  UserRepository · CampaignRepository             │
│  RecipientRepository · DeliveryLogRepository     │
│  • Interface only — Spring generates SQL         │
│  • Talks directly to MySQL                       │
└─────────────────────────────────────────────────┘
```

### JWT Authentication Flow

```
Client                          Backend
  │                                │
  │  POST /api/v1/auth/login        │
  │  { email, password }           │
  │──────────────────────────────▶ │
  │                                │  Verify credentials (BCrypt)
  │                                │  Generate signed JWT
  │                                │  (sub: email, role, exp: 1hr)
  │  { token: "eyJ..." }           │
  │ ◀────────────────────────────── │
  │                                │
  │  Any protected request         │
  │  Authorization: Bearer eyJ...  │
  │──────────────────────────────▶ │
  │                                │  JwtAuthenticationFilter validates
  │                                │  token, loads user into SecurityContext
  │  200 OK / 403 Forbidden        │
  │ ◀────────────────────────────── │
```

### Campaign Lifecycle

```
  [Create]
     │
     ▼
  DRAFT ──────────────────────────────────────────────────┐
     │                                                    │
     │  POST /{id}/schedule                               │
     ▼                                                    │
  SCHEDULED ◀──── Scheduler polls every 60s              │
     │            finds campaigns where                   │
     │            scheduledTime <= now                    │
     │  Auto-trigger / POST /{id}/execute                 │
     ▼                                                    │
  EXECUTING                                               │
     │                                                    │
     ├── Send email to each SUBSCRIBED recipient          │
     │   └── Write DeliveryLog (SENT / FAILED)            │
     │                                                    │
     ├── All done ──▶  COMPLETED                          │
     │                                                    │
     └── Exception ──▶ FAILED ──────────────────────────▶┘
                                                (can retry)
```

---

## Database Design

The system uses four tables. Hibernate auto-creates them on first boot (`ddl-auto: update`).

### `user`

Stores registered users with hashed passwords.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(255) | NOT NULL | Full name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login identifier |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed |
| `role` | ENUM | NOT NULL | `ADMIN` or `USER` |
| `enabled` | BOOLEAN | DEFAULT true | Account active flag |

---

### `campaigns`

Holds all campaign metadata and lifecycle state.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `campaign_name` | VARCHAR(255) | NOT NULL | Display name |
| `subject_line` | VARCHAR(500) | NOT NULL | Email subject |
| `email_content` | TEXT | NOT NULL | HTML or plain-text body |
| `scheduled_time` | DATETIME | NOT NULL | When to trigger execution |
| `status` | ENUM | NOT NULL, DEFAULT `DRAFT` | `DRAFT` · `SCHEDULED` · `EXECUTING` · `COMPLETED` · `FAILED` |
| `created_at` | DATETIME | NOT NULL, auto-set | Set on insert |
| `updated_at` | DATETIME | NOT NULL, auto-set | Updated on every save |

---

### `recipients`

Email contacts that campaigns are sent to.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(255) | NOT NULL | Contact name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Unique constraint `uk_recipient_email` |
| `subscription_status` | ENUM | NOT NULL, DEFAULT `SUBSCRIBED` | `SUBSCRIBED` or `UNSUBSCRIBED` |
| `created_at` | DATETIME | NOT NULL, auto-set | Set on insert |
| `updated_at` | DATETIME | NOT NULL, auto-set | Updated on every save |

> Only recipients with `subscription_status = SUBSCRIBED` receive emails when a campaign executes.

---

### `delivery_logs`

Audit trail for every individual email send attempt.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `campaign_id` | BIGINT | FK → `campaigns.id`, NOT NULL | Indexed: `idx_delivery_campaign_id` |
| `recipient_email` | VARCHAR(255) | NOT NULL | Indexed: `idx_delivery_recipient_email` |
| `recipient_name` | VARCHAR(255) | — | Snapshot of name at send time |
| `status` | ENUM | NOT NULL | `SENT` or `FAILED` |
| `failure_reason` | TEXT | — | SMTP error message if failed |
| `sent_at` | DATETIME | NOT NULL, auto-set | Timestamp of delivery attempt |

**Relationships:**
```
user         (1) ──────── (many)  — no direct FK, auth only
campaigns    (1) ──────── (many)  delivery_logs
recipients   — independent, emails matched by value at send time
```

---

## API Reference

All endpoints are prefixed with `/api/v1`. Protected endpoints require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive JWT |

**Login request body:**
```json
{
  "email": "admin@gmail.com",
  "password": "Admin@123"
}
```

**Login response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

### Campaigns

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/campaigns` | Any user | List all campaigns |
| GET | `/campaigns/{id}` | Any user | Get campaign by ID |
| POST | `/campaigns` | ADMIN only | Create a new campaign |
| PUT | `/campaigns/{id}` | ADMIN only | Update a campaign |
| DELETE | `/campaigns/{id}` | ADMIN only | Delete a campaign |
| POST | `/campaigns/{id}/schedule` | ADMIN only | Mark campaign as SCHEDULED |
| POST | `/campaigns/{id}/execute` | ADMIN only | Trigger immediate execution |
| GET | `/campaigns/{id}/delivery-logs` | Any user | Get delivery logs for a campaign |

**Create/Update campaign body:**
```json
{
  "campaignName": "Summer Sale 2025",
  "subjectLine": "Exclusive offer just for you!",
  "emailContent": "<h1>Hello!</h1><p>Check out our sale.</p>",
  "scheduledTime": "2025-08-01T09:00:00"
}
```

---

### Recipients

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/recipients` | Any user | List all recipients |
| GET | `/recipients/{id}` | Any user | Get recipient by ID |
| GET | `/recipients/stats` | Any user | Get total and subscribed counts |
| POST | `/recipients/upload` | Any user | Upload CSV file (multipart/form-data) |
| PATCH | `/recipients/{id}/unsubscribe` | ADMIN only | Unsubscribe a recipient |
| PATCH | `/recipients/{id}/resubscribe` | ADMIN only | Resubscribe a recipient |
| DELETE | `/recipients/{id}` | ADMIN only | Delete a recipient |

**All responses use a standard wrapper:**
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "data": { ... }
}
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### Clone and Run

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd <project-folder>

# 2. Start all three services (MySQL + Backend + Frontend)
docker compose up --build

# 3. Open the app
# Frontend:  http://localhost:5173
# Backend:   http://localhost:8080
```

That's it. Docker Compose handles everything — MySQL starts first with a health check, the backend waits until MySQL is ready, and the frontend starts after the backend.

---

## Docker Commands

### Starting and Stopping

```bash
# Start all services (build images first time)
docker compose up --build

# Start in background (detached mode)
docker compose up --build -d

# Stop all services
docker compose down

# Stop and delete all data volumes (full reset)
docker compose down -v
```

### Rebuilding

```bash
# Rebuild only the backend (after Java code changes)
docker compose build backend
docker compose up -d backend

# Rebuild only the frontend (after React code changes)
docker compose build frontend
docker compose up -d frontend

# Force rebuild all images from scratch (no cache)
docker compose build --no-cache
docker compose up
```

### Logs

```bash
# View logs from all services
docker compose logs

# Follow logs in real time
docker compose logs -f

# View logs from a specific service only
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

### Container Access

```bash
# Open a shell inside the backend container
docker exec -it email-backend bash

# Open a shell inside the frontend container
docker exec -it email-frontend sh

# Connect to MySQL inside its container
docker exec -it email-mysql mysql -u root -proot bulk_email_campaign
```

### Useful MySQL Queries (inside container)

```sql
-- Check all users
SELECT id, name, email, role FROM user;

-- Check campaign statuses
SELECT id, campaign_name, status, scheduled_time FROM campaigns;

-- Check delivery summary per campaign
SELECT campaign_id, status, COUNT(*) as count
FROM delivery_logs
GROUP BY campaign_id, status;

-- Check recipient subscription stats
SELECT subscription_status, COUNT(*) as count
FROM recipients
GROUP BY subscription_status;
```

### Status and Cleanup

```bash
# Check which containers are running
docker compose ps

# Check container resource usage
docker stats

# Remove stopped containers, unused images, and build cache
docker system prune

# Remove everything including volumes (full wipe)
docker system prune -a --volumes
```

---

## Configuration

All configuration lives in `bulk-email-campaign-system/src/main/resources/application.yaml`.

### Gmail SMTP Setup

The system uses Gmail SMTP to send emails. You need a **Gmail App Password** (not your regular password):

1. Go to your Google account → Security → 2-Step Verification (must be enabled)
2. Go to Security → App passwords
3. Generate a new app password for "Mail"
4. Paste it into the config below

Update these values in `application.yaml`:

```yaml
spring:
  mail:
    username: your-email@gmail.com
    password: xxxx xxxx xxxx xxxx   # 16-character app password

app:
  mail:
    from: your-email@gmail.com
    from-name: Campaign Manager
```

### Environment Variables (Docker override)

These can be passed to the backend container in `docker-compose.yml` to override `application.yaml` without modifying the file:

```yaml
environment:
  SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/bulk_email_campaign?createDatabaseIfNotExist=true&serverTimezone=UTC
  SPRING_DATASOURCE_USERNAME: root
  SPRING_DATASOURCE_PASSWORD: root
  SPRING_MAIL_USERNAME: your-email@gmail.com
  SPRING_MAIL_PASSWORD: your-app-password
```

### Port Mapping

| Service | Container Port | Host Port |
|---|---|---|
| Frontend | 5173 | 5173 |
| Backend | 8080 | 8080 |
| MySQL | 3306 | 3307 |

> MySQL is mapped to **3307** on the host to avoid conflicts with a locally installed MySQL. Inside Docker, services communicate on port 3306 using the service name `mysql` as the hostname.

---

## Default Credentials

A default admin account is created automatically on first boot by `DataInitializer.java`:

| Field | Value |
|---|---|
| Email | `admin@gmail.com` |
| Password | `Admin@123` |
| Role | ADMIN |

> Change these credentials before deploying to any public environment.

The JWT token expires after **1 hour**. After expiry, the interceptor automatically redirects to the login page.

---

## CSV Import Format

Upload a `.csv` file with the following columns to bulk-import recipients:

```csv
name,email,subscription_status
Alice Johnson,alice@example.com,SUBSCRIBED
Bob Smith,bob@example.com,SUBSCRIBED
Carol White,carol@example.com,UNSUBSCRIBED
```

**Rules:**
- `name` and `email` are required
- `subscription_status` is optional — defaults to `SUBSCRIBED` if omitted
- Duplicate emails are silently skipped (unique constraint on `email`)
- Maximum file size: **10MB**
- The response includes `successCount` and `failedCount`

A sample file is included at `resources/sample-recipients.csv`.

---

## Project Structure

```
project-root/
├── docker-compose.yml                  # Orchestrates all three services
├── resources/
│   └── sample-recipients.csv          # Sample CSV for testing import
│
├── bulk-email-campaign-system/        # Spring Boot Backend
│   ├── Dockerfile                     # Multi-stage build (Maven → JRE)
│   └── src/main/java/com/enterprise/emailcampaign/
│       ├── config/                    # CORS, Security, Web config
│       ├── controller/                # REST endpoints (Auth, Campaign, Recipient)
│       ├── model/
│       │   ├── dto/                   # Request/Response DTOs
│       │   │   ├── request/           # CampaignRequest, LoginRequest, RegisterRequest
│       │   │   └── response/          # ApiResponse, CampaignResponse, DeliveryLogResponse
│       │   ├── entity/                # JPA entities (User, Campaign, Recipient, DeliveryLog)
│       │   └── enums/                 # CampaignStatus, DeliveryStatus, Role, SubscriptionStatus
│       ├── repository/                # Spring Data JPA interfaces
│       ├── scheduler/                 # CampaignScheduler (runs every 60s)
│       ├── security/                  # JwtService, JwtAuthFilter, DataInitializer
│       ├── service/                   # Business logic interfaces + implementations
│       └── util/                      # CampaignMapper, EmailValidator
│
└── email-campaign/                    # React Frontend
    ├── Dockerfile                     # Node 20, npm install, vite dev --host
    └── src/
        ├── api/
        │   └── api.js                 # Axios instance with JWT + 401 interceptors
        ├── context/
        │   └── AuthContext.jsx        # Global auth state (user, token, login, logout)
        ├── hooks/
        │   └── useApi.js              # Reusable loading/error wrapper for API calls
        ├── services/
        │   ├── authService.js         # login(), register()
        │   ├── campaignService.js     # Full campaign CRUD + schedule/execute/logs
        │   └── recipientService.js    # Recipient management + CSV upload
        ├── components/
        │   ├── ui/                    # Button, Card, Input, Badge, Skeleton, StatCard, EmptyState
        │   ├── Navbar.jsx             # Sticky nav with active links and logout
        │   ├── Layout.jsx             # Page wrapper with Navbar
        │   ├── CampaignForm.jsx       # Create/Edit form with validation
        │   ├── CampaignList.jsx       # Campaign cards with all actions
        │   ├── RecipientList.jsx      # Recipient rows with subscribe toggle
        │   ├── CsvUpload.jsx          # Drag-and-drop CSV uploader
        │   └── DeliveryLogsPanel.jsx  # Per-campaign delivery log viewer
        ├── pages/
        │   ├── Login.jsx              # Login + Register tabs
        │   ├── Dashboard.jsx          # Stats, recent campaigns, status breakdown
        │   ├── Campaigns.jsx          # Full campaign management with search + filter
        │   └── Recipients.jsx         # Recipient management with stats bar
        └── routes/
            └── ProtectedRoute.jsx     # Redirects to / if no token
```

---

## Known Limitations and Future Improvements

| Area | Current Behaviour | Improvement |
|---|---|---|
| Scheduling | In-memory `@Scheduled` — misses executions if server is down | Replace with Quartz Scheduler or ShedLock for distributed, persistent scheduling |
| Pagination | All records loaded at once | Add Spring Data `Pageable` on backend + infinite scroll on frontend |
| Email delivery | Synchronous — blocks the scheduler thread | Push to a message queue (RabbitMQ / Kafka) for async retry |
| JWT | Expires in 1hr, user gets logged out | Add refresh token flow |
| JWT secret | Hardcoded string in `JwtService.java` | Move to environment variable |
| Tests | No unit or integration tests | Add JUnit tests for service layer; Testcontainers for repository layer |
| CORS | Allows all origins | Restrict to frontend origin in production |