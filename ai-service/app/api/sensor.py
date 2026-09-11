"""
Sensor Inference API Endpoints

This module provides REST API endpoints for sensor-based road anomaly detection.
It integrates with the trained ML models to provide real-time inference capabilities.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import time
import uuid
import logging

from app.inference.sensor_detector import get_sensor_detector, SensorInferenceResult

logger = logging.getLogger(__name__)

router = APIRouter()


class SensorReading(BaseModel):
    """Individual sensor reading"""
    accel_x: float = Field(default=0.0, description="X-axis acceleration (m/s²)")
    accel_y: float = Field(default=0.0, description="Y-axis acceleration (m/s²)")
    accel_z: float = Field(default=9.8, description="Z-axis acceleration (m/s²)")
    gyro_x: float = Field(default=0.0, description="X-axis gyroscope (rad/s)")
    gyro_y: float = Field(default=0.0, description="Y-axis gyroscope (rad/s)")
    gyro_z: float = Field(default=0.0, description="Z-axis gyroscope (rad/s)")


class SensorInferenceRequest(BaseModel):
    """Request for sensor-based anomaly detection"""
    device_id: str = Field(..., description="Device identifier")
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    latitude: float = Field(..., description="GPS latitude")
    longitude: float = Field(..., description="GPS longitude")
    speed_kmph: float = Field(default=0.0, description="Vehicle speed in km/h")
    sensor_window: List[SensorReading] = Field(
        ...,
        description="Window of sensor readings for analysis"
    )


class SensorInferenceResponse(BaseModel):
    """Response from sensor-based anomaly detection"""
    device_id: str
    timestamp: str
    latitude: float
    longitude: float
    event_type: str
    severity: Optional[str]
    estimated_depth_cm: Optional[float]
    confidence: float
    model_version: str
    processing_time_ms: float
    request_id: str


@router.post("/predict", response_model=SensorInferenceResponse)
async def predict_sensor_anomaly(request: SensorInferenceRequest):
    """
    Predict road anomaly from sensor data.
    
    This endpoint processes a window of accelerometer and gyroscope readings
    to classify road events and estimate pothole characteristics.
    
    **Event Types:**
    - NORMAL: Normal driving conditions
    - SPEED_BREAKER: Speed breaker or speed bump
    - POTHOLE: Pothole impact
    - ROUGH_PATCH: Rough road surface
    - SEVERE_POTHOLE: Deep pothole with severe impact
    - OTHER_ANOMALY: Unclassified anomaly
    
    **Severity Levels (for potholes):**
    - LOW: Minor defect (< 3 cm depth)
    - MEDIUM: Moderate defect (3-6 cm depth)
    - HIGH: Significant defect (6-10 cm depth)
    - CRITICAL: Severe defect (> 10 cm depth)
    """
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        logger.info(f"Processing sensor inference request {request_id} for device {request.device_id}")
        
        # Get detector instance
        detector = get_sensor_detector()
        
        # Convert sensor readings to dictionary format
        sensor_window = [
            {
                'accel_x': reading.accel_x,
                'accel_y': reading.accel_y,
                'accel_z': reading.accel_z,
                'gyro_x': reading.gyro_x,
                'gyro_y': reading.gyro_y,
                'gyro_z': reading.gyro_z
            }
            for reading in request.sensor_window
        ]
        
        # Perform prediction
        result = detector.predict(
            device_id=request.device_id,
            timestamp=request.timestamp,
            latitude=request.latitude,
            longitude=request.longitude,
            speed_kmph=request.speed_kmph,
            sensor_window=sensor_window
        )
        
        processing_time_ms = (time.time() - start_time) * 1000
        
        logger.info(
            f"Prediction complete: {result.event_type} "
            f"(confidence: {result.confidence:.3f}, "
            f"time: {processing_time_ms:.2f}ms)"
        )
        
        return SensorInferenceResponse(
            device_id=result.device_id,
            timestamp=result.timestamp,
            latitude=result.latitude,
            longitude=result.longitude,
            event_type=result.event_type,
            severity=result.severity,
            estimated_depth_cm=result.estimated_depth_cm,
            confidence=result.confidence,
            model_version=result.model_version,
            processing_time_ms=processing_time_ms,
            request_id=request_id
        )
        
    except Exception as e:
        processing_time_ms = (time.time() - start_time) * 1000
        logger.error(f"Sensor inference failed: {e}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Sensor inference failed: {str(e)}"
        )


@router.post("/predict/batch")
async def predict_sensor_anomaly_batch(requests: List[SensorInferenceRequest]):
    """
    Batch prediction for multiple sensor windows.
    
    This endpoint processes multiple sensor windows in a single request
    for improved efficiency when analyzing continuous telemetry streams.
    """
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        logger.info(f"Processing batch sensor inference {request_id} with {len(requests)} requests")
        
        # Get detector instance
        detector = get_sensor_detector()
        
        # Convert all requests to prediction format
        predictions = []
        for req in requests:
            sensor_window = [
                {
                    'accel_x': reading.accel_x,
                    'accel_y': reading.accel_y,
                    'accel_z': reading.accel_z,
                    'gyro_x': reading.gyro_x,
                    'gyro_y': reading.gyro_y,
                    'gyro_z': reading.gyro_z
                }
                for reading in req.sensor_window
            ]
            
            predictions.append({
                'device_id': req.device_id,
                'timestamp': req.timestamp,
                'latitude': req.latitude,
                'longitude': req.longitude,
                'speed_kmph': req.speed_kmph,
                'sensor_window': sensor_window
            })
        
        # Perform batch prediction
        results = detector.predict_batch(predictions)
        
        processing_time_ms = (time.time() - start_time) * 1000
        
        logger.info(
            f"Batch prediction complete: {len(results)} results "
            f"(time: {processing_time_ms:.2f}ms)"
        )
        
        # Convert results to response format
        responses = []
        for result in results:
            responses.append({
                'device_id': result.device_id,
                'timestamp': result.timestamp,
                'latitude': result.latitude,
                'longitude': result.longitude,
                'event_type': result.event_type,
                'severity': result.severity,
                'estimated_depth_cm': result.estimated_depth_cm,
                'confidence': result.confidence,
                'model_version': result.model_version
            })
        
        return {
            'request_id': request_id,
            'processing_time_ms': processing_time_ms,
            'total_predictions': len(results),
            'results': responses
        }
        
    except Exception as e:
        processing_time_ms = (time.time() - start_time) * 1000
        logger.error(f"Batch sensor inference failed: {e}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Batch sensor inference failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for sensor inference service"""
    try:
        detector = get_sensor_detector()
        return {
            'status': 'healthy',
            'model_version': detector.model_version,
            'model_loaded': detector.event_classifier is not None
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            'status': 'unhealthy',
            'error': str(e)
        }