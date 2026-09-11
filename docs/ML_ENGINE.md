# ML Engine Documentation - Sadak Setu Sensor-Based Road Anomaly Detection

## Overview

This document describes the complete ML pipeline for sensor-based road anomaly detection in the Sadak Setu system. The pipeline processes vehicle-mounted IoT sensor data (accelerometer and gyroscope) to automatically detect road anomalies, estimate severity, and create maintenance complaints.

## Architecture

```
IoT Device (ESP32/Smartphone)
↓
Sensor Telemetry Ingestion (POST /api/v1/iot/telemetry)
↓
Feature Extraction (backend/src/services/telemetry/feature-extractor.ts)
↓
Sensor ML Service (ai-service/app/api/sensor.py)
↓
ML Inference (Random Forest + Gradient Boosting)
↓
Event Classification (NORMAL/POTHOLE/SPEED_BREAKER/etc.)
↓
Severity Estimation (LOW/MEDIUM/HIGH/CRITICAL)
↓
Depth Estimation (cm) - for potholes only
↓
Automatic Complaint Creation (if confidence > threshold)
↓
Duplicate Detection (spatial-temporal)
↓
Database Storage (MaintenanceCase + DamageDetection)
↓
Realtime Event Emission (WebSocket/SSE - planned)
↓
Road Inspector Portal
```

## Data Flow

### 1. Sensor Data Ingestion

**Endpoint**: `POST /api/v1/iot/telemetry`

**Input Format**:
```json
{
  "deviceId": "device_0001",
  "timestamp": "2026-09-11T12:00:00Z",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "speed": 42.0,
  "accelerometerX": 2.8,
  "accelerometerY": -1.9,
  "accelerometerZ": 14.8,
  "gyroX": 0.8,
  "gyroY": -1.2,
  "gyroZ": 0.3
}
```

**Processing**:
1. Device authentication via `X-Device-Secret` header
2. Anti-impersonation validation
3. Idempotency check (prevent duplicate processing)
4. Raw telemetry storage (`DeviceTelemetry` table)
5. Feature extraction (`TelemetryProcessed` table)
6. Optional sensor ML analysis (if enabled)

### 2. Sensor ML Inference

**Endpoint**: `POST /sensor/predict` (AI service)

**Input Format**:
```json
{
  "device_id": "device_0001",
  "timestamp": "2026-09-11T12:00:00Z",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "speed_kmph": 42.0,
  "sensor_window": [
    {
      "accel_x": 2.8,
      "accel_y": -1.9,
      "accel_z": 14.8,
      "gyro_x": 0.8,
      "gyro_y": -1.2,
      "gyro_z": 0.3
    }
  ]
}
```

**Output Format**:
```json
{
  "device_id": "device_0001",
  "timestamp": "2026-09-11T12:00:00Z",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "event_type": "POTHOLE",
  "severity": "HIGH",
  "estimated_depth_cm": 8.7,
  "confidence": 0.93,
  "model_version": "1.0.0",
  "processing_time_ms": 45.2,
  "request_id": "uuid"
}
```

### 3. Automatic Complaint Creation

**Trigger Conditions**:
- Event type is `POTHOLE` or `SEVERE_POTHOLE`
- Confidence ≥ `SENSOR_ML_CONFIDENCE_THRESHOLD` (default: 0.85)
- GPS coordinates are valid (not 0,0)
- No duplicate within spatial-temporal window

**Duplicate Detection**:
- Spatial radius: `SENSOR_ML_DEDUP_RADIUS_METERS` (default: 10m)
- Temporal window: `SENSOR_ML_DEDUP_WINDOW_SECONDS` (default: 300s)
- Only checks `OPEN`, `ASSIGNED`, `IN_PROGRESS` complaints from `SENSOR` source

**Complaint Structure**:
```json
{
  "caseNumber": "SS-202609-0001",
  "roadId": "uuid",
  "priority": "HIGH",
  "status": "OPEN",
  "description": "AI-detected POTHOLE (HIGH severity). Estimated depth: 8.7 cm. Confidence: 93.0%.",
  "notes": {
    "source": "AI_IOT",
    "device_id": "device_0001",
    "model_version": "1.0.0",
    "confidence": 0.93,
    "estimated_depth_cm": 8.7,
    "detected_at": "2026-09-11T12:00:00Z"
  }
}
```

## Feature Engineering

### Core Features

1. **Acceleration Magnitude**: √(ax² + ay² + az²)
2. **Gyroscope Magnitude**: √(gx² + gy² + gz²)
3. **Vertical Acceleration**: az component
4. **Vibration RMS**: √(mean((accel_mag - 9.8)²))
5. **Vibration Peak**: max(|accel_mag - 9.8|)
6. **Jerk RMS**: Rate of change of acceleration
7. **Frequency Dominant**: Peak frequency from FFT
8. **Speed-Adjusted Impact**: vibration_peak / (speed_kmph / 40)
9. **Event Duration**: Window length in milliseconds
10. **Acceleration Std**: Combined standard deviation
11. **Gyroscope Std**: Combined standard deviation
12. **Peak-to-Peak**: max - min of acceleration

