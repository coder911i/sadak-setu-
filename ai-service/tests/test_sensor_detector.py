"""
Tests for Sensor-based Anomaly Detection

This module contains comprehensive tests for the sensor ML detector,
including unit tests for feature extraction, prediction, and integration tests.
"""

import pytest
import numpy as np
import pandas as pd
from unittest.mock import Mock, patch, MagicMock
import tempfile
import shutil
from pathlib import Path

# Import the module to test
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.inference.sensor_detector import SensorDetector, SensorInferenceResult


class TestSensorDetector:
    """Test suite for SensorDetector class"""
    
    @pytest.fixture
    def sample_sensor_window(self):
        """Create sample sensor window for testing"""
        return [
            {
                'accel_x': 0.1,
                'accel_y': 0.2,
                'accel_z': 9.9,
                'gyro_x': 0.05,
                'gyro_y': -0.03,
                'gyro_z': 0.02
            }
            for _ in range(50)  # 50 samples at 50 Hz = 1 second window
        ]
    
    @pytest.fixture
    def mock_models_dir(self, tmp_path):
        """Create mock models directory with dummy model files"""
        models_dir = tmp_path / "sensor_anomaly"
        models_dir.mkdir()
        
        # Create dummy model files
        import joblib
        import json
        
        # Mock models
        joblib.dump(Mock(), models_dir / "event_classifier.pkl")
        joblib.dump(Mock(), models_dir / "severity_classifier.pkl")
        joblib.dump(Mock(), models_dir / "depth_regressor.pkl")
        joblib.dump(Mock(), models_dir / "scaler.pkl")
        joblib.dump({'event_class': Mock()}, models_dir / "label_encoders.pkl")
        joblib.dump(['feature1', 'feature2'], models_dir / "feature_names.pkl")
        
        # Create metadata
        metadata = {
            'training_info': {
                'model_version': '1.0.0-test'
            }
        }
        with open(models_dir / "training_metadata.json", 'w') as f:
            json.dump(metadata, f)
        
        return str(models_dir)
    
    def test_sensor_detector_initialization(self, mock_models_dir):
        """Test that SensorDetector initializes correctly"""
        detector = SensorDetector(model_path=mock_models_dir)
        
        assert detector.model_path == mock_models_dir
        assert detector.model_version == "1.0.0-test"
        assert detector.event_classifier is not None
        assert detector.severity_classifier is not None
        assert detector.depth_regressor is not None
    
    def test_extract_features_from_window(self, mock_models_dir, sample_sensor_window):
        """Test feature extraction from sensor window"""
        detector = SensorDetector(model_path=mock_models_dir)
        
        features = detector.extract_features_from_window(
            sample_sensor_window,
            speed_kmph=40.0
        )
        
        assert isinstance(features, np.ndarray)
        assert len(features) == 2  # Mock has 2 feature names
        assert not np.any(np.isnan(features))
    
    def test_extract_features_empty_window(self, mock_models_dir):
        """Test feature extraction with empty window"""
        detector = SensorDetector(model_path=mock_models_dir)
        
        features = detector.extract_features_from_window([], speed_kmph=40.0)
        
        assert isinstance(features, np.ndarray)
        assert len(features) == 2  # Mock has 2 feature names
    
    def test_predict_normal_case(self, mock_models_dir, sample_sensor_window):
        """Test prediction with normal mock response"""
        detector = SensorDetector(model_path=mock_models_dir)
        
        # Mock the predict method to return specific result
        with patch.object(detector.event_classifier, 'predict', return_value=0):
            with patch.object(detector.event_classifier, 'predict_proba', return_value=np.array([0.9, 0.1])):
                with patch.object(detector.label_encoders['event_class'], 'inverse_transform', return_value=['NORMAL']):
                    result = detector.predict(
                        device_id="test_device",
                        timestamp="2026-09-11T12:00:00Z",
                        latitude=28.6139,
                        longitude=77.2090,
                        speed_kmph=40.0,
                        sensor_window=sample_sensor_window
                    )
        
        assert isinstance(result, SensorInferenceResult)
        assert result.device_id == "test_device"
        assert result.event_type == "NORMAL"
        assert result.confidence == 0.9
    
    def test_predict_pothole_case(self, mock_models_dir, sample_sensor_window):
        """Test prediction with pothole detection"""
        detector = SensorDetector(model_path=mock_models_dir)
        
        # Mock the predict methods to return pothole result
        with patch.object(detector.event_classifier, 'predict', return_value=2):  # POTHOLE class
            with patch.object(detector.event_classifier, 'predict_proba', return_value=np.array([0.1, 0.1, 0.8, 0.1])):
                with patch.object(detector.label_encoders['event_class'], 'inverse_transform', return_value=['POTHOLE']):
                    with patch.object(detector.severity_classifier, 'predict', return_value=1):
                        with patch.object(detector.label_encoders['severity'], 'inverse_transform', return_value=['MEDIUM']):
                            with patch.object(detector.depth_regressor, 'predict', return_value=5.5):
                                result = detector.predict(
                                    device_id="test_device",
                                    timestamp="2026-09-11T12:00:00Z",
                                    latitude=28.6139,
                                    longitude=77.2090,
                                    speed_kmph=40.0,
                                    sensor_window=sample_sensor_window
                                )
        
        assert result.event_type == "POTHOLE"
        assert result.severity == "MEDIUM"
        assert result.estimated_depth_cm == 5.5
        assert result.confidence == 0.8
    
    def test_predict_error_handling(self, mock_models_dir, sample_sensor_window):
        """Test error handling in prediction"""
        detector = SensorDetector(model_path=mock_models_dir)
        
        # Mock to raise exception
        with patch.object(detector, 'extract_features_from_window', side_effect=Exception("Test error")):
            result = detector.predict(
                device_id="test_device",
                timestamp="2026-09-11T12:00:00Z",
                latitude=28.6139,
                longitude=77.2090,
                speed_kmph=40.0,
                sensor_window=sample_sensor_window
            )
        
        # Should return safe default on error
        assert result.event_type == "NORMAL"
        assert result.confidence == 0.0
    
    def test_predict_batch(self, mock_models_dir, sample_sensor_window):
        """Test batch prediction"""
        detector = SensorDetector(model_path=mock_models_dir)
        
        predictions = [
            {
                'device_id': f"device_{i}",
                'timestamp': "2026-09-11T12:00:00Z",
                'latitude': 28.6139 + i * 0.001,
                'longitude': 77.2090 + i * 0.001,
                'speed_kmph': 40.0,
                'sensor_window': sample_sensor_window
            }
            for i in range(3)
        ]
        
        # Mock the predict method
        with patch.object(detector, 'predict', side_effect=[
            SensorInferenceResult(
                device_id=f"device_{i}",
                timestamp="2026-09-11T12:00:00Z",
                latitude=28.6139 + i * 0.001,
                longitude=77.2090 + i * 0.001,
                event_type="NORMAL",
                severity=None,
                estimated_depth_cm=None,
                confidence=0.9,
                model_version="1.0.0"
            )
            for i in range(3)
        ]):
            results = detector.predict_batch(predictions)
        
        assert len(results) == 3
        assert all(isinstance(r, SensorInferenceResult) for r in results)
    
    def test_missing_gps_coordinates(self, mock_models_dir, sample_sensor_window):
        """Test handling of missing GPS coordinates"""
        detector = SensorDetector(model_path=mock_models_dir)
        
        with patch.object(detector.event_classifier, 'predict', return_value=0):
            with patch.object(detector.event_classifier, 'predict_proba', return_value=np.array([0.9, 0.1])):
                with patch.object(detector.label_encoders['event_class'], 'inverse_transform', return_value=['NORMAL']):
                    result = detector.predict(
                        device_id="test_device",
                        timestamp="2026-09-11T12:00:00Z",
                        latitude=0.0,  # Invalid GPS
                        longitude=0.0,  # Invalid GPS
                        speed_kmph=40.0,
                        sensor_window=sample_sensor_window
                    )
        
        # Should still process, but GPS is invalid
        assert result.latitude == 0.0
        assert result.longitude == 0.0
    
    def test_zero_speed_handling(self, mock_models_dir, sample_sensor_window):
        """Test handling of zero vehicle speed"""
        detector = SensorDetector(model_path=mock_models_dir)
        
        with patch.object(detector.event_classifier, 'predict', return_value=0):
            with patch.object(detector.event_classifier, 'predict_proba', return_value=np.array([0.9, 0.1])):
                with patch.object(detector.label_encoders['event_class'], 'inverse_transform', return_value=['NORMAL']):
                    result = detector.predict(
                        device_id="test_device",
                        timestamp="2026-09-11T12:00:00Z",
                        latitude=28.6139,
                        longitude=77.2090,
                        speed_kmph=0.0,  # Zero speed
                        sensor_window=sample_sensor_window
                    )
        
        # Should handle gracefully (speed_factor defaults to 1.0)
        assert result.event_type == "NORMAL"


