# Data Dictionary - Synthetic Sensor Dataset

## Overview
This document describes the synthetic sensor dataset generated for training the Sadak Setu ML pipeline for road anomaly detection. The data simulates vehicle-mounted IoT sensor readings (accelerometer and gyroscope) from vehicles traveling over different road surfaces and conditions.

## Dataset Information
- **Total Observations**: 100,000 (configurable)
- **Number of Devices**: 30 (configurable)
- **Number of Routes**: 50
- **Sampling Rate**: 50 Hz (configurable)
- **Generation Date**: 2026-09-11
- **Random Seed**: 42 (for reproducibility)

## Important Disclaimer
⚠️ **This is synthetic data generated for ML model development and testing. It does not represent real-world measurements and should not be used for production decision-making without validation against actual field data.**

---

## Field Descriptions

### Core Identifiers

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `timestamp` | string | ISO 8601 timestamp of the observation | "2026-09-11 14:40:20.623237" |
| `device_id` | string | Unique identifier for the IoT device | "device_0021" |
| `route_id` | string | Unique identifier for the GPS route | "route_0012" |
| `event_id` | string | Unique identifier for the event window | "event_000001" |

### Location & Motion

| Field | Type | Description | Example | Range |
|-------|------|-------------|---------|-------|
| `latitude` | float | GPS latitude coordinate | 28.6139 | -90 to 90 |
| `longitude` | float | GPS longitude coordinate | 77.2090 | -180 to 180 |
| `speed_kmph` | float | Vehicle speed in km/h | 42.5 | 0 to 120 |
| `road_type` | string | Type of road surface | "URBAN" | See Road Types below |
| `weather` | string | Environmental condition | "CLEAR" | See Weather Types below |

### Event Classification

| Field | Type | Description | Possible Values |
|-------|------|-------------|-----------------|
| `event_class` | string | Road event classification | NORMAL, SPEED_BREAKER, POTHOLE, ROUGH_PATCH, SEVERE_POTHOLE, OTHER_ANOMALY |
| `severity` | string | Pothole severity (only for pothole events) | LOW, MEDIUM, HIGH, CRITICAL |
| `pothole_depth_cm` | float | Pothole depth in centimeters (ground truth) | 1.5 to 25.0 |
| `pothole_length_cm` | float | Pothole length in centimeters (ground truth) | 2.0 to 75.0 |
| `pothole_width_cm` | float | Pothole width in centimeters (ground truth) | 1.5 to 60.0 |

### Raw Sensor Statistics (Windowed)

| Field | Type | Description | Typical Range |
|-------|------|-------------|---------------|
| `accel_x_mean` | float | Mean X-axis acceleration (m/s²) | -2.0 to 2.0 |
| `accel_y_mean` | float | Mean Y-axis acceleration (m/s²) | -2.0 to 2.0 |
| `accel_z_mean` | float | Mean Z-axis acceleration (m/s²) | 8.0 to 12.0 |
| `accel_x_std` | float | Standard deviation of X-axis acceleration | 0.0 to 3.0 |
| `accel_y_std` | float | Standard deviation of Y-axis acceleration | 0.0 to 3.0 |
| `accel_z_std` | float | Standard deviation of Z-axis acceleration | 0.0 to 5.0 |
| `gyro_x_mean` | float | Mean X-axis gyroscope reading (rad/s) | -0.5 to 0.5 |
| `gyro_y_mean` | float | Mean Y-axis gyroscope reading (rad/s) | -0.5 to 0.5 |
| `gyro_z_mean` | float | Mean Z-axis gyroscope reading (rad/s) | -0.5 to 0.5 |
| `gyro_x_std` | float | Standard deviation of X-axis gyroscope | 0.0 to 1.0 |
| `gyro_y_std` | float | Standard deviation of Y-axis gyroscope | 0.0 to 1.0 |
| `gyro_z_std` | float | Standard deviation of Z-axis gyroscope | 0.0 to 1.0 |

### Engineered Features

| Field | Type | Description | Typical Range | Formula |
|-------|------|-------------|---------------|---------|
| `vibration_rms` | float | Root mean square of vibration intensity | 0.0 to 8.0 | √(mean((accel_mag - 9.8)²)) |
| `vibration_peak` | float | Peak vibration intensity | 0.0 to 15.0 | max(|accel_mag - 9.8|) |
| `jerk_rms` | float | Root mean square of jerk (acceleration change rate) | 0.0 to 50.0 | √(mean(jerk²)) |
| `frequency_dominant_hz` | float | Dominant frequency in vibration signal | 0.0 to 25.0 | FFT peak frequency |
| `event_duration_ms` | float | Duration of the event window in milliseconds | 400 to 2000 | window_samples × 1000 / sampling_rate |
| `sampling_rate_hz` | float | Sensor sampling frequency | 47.5 to 52.5 | Device-specific |

---

## Enumerated Values