### Feature Importance (from training)

Top features by importance:
1. `event_duration_ms` (27.8%)
2. `jerk_rms` (14.3%)
3. `speed_adjusted_impact` (10.7%)
4. `vibration_peak` (9.5%)
5. `frequency_dominant_hz` (8.3%)

## ML Models

### Model 1: Event Classifier

**Task**: Multi-class classification of road events

**Classes**: NORMAL, SPEED_BREAKER, POTHOLE, ROUGH_PATCH, SEVERE_POTHOLE, OTHER_ANOMALY

**Algorithm**: Random Forest Classifier
- n_estimators: 100
- max_depth: 15
- class_weight: balanced
- min_samples_split: 10
- min_samples_leaf: 5

**Performance** (validation set):
- Accuracy: 99.98%
- Precision: 99.5-100% (per class)
- Recall: 99.5-100% (per class)
- F1-Score: 99.5-100% (per class)

### Model 2: Severity Classifier

**Task**: Multi-class classification of pothole severity

**Classes**: LOW, MEDIUM, HIGH, CRITICAL

**Algorithm**: Gradient Boosting Classifier
- n_estimators: 100
- max_depth: 5
- learning_rate: 0.1

**Performance** (validation set):
- Accuracy: 88.05%
- CRITICAL: Precision=97.6%, Recall=98.1%
- HIGH: Precision=75.7%, Recall=69.1%
- MEDIUM: Precision=78.8%, Recall=83.9%
- LOW: Precision=85.1%, Recall=80.8%

### Model 3: Depth Regressor

**Task**: Regression of pothole depth in centimeters

**Algorithm**: Random Forest Regressor
- n_estimators: 100
- max_depth: 10
- min_samples_split: 10
- min_samples_leaf: 5

**Performance** (validation set):
- MAE: 0.618 cm
- RMSE: 0.810 cm
- R²: 0.984

## Training Pipeline

### Data Splitting Strategy

**Leakage Prevention**: Grouped by `event_id` to prevent temporal leakage

**Split Ratios**:
- Train: 65% (65,000 samples)
- Validation: 15% (15,000 samples)
- Test: 20% (20,000 samples)

### Training Commands

```bash
# Generate synthetic dataset
cd ai-service
python training/data_generator.py

# Process features
python training/process_features.py

# Train models
python training/train_sensor_models.py
```

### Model Artifacts

**Location**: `ai-service/models/sensor_anomaly/`

**Files**:
- `event_classifier.pkl` - Trained event classifier
- `severity_classifier.pkl` - Trained severity classifier
- `depth_regressor.pkl` - Trained depth regressor
- `scaler.pkl` - Feature scaler
- `label_encoders.pkl` - Label encoders
- `feature_names.pkl` - Feature name list
- `training_metadata.json` - Training metadata

## Inference Service

### Deployment

**Docker**: Included in existing `ai-service` Dockerfile

**Environment Variables**:
```bash
SENSOR_ML_MODE=mock|live
SENSOR_ML_SERVICE_URL=http://localhost:8000
SENSOR_ML_TIMEOUT_MS=20000
SENSOR_ML_CONFIDENCE_THRESHOLD=0.85
SENSOR_ML_AUTO_COMPLAINT_ENABLED=false
SENSOR_ML_DEDUP_RADIUS_METERS=10.0
SENSOR_ML_DEDUP_WINDOW_SECONDS=300
```

### API Endpoints

**AI Service**:
- `POST /sensor/predict` - Single prediction
- `POST /sensor/predict/batch` - Batch prediction
- `GET /sensor/health` - Health check

**Backend Service**:
- `POST /api/v1/sensor/predict` - Manual prediction trigger
- `GET /api/v1/sensor/health` - Service health check

## Configuration

### Backend Configuration

**File**: `backend/src/config/index.ts`

**New Configuration Section**:
```typescript
sensor: {
  mode: 'mock' | 'live',
  serviceUrl: string,
  timeoutMs: number,
  confidenceThreshold: number,
  autoComplaintEnabled: boolean,
  dedupRadiusMeters: number,
  dedupWindowSeconds: number
}
```

### Environment Variables

Add to `.env`:
```bash
SENSOR_ML_MODE=mock
SENSOR_ML_SERVICE_URL=http://localhost:8000
SENSOR_ML_TIMEOUT_MS=20000
SENSOR_ML_CONFIDENCE_THRESHOLD=0.85
SENSOR_ML_AUTO_COMPLAINT_ENABLED=false
SENSOR_ML_DEDUP_RADIUS_METERS=10.0
SENSOR_ML_DEDUP_WINDOW_SECONDS=300
```

## Testing

### Test Coverage

**Unit Tests**:
- Feature extraction logic
- Model loading and initialization
- Prediction with various scenarios
- Error handling
- Edge cases (missing GPS, zero speed, etc.)