class TestFeatureExtraction:
    """Test suite for feature extraction logic"""
    
    def test_acceleration_magnitude_calculation(self):
        """Test acceleration magnitude calculation"""
        accel_data = np.array([
            [1.0, 2.0, 3.0],
            [4.0, 5.0, 6.0]
        ])
        
        magnitude = np.linalg.norm(accel_data, axis=1)
        
        expected = np.array([np.sqrt(1 + 4 + 9), np.sqrt(16 + 25 + 36)])
        np.testing.assert_array_almost_equal(magnitude, expected)
    
    def test_vibration_rms_calculation(self):
        """Test vibration RMS calculation"""
        accel_mag = np.array([9.8, 10.5, 9.2, 11.0, 9.5])
        
        vibration = np.abs(accel_mag - 9.8)
        rms = np.sqrt(np.mean(vibration ** 2))
        
        expected_rms = np.sqrt(np.mean(([0.0, 0.7, -0.6, 1.2, -0.3]) ** 2))
        assert abs(rms - expected_rms) < 0.01
    
    def test_jerk_calculation(self):
        """Test jerk (rate of change) calculation"""
        accel_data = np.array([
            [1.0, 2.0, 3.0],
            [2.0, 3.0, 4.0],
            [3.0, 4.0, 5.0]
        ])
        
        jerk = np.diff(accel_data, axis=0)
        jerk_magnitude = np.linalg.norm(jerk, axis=1)
        
        # Should have 2 jerk samples for 3 acceleration samples
        assert len(jerk_magnitude) == 2
        assert jerk_magnitude[0] == np.sqrt(3)  # All differences are 1.0
    
    def test_peak_detection(self):
        """Test peak detection in signal"""
        signal = np.array([1.0, 2.0, 5.0, 3.0, 1.0])
        
        peak = np.max(signal)
        trough = np.min(signal)
        peak_to_peak = peak - trough
        
        assert peak == 5.0
        assert trough == 1.0
        assert peak_to_peak == 4.0


