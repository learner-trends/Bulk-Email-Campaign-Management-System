# 📧 Bulk Email Campaign Management System

An enterprise-grade Spring Boot application for creating, scheduling, and tracking bulk email campaigns. Built with clean architecture principles: layered design, separation of concerns, transactional safety, and a full audit log for every delivery attempt.

---

## 🏗 Architectural Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│  ┌────────────────────┐  ┌─────────────────────────────┐│
│  │  WebController     │  │  REST Controllers            ││
│  │  (Thymeleaf UI)    │  │  CampaignController          ││
│  └────────┬───────────┘  │  RecipientController         ││
│           │              └──────────────┬───────────────┘│
└───────────┼─────────────────────────────┼────────────────┘
            │                             │
┌───────────▼─────────────────────────────▼────────────────┐
│                    Service Layer                          │
│  CampaignService  │  RecipientService  │  EmailService   │
│  (Business Logic) │  (CSV Import)      │  (SMTP)         │
└───────────┬───────────────┬─────────────────┬────────────┘
            │               │                 │
┌───────────▼───────────────▼─────────────────▼────────────┐
│                  Repository Layer (JPA)                   │
│  CampaignRepository │ RecipientRepository │ DeliveryLog  │
└───────────────────────────────┬──────────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │    MYSQL Database      │
                    └────────────────────────┘
```

### Scheduler
A background `@Scheduled` component polls every 60 seconds for `SCHEDULED` campaigns whose time has arrived and triggers execution automatically.

---

## 🗄 Database Design

### Table: `campaigns`
| Column          | Type     | Notes                           |
|-----------------|----------|---------------------------------|
| id              | INTEGER  | PK, auto-increment              |
| campaign_name   | TEXT     | NOT NULL                        |
| subject_line    | TEXT     | NOT NULL                        |
| email_content   | TEXT     | HTML content                    |
| scheduled_time  | DATETIME | When to send                    |
| status          | TEXT     | DRAFT / SCHEDULED / IN_PROGRESS / COMPLETED / FAILED |
| created_at      | DATETIME | Auto-set on insert               |
| updated_at      | DATETIME | Auto-updated on change           |

### Table: `recipients`
| Column              | Type    | Notes                          |
|---------------------|---------|--------------------------------|
| id                  | INTEGER | PK, auto-increment             |
| name                | TEXT    | NOT NULL                       |
| email               | TEXT    | UNIQUE, NOT NULL               |
| subscription_status | TEXT    | SUBSCRIBED / UNSUBSCRIBED      |
| created_at          | DATETIME|                                |
| updated_at          | DATETIME|                                |

### Table: `delivery_logs`
| Column          | Type     | Notes                         |
|-----------------|----------|-------------------------------|
| id              | INTEGER  | PK, auto-increment            |
| campaign_id     | INTEGER  | FK → campaigns.id             |
| recipient_email | TEXT     | NOT NULL                      |
| recipient_name  | TEXT     |                               |
| status          | TEXT     | SENT / FAILED                 |
| failure_reason  | TEXT     | Populated on failure          |
| sent_at         | DATETIME | Auto-set on insert             |

---

## ⚙️ Prerequisites

| Tool        | Version       |
|-------------|---------------|
| Java (JDK)  | 17 or higher  |
| Maven       | 3.8 or higher |
| Git         | Any           |

> **No database installation needed** — SQLite is file-based and bundled via JDBC.

---

## 🚀 How to Run (Local)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd bulk-email-campaign
```

### 2. Configure email (choose one option)

#### Option A — Real email via Gmail (App Password)
Edit `src/main/resources/application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-gmail@gmail.com
spring.mail.password=your-16-char-app-password
app.mail.from=your-gmail@gmail.com
```

> To generate a Gmail App Password:
> Google Account → Security → 2-Step Verification → App Passwords → Generate

#### Option B — Local MailHog (no real emails, recommended for dev)

Install MailHog:
```bash
# macOS
brew install mailhog

# Linux
wget https://github.com/mailhog/MailHog/releases/latest/download/MailHog_linux_amd64
chmod +x MailHog_linux_amd64 && ./MailHog_linux_amd64

# Windows — download from https://github.com/mailhog/MailHog/releases
```

Then in `application.properties`, comment out the Gmail block and uncomment:
```properties
spring.mail.host=localhost
spring.mail.port=1025
spring.mail.properties.mail.smtp.auth=false
spring.mail.properties.mail.smtp.starttls.enable=false
app.mail.from=test@localhost
```

Start MailHog, then open http://localhost:8025 to see emails.

### 3. Build and run

```bash
# Build (skip tests for faster start)
mvn clean package -DskipTests

# Run
java -jar target/bulk-email-campaign-1.0.0.jar
```

Or run directly with Maven:
```bash
mvn spring-boot:run
```

The application starts at **http://localhost:8080**

---

## 🖥 Application UI (Web Interface)

| URL                     | Description               |
|-------------------------|---------------------------|
| `http://localhost:8080/`| Dashboard                 |
| `/campaigns`            | List all campaigns        |
| `/campaigns/new`        | Create a new campaign     |
| `/campaigns/{id}`       | View campaign + logs      |
| `/recipients`           | Manage recipients         |

---

## 📡 REST API Reference

Base URL: `http://localhost:8080/api/v1`

