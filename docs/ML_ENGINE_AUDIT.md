# ML Engine Audit - Sadak Setu Repository

## Executive Summary

This audit documents the existing architecture of the Sadak Setu repository to inform the implementation of a realistic ML pipeline for vehicle-mounted IoT road-health devices. The audit identifies the active AI service, data flow patterns, integration points, and areas where new ML capabilities should be added without disrupting existing functionality.

---

## 1. Existing AI Architecture

### 1.1 Active AI Service
**Location**: `ai-service/` (Python FastAPI)

**Status**: ✅ ACTIVE - This is the primary AI microservice

**Technology Stack**:
- FastAPI web framework
- YOLOv8 object detection for road damage
- OpenCV for image/video preprocessing
- Python 3.10+

**Current Capabilities**:
- Image-based damage detection (POTHOLE, CRACK, SURFACE_DAMAGE, EDGE_DAMAGE)
- Video-based damage detection
- Before/After verification for repair validation
- Severity classification (LOW, MEDIUM, HIGH, CRITICAL)
- Mock mode for development without GPU/weights

**API Endpoints**:
- `POST /infer/upload/image` - File upload inference
- `POST /infer/upload/video` - Video upload inference  
- `POST /infer/image` - JSON body inference
- `POST /infer/video` - JSON body video inference
- `POST /verify/before-after` - Before/after comparison
- `GET /health` - Health check

**Model Files**:
- `ai-service/models/road-damage/best.pt` - YOLO weights (placeholder)
- `ai-service/damage_classes.py` - Damage class definitions

### 1.2 Duplicate/Legacy AI Service
**Location**: `ai_service/` (Python)

**Status**: ⚠️ DUPLICATE - Contains minimal implementation

**Content**: 
- Single `__init__.py` file
- No actual implementation
- Should be deprecated or removed

**Recommendation**: Remove `ai_service/` directory as it appears to be an accidental duplicate of the active `ai-service/`.

---

## 2. Backend Architecture

### 2.1 Core Backend
**Location**: `backend/` (Node.js/Express/TypeScript)

**Technology Stack**:
- Express.js web framework
- TypeScript
- Prisma ORM
- PostgreSQL/NeonDB database
- Zod validation
- JWT authentication

**API Base**: `http://localhost:5000/api/v1`

### 2.2 IoT Data Ingestion
**Endpoint**: `POST /api/v1/iot/telemetry`

**Controller**: `backend/src/controllers/iot.controller.ts`

**Service**: `backend/src/services/device.service.ts`

**Features**:
- Device authentication via `X-Device-Secret` header
- Anti-impersonation checks
- Idempotency/replay detection
- Support for both snake_case and camelCase field names
- Tolerates missing GPS and sensor failures

**Data Flow**:
1. Raw telemetry → DeviceTelemetry table
2. Feature extraction → TelemetryProcessed table
3. Normalization via DeviceAdapter

### 2.3 Sensor Schema
**Raw Telemetry Fields** (`backend/src/integrations/iot/device-adapter.ts`):
```typescript
- deviceId: string
- inspectionId?: string
- timestamp?: string | Date
- latitude?: number | null
- longitude?: number | null
- speed?: number | null
- accelerometerX/Y/Z?: number | null (or accel_x/y/z)
- gyroX/Y/Z?: number | null (or gyro_x/y/z)
- ultrasonic1/2?: number | null (or distance_1/2)
- vibrationIntensity?: number | null
```

**Processed Features** (`backend/src/services/telemetry/feature-extractor.ts`):
```typescript
- accelerationMagnitude: Float
- gyroMagnitude: Float
- ultrasonicDiff: Float (optional)
- windowStats: Json (mean, median, min, max, peak, variance, stddev, rms)
```

### 2.4 Database Schema
**Relevant Tables**:

**DeviceTelemetry** (Raw sensor data):
- deviceId, inspectionId, timestamp
- latitude, longitude, speed
- accelerometerX/Y/Z, gyroX/Y/Z
- vibrationIntensity

**TelemetryProcessed** (Engineered features):
- deviceId, timestamp, latitude, longitude, speed
- accelerationMagnitude, gyroMagnitude
- ultrasonicDiff, windowStats

**Device** (Device registry):
- deviceCode, name, type, status
- firmwareVersion, apiKeyHash
- lastSeenAt