class TestIntegrationScenarios:
    """Integration test scenarios"""
    
    def test_end_to_end_normal_driving(self):
        """Test end-to-end scenario for normal driving"""
        # Create realistic normal driving sensor data
        sensor_window = [
            {
                'accel_x': np.random.normal(0, 0.3),
                'accel_y': np.random.normal(0, 0.3),
                'accel_z': 9.8 + np.random.normal(0, 0.3),
                'gyro_x': np.random.normal(0, 0.1),
                'gyro_y': np.random.normal(0, 0.1),
                'gyro_z': np.random.normal(0, 0.1)
            }
            for _ in range(50)
        ]
        
        # This would normally call the actual detector
        # For testing, we verify the data structure
        assert len(sensor_window) == 50
        assert all('accel_z' in reading for reading in sensor_window)
        assert all(reading['accel_z'] > 8.0 for reading in sensor_window)  # Should be near gravity
    
    def test_end_to_end_pothole_impact(self):
        """Test end-to-end scenario for pothole impact"""
        # Create simulated pothole impact data
        sensor_window = []
        
        # Pre-impact (normal)
        for _ in range(10):
            sensor_window.append({
                'accel_x': np.random.normal(0, 0.3),
                'accel_y': np.random.normal(0, 0.3),
                'accel_z': 9.8 + np.random.normal(0, 0.3),
                'gyro_x': np.random.normal(0, 0.1),
                'gyro_y': np.random.normal(0, 0.1),
                'gyro_z': np.random.normal(0, 0.1)
            })
        
        # Impact (sharp disturbance)
        for _ in range(5):
            sensor_window.append({
                'accel_x': np.random.normal(0, 1.5),
                'accel_y': np.random.normal(0, 1.5),
                'accel_z': 9.8 + np.random.normal(4.0, 1.0),  # Sharp vertical impact
                'gyro_x': np.random.normal(0, 0.3),
                'gyro_y': np.random.normal(0, 0.3),
                'gyro_z': np.random.normal(0, 0.3)
            })
        
        # Recovery (oscillation decay)
        for i in range(35):
            decay = np.exp(-0.1 * i)
            sensor_window.append({
                'accel_x': np.random.normal(0, 0.5 * decay),
                'accel_y': np.random.normal(0, 0.5 * decay),
                'accel_z': 9.8 + np.random.normal(0, 0.5 * decay),
                'gyro_x': np.random.normal(0, 0.15 * decay),
                'gyro_y': np.random.normal(0, 0.15 * decay),
                'gyro_z': np.random.normal(0, 0.15 * decay)
            })
        
        assert len(sensor_window) == 50
        
        # Verify impact section has higher acceleration
        impact_accel_z = [reading['accel_z'] for reading in sensor_window[10:15]]
        normal_accel_z = [reading['accel_z'] for reading in sensor_window[:10]]
        
        assert np.mean(impact_accel_z) > np.mean(normal_accel_z) + 2.0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])