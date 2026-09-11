/**
 * Sensor ML Client for Sadak Setu Backend
 * 
 * This module handles communication with the AI service's sensor inference endpoint
 * for real-time road anomaly detection from IoT telemetry data.
 */

import { config } from '../../config';
import { logger } from '../../utils/logger';

export interface SensorReading {
  accel_x: number;
  accel_y: number;
  accel_z: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
}

export interface SensorInferenceRequest {
  device_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed_kmph: number;
  sensor_window: SensorReading[];
}

export interface SensorInferenceResponse {
  device_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  event_type: string;
  severity: string | null;
  estimated_depth_cm: number | null;
  confidence: number;
  model_version: string;
  processing_time_ms: number;
  request_id: string;
}

export interface SensorBatchRequest {
  requests: SensorInferenceRequest[];
}

export interface SensorBatchResponse {
  request_id: string;
  processing_time_ms: number;
  total_predictions: number;
  results: SensorInferenceResponse[];
}

export class SensorMLClient {
  private mode: 'mock' | 'live';
  private serviceUrl: string;
  private confidenceThreshold: number;
  private autoComplaintEnabled: boolean;

  constructor() {
    this.mode = config.sensor?.mode || 'mock';
    this.serviceUrl = config.sensor?.serviceUrl || 'http://localhost:8000';
    this.confidenceThreshold = config.sensor?.confidenceThreshold || 0.85;
    this.autoComplaintEnabled = config.sensor?.autoComplaintEnabled || false;
  }

  /**
   * Perform sensor-based anomaly detection
   */
  async predictAnomaly(request: SensorInferenceRequest): Promise<SensorInferenceResponse> {
    if (this.mode === 'mock') {
      logger.info('Running Sensor ML in MOCK mode', { deviceId: request.device_id });
      return this.mockPredictAnomaly(request);
    }

    // LIVE mode: call the Python AI microservice
    logger.info(`[LIVE] Sending sensor data to ${this.serviceUrl}/sensor/predict`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.sensor?.timeoutMs || 20000);

    let response: Response;
    try {
      response = await fetch(`${this.serviceUrl}/sensor/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      const msg = `[LIVE] Sensor ML service unreachable at ${this.serviceUrl}: ${err.message}`;
      logger.error(msg);
      throw { statusCode: 503, message: msg, code: 'SENSOR_ML_SERVICE_UNAVAILABLE' };
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const msg = `[LIVE] Sensor ML service returned HTTP ${response.status}: ${body}`;
      logger.error(msg);
      throw { statusCode: 502, message: msg, code: 'SENSOR_ML_SERVICE_ERROR' };
    }

    return (await response.json()) as SensorInferenceResponse;
  }

  /**
   * Batch prediction for multiple sensor windows
   */
  async predictAnomalyBatch(requests: SensorInferenceRequest[]): Promise<SensorBatchResponse> {
    if (this.mode === 'mock') {
      logger.info('Running Sensor ML batch prediction in MOCK mode');
      return this.mockPredictAnomalyBatch(requests);
    }

    logger.info(`[LIVE] Sending batch sensor data to ${this.serviceUrl}/sensor/predict/batch`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.sensor?.timeoutMs || 30000);

    let response: Response;
    try {
      response = await fetch(`${this.serviceUrl}/sensor/predict/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requests),
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      const msg = `[LIVE] Sensor ML batch service unreachable: ${err.message}`;
      logger.error(msg);
      throw { statusCode: 503, message: msg, code: 'SENSOR_ML_SERVICE_UNAVAILABLE' };
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const msg = `[LIVE] Sensor ML batch service returned HTTP ${response.status}: ${body}`;
      logger.error(msg);
      throw { statusCode: 502, message: msg, code: 'SENSOR_ML_SERVICE_ERROR' };
    }

    return (await response.json()) as SensorBatchResponse;
  }

  /**
   * Check if prediction should trigger automatic complaint creation
   */
  shouldCreateComplaint(response: SensorInferenceResponse): boolean {
    if (!this.autoComplaintEnabled) {
      return false;
    }

    // Check confidence threshold
    if (response.confidence < this.confidenceThreshold) {
      logger.info('Prediction confidence below threshold', {
        confidence: response.confidence,
        threshold: this.confidenceThreshold
      });
      return false;
    }

    // Check if it's a pothole event
    if (response.event_type !== 'POTHOLE' && response.event_type !== 'SEVERE_POTHOLE') {
      return false;
    }

    // Check GPS availability
    if (response.latitude === 0 || response.longitude === 0) {
      logger.warn('GPS coordinates missing for complaint creation');
      return false;
    }

    return true;
  }

  /**
   * Mock prediction for development/testing
   */
  private mockPredictAnomaly(request: SensorInferenceRequest): SensorInferenceResponse {
    // Simulate realistic inference results
    const eventTypes = ['NORMAL', 'POTHOLE', 'SPEED_BREAKER', 'ROUGH_PATCH'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    const severity = eventType === 'POTHOLE' ? ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] : null;
    const estimatedDepth = eventType === 'POTHOLE' ? Math.random() * 10 + 1 : null;
    const confidence = 0.7 + Math.random() * 0.3;

    return {
      device_id: request.device_id,
      timestamp: request.timestamp,
      latitude: request.latitude,
      longitude: request.longitude,
      event_type: eventType,
      severity,
      estimated_depth_cm: estimatedDepth,
      confidence,
      model_version: 'mock-1.0.0',
      processing_time_ms: Math.random() * 50 + 10,
      request_id: `mock-${Date.now()}`
    };
  }

  /**
   * Mock batch prediction
   */
  private mockPredictAnomalyBatch(requests: SensorInferenceRequest[]): SensorBatchResponse {
    const results = requests.map(req => this.mockPredictAnomaly(req));
    
    return {
      request_id: `mock-batch-${Date.now()}`,
      processing_time_ms: Math.random() * 100 + 20,
      total_predictions: results.length,
      results
    };
  }

  /**
   * Health check for sensor ML service
   */
  async healthCheck(): Promise<{ status: string; model_version?: string; model_loaded?: boolean }> {
    if (this.mode === 'mock') {
      return {
        status: 'healthy',
        model_version: 'mock-1.0.0',
        model_loaded: true
      };
    }

    try {
      const response = await fetch(`${this.serviceUrl}/sensor/health`);
      if (response.ok) {
        return await response.json();
      }
      return { status: 'unhealthy' };
    } catch (error) {
      logger.error('Sensor ML health check failed', error);
      return { status: 'unhealthy' };
    }
  }
}

export const sensorMLClient = new SensorMLClient();