**DamageDetection** (AI image detections):
- inspectionId, mediaId, damageType, severity
- confidence, boundingBox, latitude, longitude
- source (AI/INSPECTOR/SENSOR/HYBRID)

**MaintenanceCase** (Complaints/work orders):
- caseNumber, roadId, segmentId, damageId
- priority, status, assignedTeamId
- description, createdById

---

## 3. Existing ML Implementation

### 3.1 Current AI Integration
**Backend AI Client**: `backend/src/integrations/ai/ai-client.ts`

**Modes**:
- `mock`: Simulates AI responses without Python service
- `live`: Calls Python FastAPI microservice

**Configuration**:
- `AI_MODE` environment variable
- `AI_SERVICE_URL` (Python service endpoint)
- `AI_TIMEOUT_MS` (request timeout)

### 3.2 Damage Classes
**Current Classes** (`ai-service/damage_classes.py`):
- POTHOLE (0)
- CRACK (1)
- ROAD_SURFACE_DAMAGE (2)
- EDGE_DAMAGE (3)

**Severity Levels**: LOW, MEDIUM, HIGH, CRITICAL

### 3.3 Missing ML Capabilities
**❌ No sensor-based anomaly detection**
**❌ No time-series ML for accelerometer/gyro data**
**❌ No automatic complaint creation from sensor data**
**❌ No severity estimation from vibration patterns**
**❌ No pothole depth estimation from sensor data**
**❌ No speed-dependent impact modeling**
**❌ No temporal window analysis**
**❌ No device-specific calibration**

---

## 4. Realtime Mechanisms

### 4.1 Current Status
**❌ No WebSocket implementation detected**
**❌ No Server-Sent Events (SSE) detected**
**❌ No realtime notification system for new complaints**

### 4.2 Existing Notification System
**Location**: `backend/src/integrations/notifications/`

**Providers**:
- Email provider
- In-app provider (database-based)

**Database Table**: `Notification`
- userId, title, message, type
- isRead, readAt, metadata
- createdAt

**Limitation**: Requires polling or manual refresh - no push mechanism

---

## 5. Deployment Architecture

### 5.1 Local Development
**File**: `docker-compose.yml`

**Services**:
- backend (Node.js, port 3000)
- ai-service (Python, port 8000)

**Network**: `sadaksetu_net`

**Health Checks**: Both services have health endpoints

### 5.2 Production Deployment
**File**: `render.yaml`

**Services**:
- sadak-setu-backend (Node.js web service)
- sadak-setu-ai-service (Python/Docker web service)

**Region**: Singapore
**Database**: NeonDB (PostgreSQL)

**Environment Variables**:
- AI_MODE (mock/live)
- AI_SERVICE_URL
- IOT_MODE (live)
- STORAGE_PROVIDER (local/r2/s3)
- Scoring weights (configurable)

---

## 6. API Contracts

### 6.1 Existing AI API
**Image Analysis Request**:
```json
{
  "mediaUrl": "string",
  "latitude": number,
  "longitude": number,
  "chainage": number
}
```

**Image Analysis Response**:
```json
{
  "analysisId": "uuid",
  "source": "string",
  "mediaUrl": "string",
  "inferenceTimeMs": number,
  "detections": [
    {
      "damageType": "POTHOLE|CRACK|SURFACE_DAMAGE|EDGE_DAMAGE",
      "confidence": number,
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "boundingBox": { "x": number, "y": number, "width": number, "height": number },
      "location": { "latitude": number, "longitude": number },
      "chainage": number
    }
  ],
  "metadata": { "ai_mode": "string", "model": "string" }
}
```

### 6.2 IoT Telemetry API
**Request**:
```json
{
  "deviceId": "string",
  "inspectionId": "string (optional)",
  "timestamp": "ISO string",
  "latitude": number,
  "longitude": number,
  "speed": number,
  "accelerometerX": number,
  "accelerometerY": number,
  "accelerometerZ": number,
  "gyroX": number,
  "gyroY": number,
  "gyroZ": number,
  "vibrationIntensity": number
}
```

**Headers**:
- `X-Device-Secret`: Device authentication
- `X-Device-Id`: Optional device identity verification

---

## 7. Integration Points for New ML Pipeline

### 7.1 Recommended Inference Endpoint
**Location**: Extend existing `ai-service/app/api/infer.py`