### Road Types
- **URBAN**: City streets with moderate traffic
- **RESIDENTIAL**: Residential areas with lower speeds
- **HIGHWAY**: High-speed roads with smooth surfaces
- **RURAL**: Rural roads with variable conditions
- **ARTERIAL**: Major connecting roads
- **SERVICE_ROAD**: Access roads with lower priority

### Weather Conditions
- **CLEAR**: Normal driving conditions
- **WET**: Wet road surface (recent rain)
- **RAIN**: Active rainfall
- **DUSTY**: Dry, dusty conditions

### Event Classes
- **NORMAL**: Normal driving with minimal vibration
- **SPEED_BREAKER**: Speed breaker with characteristic approach-impact-recovery pattern
- **POTHOLE**: Pothole impact with sharp vertical disturbance
- **ROUGH_PATCH**: Extended area of moderate vibration
- **SEVERE_POTHOLE**: Deep pothole with strong impact and recovery oscillation
- **OTHER_ANOMALY**: Unclassified road anomaly

### Severity Levels
- **LOW**: Minor defects (depth < 3 cm)
- **MEDIUM**: Moderate defects (depth 3-6 cm)
- **HIGH**: Significant defects (depth 6-10 cm)
- **CRITICAL**: Severe defects (depth > 10 cm)

---

## Data Characteristics

### Temporal Structure
- Each observation represents a time window of sensor data
- Windows include pre-event context, event, and post-event context
- Consecutive observations have temporal continuity
- Timestamps advance by 100ms between observations

### Spatial Structure
- GPS coordinates follow realistic road trajectories
- Local spatial continuity is maintained
- GPS noise is added (typical accuracy: 5-10 meters)
- Occasional GPS drift is simulated (5% probability)

### Device Characteristics
- Each device has unique sensor bias and noise characteristics
- Devices have slightly different sampling rates
- Calibration offsets vary between devices
- This heterogeneity ensures model generalization

### Speed Dependency
- Same physical events generate different signals at different speeds
- Speed scenarios: 10, 20, 40, 60, 80 km/h
- Impact intensity scales with speed
- Higher speeds produce sharper but shorter-duration impacts

### Class Distribution
The synthetic dataset follows realistic class distributions:
- **NORMAL**: 75% (most common)
- **ROUGH_PATCH**: 10%
- **SPEED_BREAKER**: 8%
- **POTHOLE**: 5%
- **SEVERE_POTHOLE**: 1.5%
- **OTHER_ANOMALY**: 0.5%

### Pothole Depth Distribution
Pothole depths follow a realistic distribution (more shallow than deep):
- **1-3 cm**: 60% of potholes
- **3-6 cm**: 30% of potholes
- **6-10 cm**: 8% of potholes
- **10+ cm**: 2% of potholes

---

## Usage Guidelines

### Training ML Models
1. **Data Splitting**: Group by `event_id`, `route_id`, or `device_id` to prevent leakage
2. **Feature Selection**: Use engineered features (`vibration_rms`, `jerk_rms`, etc.) rather than raw sensor statistics
3. **Class Balancing**: Consider class imbalance (NORMAL is 75% of data)
4. **Cross-Validation**: Use device-wise or route-wise cross-validation

### Model Development
1. **Baseline Models**: Start with simple models (Random Forest, Logistic Regression)
2. **Feature Engineering**: Experiment with additional time-domain and frequency-domain features
3. **Hyperparameter Tuning**: Use validation set for tuning
4. **Ensemble Methods**: Consider ensemble models for improved performance

### Inference
1. **Real-time Processing**: Process sensor windows in real-time using the same sampling rate
2. **Device Calibration**: Account for device-specific bias and noise
3. **Speed Adaptation**: Consider vehicle speed in interpretation
4. **Confidence Thresholds**: Set appropriate confidence thresholds for deployment

---

## Limitations

### Synthetic Data Limitations
- Does not capture real-world complexity and variability
- May not represent all possible road conditions
- Sensor noise models are simplified
- GPS trajectories are idealized
- Weather effects are not fully modeled

### Generalization Considerations
- Models trained on synthetic data may not perform well on real data
- Real-world sensor characteristics may differ
- Actual road conditions may be more complex
- Vehicle suspension characteristics vary
- Environmental factors are simplified

### Recommended Validation
- Validate models with real-world data before deployment
- Perform field testing with actual IoT devices
- Calibrate models for specific device types
- Monitor model performance in production
- Continuously update models with new data

---

## File Structure

```
ai-service/data/
├── raw/
│   └── synthetic_sensor_data.csv          # Full dataset (100,000 observations)
├── processed/
│   ├── clean_sensor_data.csv             # Cleaned and validated data
│   └── features.csv                      # Engineered features for ML
├── metadata/
│   └── dataset_metadata.json             # Dataset statistics and metadata
├── samples/
│   └── sample_sensor_data.csv            # Sample dataset (1,000 observations)
└── README/
    └── data_dictionary.md                # This file
```

---

## Contact & Support

For questions about the synthetic data generation process or ML pipeline development, refer to the main project documentation or contact the development team.

**Last Updated**: 2026-09-11
**Version**: 1.0.0