### Campaigns

| Method | Endpoint                        | Description            |
|--------|---------------------------------|------------------------|
| POST   | `/campaigns`                    | Create campaign        |
| GET    | `/campaigns`                    | List all campaigns     |
| GET    | `/campaigns/{id}`               | Get campaign by ID     |
| PUT    | `/campaigns/{id}`               | Update campaign        |
| DELETE | `/campaigns/{id}`               | Delete campaign        |
| POST   | `/campaigns/{id}/schedule`      | Move to SCHEDULED      |
| POST   | `/campaigns/{id}/execute`       | Send immediately       |
| GET    | `/campaigns/{id}/delivery-logs` | View delivery logs     |

### Recipients

| Method | Endpoint                         | Description            |
|--------|----------------------------------|------------------------|
| GET    | `/recipients`                    | List all recipients    |
| GET    | `/recipients/{id}`               | Get by ID              |
| POST   | `/recipients/upload`             | Upload CSV             |
| PATCH  | `/recipients/{id}/unsubscribe`   | Unsubscribe            |
| PATCH  | `/recipients/{id}/resubscribe`   | Resubscribe            |
| DELETE | `/recipients/{id}`               | Delete recipient       |
| GET    | `/recipients/stats`              | Get subscriber counts  |

### Example: Create a Campaign

```bash
curl -X POST http://localhost:8080/api/v1/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "campaignName": "Summer Newsletter",
    "subjectLine": "Our Summer Update",
    "emailContent": "<h1>Hello {{name}}!</h1><p>Check out our latest offers.</p>",
    "scheduledTime": "2025-12-01T10:00:00"
  }'
```

### Example: Upload Recipients CSV

```bash
curl -X POST http://localhost:8080/api/v1/recipients/upload \
  -F "file=@sample-recipients.csv"
```

---

## 📁 CSV Format

The system accepts CSV files with the following format:

```csv
name,email,subscription_status
Alice Johnson,alice@example.com,SUBSCRIBED
Bob Smith,bob@example.com,UNSUBSCRIBED
Carol White,carol@example.com,SUBSCRIBED
```

- **Header row is optional** — detected automatically
- **subscription_status** is optional — defaults to `SUBSCRIBED`
- **Duplicate emails** are silently skipped (no error)
- **Invalid email formats** are skipped with a warning in the response

---

## 📧 Email Personalisation

Use `{{name}}` in your email content to insert each recipient's name:

```html
<h1>Hello {{name}},</h1>
<p>We have an exclusive offer just for you!</p>
```

---

## 🔁 Campaign State Machine

```
DRAFT ──→ SCHEDULED ──→ IN_PROGRESS ──→ COMPLETED
  ↑             │                              │
  └─────────────┘ (edit resets to DRAFT)       └→ (FAILED if errors)
```

- **DRAFT** — editable, can be scheduled or executed directly
- **SCHEDULED** — will be auto-executed by the scheduler when time arrives
- **IN_PROGRESS** — currently sending (cannot edit or delete)
- **COMPLETED** — all delivery attempts logged

---

## 🏢 Enterprise Design Decisions

| Concern                | Decision                                              |
|------------------------|-------------------------------------------------------|
| Layered architecture   | Controller → Service Interface → Impl → Repository    |
| Error handling         | Centralised `@RestControllerAdvice` global handler    |
| API contract           | Consistent `ApiResponse<T>` envelope on all endpoints |
| Transaction safety     | `@Transactional` on all service methods               |
| Input validation       | Jakarta Bean Validation on all DTOs                   |
| Audit trail            | Full `DeliveryLog` per email attempt with failure reason |
| Separation of concerns | Web MVC controller separate from REST controllers     |
| Email abstraction      | `EmailService` interface allows mock/alternative impl |
| Scheduler safety       | Each campaign execution wrapped in try-catch          |

---

## 📦 Project Structure

```
src/main/java/com/enterprise/emailcampaign/
├── EmailCampaignApplication.java       # Entry point
├── config/
│   └── WebConfig.java                  # MVC date/time formatters
├── controller/
│   ├── CampaignController.java         # REST: /api/v1/campaigns
│   ├── RecipientController.java        # REST: /api/v1/recipients
│   └── WebController.java              # UI: Thymeleaf pages
├── exception/
│   ├── GlobalExceptionHandler.java     # Centralised error handling
│   ├── ResourceNotFoundException.java
│   ├── InvalidCampaignStateException.java
│   └── CsvParseException.java
├── model/
│   ├── entity/                         # JPA entities
│   │   ├── Campaign.java
│   │   ├── Recipient.java
│   │   └── DeliveryLog.java
│   ├── enums/
│   │   ├── CampaignStatus.java
│   │   ├── DeliveryStatus.java
│   │   └── SubscriptionStatus.java
│   └── dto/
│       ├── request/CampaignRequest.java
│       └── response/ (ApiResponse, CampaignResponse, etc.)
├── repository/                         # Spring Data JPA repos
├── scheduler/
│   └── CampaignScheduler.java          # @Scheduled campaign trigger
├── service/                            # Service interfaces
│   └── impl/                           # Implementations
└── util/
    ├── EmailValidator.java             # Stateless email regex
    └── CampaignMapper.java             # Entity → DTO conversion
```