**Integration Tests**:
- End-to-end normal driving scenario
- End-to-end pothole impact scenario
- Duplicate detection logic
- Complaint creation flow

**Test Command**:
```bash
cd ai-service
pytest tests/test_sensor_detector.py -v
```

## Important Disclaimers

### Synthetic Data Limitations

⚠️ **The current models are trained on synthetic data only.**

**Limitations**:
- Does not capture real-world complexity
- May not represent all road conditions
- Sensor noise models are simplified
- GPS trajectories are idealized
- Weather effects are not fully modeled

**Performance on Real Data**:
- Model accuracy on synthetic data does NOT represent real-world performance
- Extensive field validation required before production deployment
- Models must be recalibrated with real IoT data

### Deployment Recommendations

1. **Field Testing**: Deploy with `SENSOR_ML_AUTO_COMPLAINT_ENABLED=false` initially
2. **Gradual Rollout**: Start with low confidence thresholds
3. **Human Review**: Require manual verification of AI-generated complaints
4. **Continuous Monitoring**: Track precision/recall in production
5. **Model Retraining**: Regularly update models with real data

## Real-World Data Collection Plan

### Phase 1: Instrumented Vehicles

Deploy IoT devices on:
- 5-10 municipal vehicles
- 2-3 contractor vehicles
- Variable road types (urban, highway, rural)

### Phase 2: Ground Truth Collection

- Manual surveys of detected anomalies
- Physical measurements of pothole depth
- GPS validation
- Time synchronization

### Phase 3: Data Labeling

- Label events by type (pothole, speed breaker, etc.)
- Measure actual severity
- Record environmental conditions
- Document vehicle characteristics

### Phase 4: Model Retraining

- Replace synthetic data with real data
- Validate on held-out real data
- Update feature engineering if needed
- Deploy updated models

### Phase 5: Production Deployment

- Enable automatic complaint creation
- Implement realtime updates
- Monitor performance metrics
- Establish feedback loops

## Performance Characteristics

### Inference Latency

- Single prediction: ~50ms (mock), ~100-200ms (live)
- Batch prediction: ~100ms (mock), ~200-500ms (live)

### Throughput

- Single device: ~20 predictions/second
- Batch processing: ~100 predictions/second

### Resource Requirements

**AI Service**:
- CPU: 2 cores minimum
- RAM: 4GB minimum
- Disk: 500MB for models

**Backend Integration**:
- CPU: Minimal overhead
- RAM: Additional 100MB for client
- Network: ~1KB per prediction

## Known Limitations

1. **No Realtime Updates**: WebSocket/SSE not yet implemented
2. **Simplified GPS Matching**: Uses Euclidean distance instead of spatial queries
3. **Single-Reading Windows**: Currently uses single reading instead of proper windowing
4. **No Device Calibration**: Does not account for device-specific calibration
5. **Limited Weather Impact**: Weather effects not fully modeled
6. **Speed Dependency**: Speed estimation not validated in real conditions

## Future Enhancements

### Short Term

1. **Proper Windowing**: Implement sliding window for sensor data
2. **Spatial Queries**: Use PostGIS for efficient spatial duplicate detection
3. **Realtime Updates**: Implement WebSocket/SSE for live complaint updates
4. **Device Calibration**: Add device-specific calibration factors
5. **Confidence Calibration**: Calibrate confidence scores on real data

### Long Term

1. **Deep Learning Models**: Explore LSTM/Transformer for temporal patterns
2. **Multi-Modal Fusion**: Combine sensor data with camera images
3. **Adaptive Thresholds**: Dynamic confidence thresholds based on conditions
4. **Transfer Learning**: Adapt models to different vehicle types
5. **Edge Deployment**: Run inference on IoT devices themselves

## Troubleshooting

### Common Issues

**Issue**: Models fail to load
- **Solution**: Check model path in config, ensure files exist

**Issue**: Low confidence predictions
- **Solution**: Check sensor data quality, verify calibration

**Issue**: Too many duplicate complaints
- **Solution**: Adjust dedup radius/window parameters

**Issue**: Poor real-world performance
- **Solution**: Retrain with real data, adjust features

### Debug Mode

Enable debug logging:
```bash
export LOG_LEVEL=debug
```

Check model health:
```bash
curl http://localhost:8000/sensor/health
```

## Version History

- **v1.0.0** (2026-09-11): Initial release with synthetic data training
  - Event classifier: 99.98% accuracy (synthetic)
  - Severity classifier: 88.05% accuracy (synthetic)
  - Depth regressor: 0.618 cm MAE (synthetic)

## Contact & Support

For questions about the ML pipeline, refer to:
- `docs/ML_ENGINE_AUDIT.md` - Detailed architecture audit
- `ai-service/data/README/data_dictionary.md` - Data dictionary
- Project GitHub repository

**Last Updated**: 2026-09-11
**Version**: 1.0.0