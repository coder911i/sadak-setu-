# Sadak Setu — AI Service Integration

Sadak Setu isolates heavy computer vision inference inside an independent **Python FastAPI microservice** (`ai-service/`). The Node.js backend communicates with the AI service through internal REST APIs.

## Architecture

```
[Node.js Backend] ──(HTTP POST)──► [Python FastAPI Service (ai-service)]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          [YOLOv8 Defect Detector]                   [Before/After Comparator]
     - Pothole Detection                        - Feature Keypoint Matching
     - Crack Classification                     - Road Surface Planarity
     - Surface Damage Bounding Boxes            - Defect Eradication Score (%)
```

## Modes of Operation

Configured via environment variable:
```bash
AI_MODE=mock  # or 'live'
```

- **`mock`**: Returns deterministic, high-accuracy simulated responses immediately without running PyTorch/YOLO. Perfect for frontend UI development, unit tests, and continuous integration.
- **`live`**: Dispatches requests to the FastAPI microservice (`AI_SERVICE_URL`). If the Python service is offline or times out, the backend gracefully falls back to the calibrated engine to prevent blocking field inspectors.

## API Contracts

### 1. Image Inference: `POST /infer/image`
**Request:**
```json
{
  "mediaUrl": "https://storage.sadaksetu.gov.in/media/img-092.jpg",
  "latitude": 27.4924,
  "longitude": 77.6737,
  "chainage": 14250.0
}
```

**Response:**
```json
{
  "analysisId": "8f8b8941-e9bb-43ba-9a3b-968b5561a293",
  "source": "LIVE_YOLO_V8",
  "mediaUrl": "https://storage.sadaksetu.gov.in/media/img-092.jpg",
  "inferenceTimeMs": 142.5,
  "detections": [
    {
      "damageType": "POTHOLE",
      "confidence": 0.94,
      "severity": "HIGH",
      "boundingBox": { "x": 320, "y": 480, "width": 140, "height": 95 },
      "location": { "latitude": 27.4924, "longitude": 77.6737 },
      "chainage": 14250.0
    }
  ]
}
```

### 2. Dual-Evidence Repair Verification: `POST /verify/before-after`
**Request:**
```json
{
  "beforeMediaUrl": "https://storage.sadaksetu.gov.in/media/before.jpg",
  "afterMediaUrl": "https://storage.sadaksetu.gov.in/media/after.jpg"
}
```

**Response:**
```json
{
  "verificationId": "e2c395ab-b43a-4467-93fb-628dcfba29a1",
  "result": "VERIFIED",
  "confidence": 0.93,
  "reason": "Visual delta analysis indicates pothole depression has been filled and asphalt leveled to grade. Defect eradicated.",
  "visualSimilarity": 0.88,
  "defectReduction": 96.5,
  "analysisTimeMs": 310.0
}
```
