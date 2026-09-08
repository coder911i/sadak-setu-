# Sadak Setu (सड़क सेतु)
### AI-Powered Road Health & Maintenance Intelligence System

Sadak Setu is a comprehensive infrastructure management platform closing the operational loop:
```
DETECT → ANALYZE → SCORE → PRIORITIZE → ASSIGN → REPAIR → VERIFY → CLOSE → TRACK
```

---

## 🌟 Key Capabilities

1. **Closed-Loop Operations**: Automates every phase from field camera surveys to post-repair dual-evidence verification.
2. **AI Road Defect Detection**: Microservice integration with YOLOv8 detecting potholes, alligator cracking, surface defects, and edge wear.
3. **IoT & Sensor Fusion**: Correlates visual damage with physical 3-axis accelerometer vibrations and gyroscope telematics from road vehicles.
4. **Configurable Road Health Scoring (0–100)**: Multi-factor scoring combining severity, defect density per km, and vibration intensity.
5. **Deterministic Priority Engine**: Classifies urgency (`IMMEDIATE`, `HIGH`, `MONITOR`) with transparent algorithmic justifications.
6. **Strict Finite State Machine**: Governed workflow with audit trails and transition validations (`OPEN` → `ASSIGNED` → `IN_PROGRESS` → `REPAIR_SUBMITTED` → `AI_VERIFICATION` → `VERIFIED` → `CLOSED`).
7. **Before/After AI Verification**: Dual-evidence image analysis verifying defect remediation with human supervisor override capabilities.
8. **Server-Side Role-Based Access Control (RBAC)**: Enforces permissions across `ADMIN`, `ROAD_INSPECTOR`, `MAINTENANCE_TEAM`, and `AUTHORITY`.
9. **Object Storage Abstraction**: Pluggable storage supporting local disk, Cloudflare R2, and AWS S3 without touching business logic.
10. **Type-Safe Frontend Client**: Pre-bundled `@sadak-setu/frontend-client` SDK for immediate frontend integration.

---

## 📂 Repository Layout

```
sadak-setu/
├── backend/                  # Primary Node.js / Express / TypeScript API
│   ├── src/
│   │   ├── config/           # Database, environment, and Swagger configurations
│   │   ├── controllers/      # Request handlers & response formatting
│   │   ├── services/         # Business logic, state machines & fusion engines
│   │   ├── repositories/     # Database queries & transactions via Prisma
│   │   ├── middleware/       # JWT auth, RBAC, Zod validation, rate limiter
│   │   ├── validators/       # Zod schemas
│   │   ├── integrations/     # AI client, storage, IoT adapters & notifications
│   │   ├── utils/            # Standard envelopes, password hashing, geo formulas
│   │   ├── prisma/           # PostgreSQL / NeonDB schema and demo seed script
│   │   ├── app.ts            # Express app configuration
│   │   └── server.ts         # Server bootstrapper with graceful shutdown
│   └── tests/                # Vitest unit & integration test suites
├── ai-service/               # Python FastAPI Microservice (YOLO & OpenCV)
│   ├── app/                  # Inference, verification, and preprocessing
│   ├── requirements.txt
│   └── Dockerfile
├── frontend-client/          # TypeScript API SDK for frontend applications
├── docs/                     # Architecture, API, Database, AI, and IoT documentation
├── .env.example              # Environment variables template
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher
- **PostgreSQL**: NeonDB or local PostgreSQL instance
- **Python**: 3.10+ (for live `ai-service`)

### 2. Environment Configuration
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```

### 3. Backend Setup & Database Migration
```bash
cd backend
npm install
npm run prisma:generate

# If using NeonDB or local PostgreSQL:
npx prisma migrate dev --name init

# Populate realistic Indian road demo data:
npm run prisma:seed
```

### 4. Running the Backend
```bash
# Start development server with hot-reload
npm run dev

# Or build and run production bundle
npm run build
npm start
```
- API Base URL: `http://localhost:5000/api/v1`
- Interactive Swagger UI: `http://localhost:5000/api/docs`
- Health Endpoint: `http://localhost:5000/health`

### 5. Running Automated Tests
```bash
npm run test
```

### 6. Running the AI Microservice (Optional)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*(Note: When `AI_MODE=mock` is set in `.env`, the backend will simulate high-accuracy AI responses without requiring Python or GPU).*

---

## 🔐 Default Demo Accounts (From Seed)

| Role | Email | Password |
|---|---|---|
| **ADMIN** | `admin@sadaksetu.gov.in` | `SadakSetu@2026` |
| **ROAD_INSPECTOR** | `inspector@sadaksetu.gov.in` | `SadakSetu@2026` |
| **MAINTENANCE_TEAM** | `team@sadaksetu.gov.in` | `SadakSetu@2026` |
| **AUTHORITY** | `authority@sadaksetu.gov.in` | `SadakSetu@2026` |

---

## 📖 Detailed Documentation
- [System Architecture](docs/architecture.md)
- [API Reference & Contracts](docs/api.md)
- [Database Schema & ERD](docs/database.md)
- [AI Model & Verification](docs/ai-integration.md)
- [IoT & Telemetry Fusion](docs/iot-integration.md)
- [Maintenance Lifecycle State Machine](docs/maintenance-workflow.md)
- [Production Deployment](docs/deployment.md)
