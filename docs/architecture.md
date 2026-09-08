# Sadak Setu — System Architecture Document

## 1. Executive Overview
Sadak Setu is an **AI-Powered Road Health & Maintenance Intelligence System**. It operationalizes a closed-loop infrastructure lifecycle:
```
DETECT → ANALYZE → SCORE → PRIORITIZE → ASSIGN → REPAIR → VERIFY → CLOSE → TRACK
```

Instead of fragmented CRUD tools, Sadak Setu treats road maintenance as an end-to-end, multi-actor state machine connecting field inspectors, IoT telematics, AI computer vision models, maintenance crews, and state authorities.

---

## 2. Tiered System Architecture

```
                                  [ Browser / Mobile Client ]
                                               │
                                       (HTTPS / REST API)
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Node.js / Express API Gateway                            │
│  - Tracing & Logging (X-Request-ID)   - Rate Limiting (express-rate-limit)             │
│  - Helmet Security Headers             - CORS Protection                                │
│  - JWT Authentication Middleware       - Strict Server-Side RBAC                        │
└──────────────────┬───────────────────────────────────────────┬─────────────────────────┘
                   │                                           │
                   ▼                                           ▼
┌──────────────────────────────────────┐     ┌───────────────────────────────────────────┐
│           Core Business Engines      │     │            External Integrations          │
│  - Priority Engine (Urgency Decision)│     │  - Storage Abstraction (Local/R2/S3)      │
│  - Road Health Scoring (0 - 100)     │     │  - Notification Providers (In-App/Email)  │
│  - Finite State Machine (Lifecycle)  │     │  - IoT Device Adapter (ESP32/Telematics)  │
│  - Sensor + Visual Fusion Service    │     │  - AI Service Client (HTTP Bridge)        │
└──────────────────┬───────────────────┘     └─────────────────┬─────────────────────────┘
                   │                                           │
                   ▼                                           ▼
┌──────────────────────────────────────┐     ┌───────────────────────────────────────────┐
│      Prisma ORM / Data Layer         │     │         Python AI Microservice            │
│  - User & Role Access Control        │     │  - FastAPI Engine                         │
│  - Road Infrastructure & Segments    │     │  - YOLO Road Defect Detector              │
│  - Inspections, Detections & Media   │     │  - OpenCV Keyframe & Image Preprocessor   │
│  - Maintenance Cases & Audit History │     │  - Dual-Evidence Before/After Comparator  │
└──────────────────┬───────────────────┘     └───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│       NeonDB / PostgreSQL            │
│  - Normalized Relational Tables      │
│  - Spatial & Foreign Key Indexes     │
│  - Append-Only Audit Logs            │
└──────────────────────────────────────┘
```

---

## 3. Clean Layering Rules
To preserve long-term maintainability:
1. **Routes (`/routes`)**: Route definitions, middleware attachment (Auth, RBAC, Validation), and controller bindings.
2. **Controllers (`/controllers`)**: Parse incoming request parameters, delegate to domain services, and return standardized JSON envelopes.
3. **Services (`/services`)**: Pure business logic, decision trees, state validation, and inter-service coordination.
4. **Repositories (`/repositories`)**: Encapsulates Prisma queries, database transactions, pagination, and projection.
5. **Database (`/prisma`)**: Single source of schema truth with migrations, indexes, and constraints.
