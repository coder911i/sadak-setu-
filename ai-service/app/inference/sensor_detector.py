"""
Sensor-based Anomaly Detection for Sadak Setu

This module implements real-time sensor data inference using the trained ML models
for road anomaly detection. It processes accelerometer and gyroscope data to
classify road events and estimate pothole characteristics.
"""

import numpy as np
import joblib
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import logging

try:
    from scipy.fft import fft, fftfreq
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class SensorInferenceResult:
    """Result of sensor-based anomaly detection"""
    device_id: str
    timestamp: str
    latitude: float
    longitude: float
    event_type: str
    severity: Optional[str]
    estimated_depth_cm: Optional[float]
    confidence: float
    model_version: str


class SensorDetector:
    """
    Sensor-based anomaly detector using trained ML models.
    
    This class loads the trained models and provides inference capabilities
    for real-time road anomaly detection from sensor data.
    """
    
    def __init__(self, model_path: str = 'ai-service/models/sensor_anomaly'):
        """
        Initialize the sensor detector with trained models.
        
        Args:
            model_path: Path to the directory containing trained models
        """
        self.model_path = model_path
        self.model_version = "1.0.0"
        
        # Load models and preprocessors
        self.event_classifier = None
        self.severity_classifier = None
        self.depth_regressor = None
        self.scaler = None
        self.label_encoders = None
        self.feature_names = None
        
        self._load_models()
    
    def _load_models(self):
        """Load trained models and preprocessors from disk."""
        try:
            model_dir = Path(self.model_path)
            
            # Load models
            self.event_classifier = joblib.load(model_dir / 'event_classifier.pkl')
            self.severity_classifier = joblib.load(model_dir / 'severity_classifier.pkl')
            self.depth_regressor = joblib.load(model_dir / 'depth_regressor.pkl')
            
            # Load preprocessors
            self.scaler = joblib.load(model_dir / 'scaler.pkl')
            self.label_encoders = joblib.load(model_dir / 'label_encoders.pkl')
            self.feature_names = joblib.load(model_dir / 'feature_names.pkl')
            
            # Load metadata
            try:
                import json
                with open(model_dir / 'training_metadata.json', 'r') as f:
                    metadata = json.load(f)
                    self.model_version = metadata.get('training_info', {}).get('model_version', '1.0.0')
            except Exception as e:
                logger.warning(f"Could not load model metadata: {e}")
            
            logger.info(f"Loaded sensor models from {self.model_path}")
            logger.info(f"Model version: {self.model_version}")
            
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            raise
    
    def extract_features_from_window(
        self,
        sensor_window: List[Dict],
        speed_kmph: float
    ) -> np.ndarray:
        """
        Extract features from sensor window for inference.
        
        Args:
            sensor_window: List of sensor readings with accel_x/y/z, gyro_x/y/z
            speed_kmph: Vehicle speed in km/h
            
        Returns:
            Feature vector for ML inference
        """
        # Convert to numpy array
        sensor_data = np.array([
            [
                reading.get('accel_x', 0),
                reading.get('accel_y', 0),
                reading.get('accel_z', 9.8),  # Default to gravity
                reading.get('gyro_x', 0),
                reading.get('gyro_y', 0),
                reading.get('gyro_z', 0)
            ]
            for reading in sensor_window
        ])
        
        if len(sensor_data) == 0:
            logger.warning("Empty sensor window")
            return np.zeros(len(self.feature_names))
        
        # Compute basic features
        accel = sensor_data[:, :3]
        gyro = sensor_data[:, 3:]
        
        # Magnitude features
        accel_mag = np.linalg.norm(accel, axis=1)
        gyro_mag = np.linalg.norm(gyro, axis=1)
        
        # Statistical features
        accel_mean = np.mean(accel_mag)
        accel_std = np.std(accel_mag)
        gyro_mean = np.mean(gyro_mag)
        gyro_std = np.std(gyro_mag)
        
        # Vertical acceleration
        vertical_accel = np.mean(accel[:, 2])
        
        # Vibration features
        vibration_rms = np.sqrt(np.mean((accel_mag - 9.8) ** 2))
        vibration_peak = np.max(np.abs(accel_mag - 9.8))
        
        # Jerk (rate of change)
        if len(accel) > 1:
            jerk = np.diff(accel, axis=0)
            jerk_rms = np.sqrt(np.mean(jerk ** 2))
        else:
            jerk_rms = 0.0
        
        # Frequency domain (simplified)
        if len(accel_mag) > 10 and SCIPY_AVAILABLE:
            try:
                fft_vals = fft(accel_mag - np.mean(accel_mag))
                freqs = fftfreq(len(accel_mag), d=1/50.0)  # Assume 50 Hz
                positive_freqs = freqs[freqs > 0]
                positive_fft = np.abs(fft_vals[freqs > 0])
                if len(positive_fft) > 0:
                    dominant_freq = positive_freqs[np.argmax(positive_fft)]
                else:
                    dominant_freq = 0.0
            except Exception:
                dominant_freq = 0.0
        else:
            dominant_freq = 0.0
        
        # Additional features
        accel_std_combined = np.sqrt(np.sum(np.var(accel, axis=0)))
        gyro_std_combined = np.sqrt(np.sum(np.var(gyro, axis=0)))
        accel_peak_to_peak = np.max(accel_mag) - np.min(accel_mag)
        
        # Speed-adjusted impact
        speed_factor = speed_kmph / 40.0 if speed_kmph > 0 else 1.0
        speed_adjusted_impact = vibration_peak / speed_factor
        
        # Event duration
        event_duration_ms = len(sensor_window) * 20  # Assume 50 Hz sampling
        
        # Create feature vector in the correct order
        feature_dict = {
            'accel_magnitude': accel_mean,
            'gyro_magnitude': gyro_mean,
            'vertical_acceleration': vertical_accel,
            'speed_kmph': speed_kmph,
            'vibration_rms': vibration_rms,
            'vibration_peak': vibration_peak,
            'jerk_rms': jerk_rms,
            'frequency_dominant_hz': dominant_freq,
            'accel_std': accel_std_combined,
            'gyro_std': gyro_std_combined,
            'accel_peak_to_peak': accel_peak_to_peak,
            'speed_adjusted_impact': speed_adjusted_impact,
            'event_duration_ms': event_duration_ms
        }
        
        # Ensure all required features are present
        feature_vector = np.array([
            feature_dict.get(name, 0.0) for name in self.feature_names
        ])
        
        return feature_vector
    
    def predict(
        self,
        device_id: str,
        timestamp: str,
        latitude: float,
        longitude: float,
        speed_kmph: float,
        sensor_window: List[Dict]
    ) -> SensorInferenceResult:
        """
        Perform sensor-based anomaly detection.
        
        Args:
            device_id: Device identifier
            timestamp: ISO timestamp string
            latitude: GPS latitude
            longitude: GPS longitude
            speed_kmph: Vehicle speed in km/h
            sensor_window: List of sensor readings
            
        Returns:
            SensorInferenceResult with detection results
        """
        try:
            # Extract features
            features = self.extract_features_from_window(sensor_window, speed_kmph)
            
            # Scale features
            features_scaled = self.scaler.transform(features.reshape(1, -1))
            
            # Predict event class
            event_class_encoded = self.event_classifier.predict(features_scaled)[0]
            event_class = self.label_encoders['event_class'].inverse_transform([event_class_encoded])[0]
            
            # Get confidence (probability of predicted class)
            event_probabilities = self.event_classifier.predict_proba(features_scaled)[0]
            confidence = float(event_probabilities[event_class_encoded])
            
            # Initialize result
            severity = None
            estimated_depth_cm = None
            
            # If pothole detected, predict severity and depth
            if event_class in ['POTHOLE', 'SEVERE_POTHOLE']:
                # Predict severity
                severity_encoded = self.severity_classifier.predict(features_scaled)[0]
                severity = self.label_encoders['severity'].inverse_transform([severity_encoded])[0]
                
                # Predict depth
                estimated_depth_cm = float(self.depth_regressor.predict(features_scaled)[0])
            
            return SensorInferenceResult(
                device_id=device_id,
                timestamp=timestamp,
                latitude=latitude,
                longitude=longitude,
                event_type=event_class,
                severity=severity,
                estimated_depth_cm=estimated_depth_cm,
                confidence=confidence,
                model_version=self.model_version
            )
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            # Return safe default
            return SensorInferenceResult(
                device_id=device_id,
                timestamp=timestamp,
                latitude=latitude,
                longitude=longitude,
                event_type="NORMAL",
                severity=None,
                estimated_depth_cm=None,
                confidence=0.0,
                model_version=self.model_version
            )
    
    def predict_batch(
        self,
        predictions: List[Dict]
    ) -> List[SensorInferenceResult]:
        """
        Perform batch prediction on multiple sensor windows.
        
        Args:
            predictions: List of prediction dictionaries
            
        Returns:
            List of SensorInferenceResult objects
        """
        results = []
        for pred in predictions:
            result = self.predict(
                device_id=pred['device_id'],
                timestamp=pred['timestamp'],
                latitude=pred['latitude'],
                longitude=pred['longitude'],
                speed_kmph=pred['speed_kmph'],
                sensor_window=pred['sensor_window']
            )
            results.append(result)
        
        return results


# Global detector instance
_detector_instance = None


def get_sensor_detector(model_path: str = 'ai-service/models/sensor_anomaly') -> SensorDetector:
    """
    Get or create the global sensor detector instance.
    
    Args:
        model_path: Path to trained models
        
    Returns:
        SensorDetector instance
    """
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = SensorDetector(model_path)
    return _detector_instance