**New Endpoint**: `POST /infer/sensor`

**Purpose**: Process sensor windows for anomaly detection

**Input Schema**:
```json
{
  "device_id": "string",
  "timestamp": "ISO string",
  "latitude": number,
  "longitude": number,
  "speed_kmph": number,
  "sensor_window": [
    {
      "accel_x": number,
      "accel_y": number,
      "accel_z": number,
      "gyro_x": number,
      "gyro_y": number,
      "gyro_z": number
    }
  ]
}
```

**Output Schema**:
```json
{
  "device_id": "string",
  "timestamp": "ISO string",
  "latitude": number,
  "longitude": number,
  "event_type": "NORMAL|SPEED_BREAKER|POTHOLE|ROUGH_PATCH|SEVERE_POTHOLE|OTHER_ANOMALY",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "estimated_depth_cm": number,
  "confidence": number,
  "model_version": "string"
}
```

### 7.2 Backend Integration Point
**Location**: Extend `backend/src/services/device.service.ts`

**Method**: Add `processSensorAnomalyDetection()` method

**Flow**:
1. After telemetry ingestion
2. Call AI service sensor inference
3. If pothole detected with high confidence
4. Create MaintenanceCase automatically
5. Emit notification

### 7.3 Complaint Creation Point
**Location**: `backend/src/repositories/maintenance.repository.ts`

**Existing Method**: `create()`

**New Fields to Add**:
- `source: "AI_IOT"` (new DetectionSource value)
- `auto_generated: true`
- `device_id: string`
- `model_version: string`
- `estimated_depth_cm: number`

---

## 8. Files to Reuse vs Create

### 8.1 Files to Reuse (DO NOT MODIFY)
✅ `backend/src/controllers/iot.controller.ts` - Existing telemetry ingestion
✅ `backend/src/services/device.service.ts` - Extend for ML integration
✅ `backend/src/integrations/iot/device-adapter.ts` - Existing normalization
✅ `backend/src/services/telemetry/feature-extractor.ts` - Extend for new features
✅ `backend/prisma/schema.prisma` - Add new fields if needed
✅ `ai-service/app/main.py` - Add new router
✅ `ai-service/app/config.py` - Add ML configuration
✅ `ai-service/requirements.txt` - Add ML dependencies

### 8.2 Files to Create
🆕 `ai-service/training/data_generator.py` - Synthetic data generator
🆕 `ai-service/training/train_sensor_models.py` - ML training pipeline
🆕 `ai-service/app/api/sensor.py` - Sensor inference endpoint
🆕 `ai-service/app/inference/sensor_detector.py` - Sensor-based anomaly detection
🆕 `ai-service/models/sensor_anomaly/` - Trained sensor models
🆕 `backend/src/services/sensor-ml.service.ts` - Sensor ML orchestration
🆕 `backend/src/integrations/ai/sensor-client.ts` - Sensor AI client
🆕 `backend/src/repositories/sensor-anomaly.repository.ts` - Sensor anomaly storage

### 8.3 Files to Deprecate
❌ `ai_service/` - Remove duplicate directory

### 8.4 Files to NOT Modify
🚫 `backend/src/app.ts` - Core app configuration
🚫 `backend/src/server.ts` - Server bootstrap
🚫 `backend/src/middleware/*` - Authentication, RBAC, validation
🚫 `backend/src/routes/index.ts` - Route registration
🚫 Existing AI image/video inference - Keep as-is

---

## 9. Data Leakage Prevention Strategy

### 9.1 Grouping Strategy
**Critical**: Do NOT randomly split individual rows

**Group by**:
- `event_id` - Prevent same event leakage across train/val/test
- `route_id` - Prevent spatial leakage
- `device_id` - Prevent device-specific leakage

### 9.2 Temporal Splitting
**Recommended**: Time-based split
- Train: Oldest 70% of data
- Validation: Middle 15% of data
- Test: Newest 15% of data

### 9.3 Spatial Splitting
**Alternative**: Geographic split
- Train: Specific geographic regions
- Validation: Different regions
- Test: Completely different regions

---

## 10. Environment Variables Needed

