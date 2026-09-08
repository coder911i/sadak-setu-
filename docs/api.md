# Sadak Setu — API Specification (v1)

Base URL: `http://localhost:5000/api/v1`
Swagger UI: `http://localhost:5000/api/docs`

## Standard Envelope
All endpoints return JSON wrapped in the uniform envelope:

### Success:
```json
{
  "success": true,
  "data": { ... },
  "message": "Resource created successfully",
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

### Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "field": "email", "message": "Invalid email address" }]
  }
}
```

---

## Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register new user account |
| `POST` | `/login` | Public | Authenticate and obtain JWT access & refresh tokens |
| `POST` | `/refresh` | Public | Rotate refresh token and obtain fresh access token |
| `POST` | `/logout` | Public | Invalidate refresh token session |
| `GET` | `/me` | Authenticated | Retrieve authenticated user profile and role |

---

## Road Infrastructure (`/api/v1/roads`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Authenticated | List all roads with pagination, search, and filters |
| `GET` | `/:id` | Authenticated | Get detailed road profile with latest health score |
| `POST` | `/` | `ADMIN` | Register a new road corridor |
| `PATCH` | `/:id` | `ADMIN` | Update road details or status |
| `DELETE` | `/:id` | `ADMIN` | Remove road corridor |
| `GET` | `/:id/segments` | Authenticated | List segmented chainage partitions |
| `POST` | `/:id/segments` | `ADMIN` | Create new chainage segment |
| `GET` | `/:id/health` | Authenticated | Get latest computed Road Health Score (0-100) |
| `GET` | `/:id/history` | Authenticated | Full inspection and maintenance history |

---

## Inspections & Media (`/api/v1/inspections`, `/api/v1/media`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/inspections` | `ROAD_INSPECTOR` | Initiate road inspection session |
| `GET` | `/inspections` | Authenticated | Query inspections by road, inspector, or status |
| `GET` | `/inspections/:id` | Authenticated | Detailed inspection record with detections |
| `POST` | `/inspections/:id/complete` | `ROAD_INSPECTOR` | Mark survey as completed |
| `GET` | `/inspections/:id/fusion` | Authenticated | Calculate sensor + visual defect correlation |
| `POST` | `/media/upload` | Authenticated | Multipart upload for road images and videos |

---

## AI & Damage Intelligence (`/api/v1/ai`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/analyze-image` | `ROAD_INSPECTOR` | Send image to AI pipeline for defect bounding boxes |
| `POST` | `/analyze-video` | `ROAD_INSPECTOR` | Send dashcam video for keyframe damage detection |
| `GET` | `/analysis/:id` | Authenticated | Retrieve detection record |
| `PATCH` | `/analysis/:id/correct`| `ROAD_INSPECTOR` | Inspector correction for false positives/negatives |

---

## Maintenance Lifecycle (`/api/v1/maintenance`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/cases` | Authenticated | Filter maintenance cases by status or priority |
| `GET` | `/cases/:id` | Authenticated | Full case audit with assignment, evidence, and state history |
| `POST` | `/cases` | `ROAD_INSPECTOR` | Create maintenance case from detected defect |
| `POST` | `/cases/:id/assign` | `ADMIN` | Assign maintenance crew with deadline |
| `POST` | `/cases/:id/accept` | `MAINTENANCE_TEAM` | Crew accepts task |
| `POST` | `/cases/:id/start` | `MAINTENANCE_TEAM` | Crew commences repair work on-site |
| `POST` | `/cases/:id/submit-repair` | `MAINTENANCE_TEAM` | Upload after-repair evidence and trigger AI audit |
| `POST` | `/cases/:id/close` | `AUTHORITY`, `ADMIN` | Close verified case |

---

## Before / After Verification (`/api/v1/verification`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/:caseId` | Authenticated | View dual-evidence visual audit result |
| `POST` | `/:caseId/override`| `AUTHORITY`, `ADMIN` | Supervisor manual override (`APPROVE`, `REJECT`) |
