// src/config/intelligence.ts

/**
 * Central configuration for intelligence pipeline thresholds and feature windows.
 * All values are tunable via environment variables if needed.
 */
export const IntelligenceConfig = {
  // Feature extraction thresholds (example values, can be overridden)
  ACCELERATION_MAGNITUDE_THRESHOLD: Number(process.env.ACCEL_MAG_THRESHOLD) || 2.0, // m/s²
  GYRO_MAGNITUDE_THRESHOLD: Number(process.env.GYRO_MAG_THRESHOLD) || 0.5, // rad/s
  VIBRATION_INTENSITY_THRESHOLD: Number(process.env.VIBRATION_THRESHOLD) || 0.3, // arbitrary units
  ULTRASONIC_DIFF_THRESHOLD: Number(process.env.ULTRASONIC_DIFF_THRESHOLD) || 0.2, // meters

  // Time‑window settings for statistical features
  WINDOW_SIZE_SECONDS: Number(process.env.TELEMETRY_WINDOW_SIZE) || 10, // seconds
  WINDOW_STEP_SECONDS: Number(process.env.TELEMETRY_WINDOW_STEP) || 5, // seconds

  // Flags to enable/disable specific calculations
  ENABLE_RMS: process.env.ENABLE_RMS !== 'false',
  ENABLE_VARIANCE: process.env.ENABLE_VARIANCE !== 'false',
  ENABLE_MEDIAN: process.env.ENABLE_MEDIAN !== 'false',
};