### 10.1 New ML Configuration
```bash
# ML Model Configuration
ML_MODEL_PATH=/app/models/sensor_anomaly
ML_CONFIDENCE_THRESHOLD=0.85
ML_EVENT_WINDOW_SIZE_MS=2000
ML_SAMPLING_FREQUENCY_HZ=50

# Pothole Detection Configuration
POTHOLE_DEDUP_RADIUS_METERS=10.0
POTHOLE_DEDUP_WINDOW_SECONDS=300
AUTO_COMPLAINT_ENABLED=true
AUTO_COMPLAINT_MIN_CONFIDENCE=0.90

# Realtime Configuration
REALTIME_ENABLED=true
REALTIME_MECHANISM=websocket  # or sse
WEBSOCKET_PORT=3001
```

### 10.2 Existing Variables to Reuse
```bash
AI_MODE=mock/live
AI_SERVICE_URL=http://ai-service:8000
IOT_MODE=live
DATABASE_URL=postgresql://...
```

---

## 11. Current Limitations

### 11.1 ML Capabilities
- No sensor-based anomaly detection
- No time-series analysis
- No automatic complaint creation from sensors
- No severity estimation from vibration patterns
- No pothole depth estimation

### 11.2 Realtime
- No WebSocket/SSE implementation
- No push notifications for new complaints
- Polling-based only

### 11.3 Data
- No labeled sensor dataset
- No ground truth pothole measurements
- No device calibration data
- No speed-dependent impact modeling

---

## 12. Recommended Implementation Order

1. **Phase 1**: Create synthetic data generator
2. **Phase 2**: Implement feature engineering pipeline
3. **Phase 3**: Train initial ML models (classifier + regressor)
4. **Phase 4**: Add sensor inference endpoint to AI service
5. **Phase 5**: Integrate sensor ML into backend telemetry flow
6. **Phase 6**: Implement automatic complaint creation
7. **Phase 7**: Add duplicate detection logic
8. **Phase 8**: Implement WebSocket/SSE for realtime updates
9. **Phase 9**: Add comprehensive testing
10. **Phase 10**: Update deployment configuration

---

## 13. Key Architectural Decisions

### 13.1 ML Service Location
**Decision**: Extend existing `ai-service/` microservice

**Rationale**:
- Already has ML infrastructure (FastAPI, model loading)
- Clean separation of concerns
- Scalable independently
- Reuses existing deployment patterns

### 13.2 Model Storage
**Decision**: Store models in `ai-service/models/` with Git LFS for large files

**Rationale**:
- Version control for model artifacts
- Consistent with existing pattern
- Easy deployment via Render

### 13.3 Realtime Mechanism
**Decision**: Implement WebSocket (preferred) or SSE

**Rationale**:
- Bidirectional communication
- Lower latency than polling
- Better for road inspector portal
- Scalable with existing architecture

---

## 14. Testing Strategy

### 14.1 Unit Tests
- Synthetic data generation
- Feature extraction
- Model inference
- Data validation

### 14.2 Integration Tests
- End-to-end telemetry → ML → complaint flow
- Duplicate detection
- Realtime event emission
- API contract validation

### 14.3 Performance Tests
- Model inference latency
- Batch processing throughput
- Database query performance
- WebSocket connection handling

---

## 15. Success Criteria

### 15.1 Functional
- ✅ Synthetic data generates realistic sensor patterns
- ✅ ML models achieve reasonable validation performance
- ✅ Sensor inference API responds correctly
- ✅ Automatic complaints created for high-confidence detections
- ✅ Duplicate detection prevents redundant complaints
- ✅ Realtime updates reach frontend immediately

### 15.2 Non-Functional
- ✅ Inference latency < 100ms per sensor window
- ✅ API uptime > 99.5%
- ✅ Database query time < 50ms
- ✅ WebSocket message delivery < 1s
- ✅ Model loading time < 5s

---

## 16. Next Steps

1. Remove duplicate `ai_service/` directory
2. Create synthetic data generator in `ai-service/training/data_generator.py`
3. Implement feature engineering pipeline
4. Train initial ML models
5. Add sensor inference endpoint
6. Integrate with backend telemetry flow
7. Implement automatic complaint creation
8. Add realtime WebSocket/SSE
9. Deploy and test end-to-end
10. Document real-world data collection plan

---

**Audit Completed**: 2026-09-11
**Auditor**: ML Pipeline Implementation Agent
**Status**: Ready for Phase 2 (Synthetic Data Engine)