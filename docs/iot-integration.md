# Sadak Setu — IoT & Sensor Telemetry Integration

Sadak Setu pairs computer vision with physical vibration telematics from IoT nodes (e.g. ESP32 with MPU6050 accelerometer/gyroscope, or mobile phone IMU sensors).

## The Sensor + Vision Fusion Model
1. **Camera**: Detects the optical presence and perimeter of potholes and cracks.
2. **GPS**: Records exact latitude, longitude, and chainage distance.
3. **IMU Accelerometer**: Measures vertical shock (Z-axis) and lateral disturbances (X/Y-axes) as vehicles transit over defects.

```
       [ Optical Defect ] + [ GPS Coordinates ] + [ Vibration Spike ]
                              │
                              ▼
           [ Fusion Service: Temporal & Spatial Association ]
                              │
                              ▼
    [ Corroborated Road Defect + Input to Health Scoring Engine ]
```

## Device Ingestion API

```http
POST /api/v1/devices/:id/telemetry
Content-Type: application/json

{
  "inspectionId": "uuid-optional",
  "latitude": 27.4925,
  "longitude": 77.6739,
  "speed": 42.0,
  "accelerometerX": 2.8,
  "accelerometerY": -1.9,
  "accelerometerZ": 14.8,
  "gyroX": 0.8,
  "gyroY": -1.2,
  "gyroZ": 0.3
}
```

## Vibration Normalization
The backend calculates instantaneous vibration intensity relative to 1G gravity ($9.8\text{ m/s}^2$):
$$\text{Vibration} = \left|\sqrt{A_x^2 + A_y^2 + A_z^2} - 9.8\right|$$

Vibration values $> 2.0\text{ m/s}^2$ indicate road surface anomalies, and values $> 4.5\text{ m/s}^2$ indicate deep potholes or severe corrugation.
