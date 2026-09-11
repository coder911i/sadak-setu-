"""
Synthetic Sensor Data Generator for Sadak Setu ML Pipeline

This module generates realistic vehicle-mounted IoT sensor sequences for training
road anomaly detection models. The data simulates accelerometer and gyroscope
readings from vehicles traveling over different road surfaces and conditions.

Key Features:
- Realistic temporal windows (not independent random rows)
- Speed-dependent impact signatures
- Multiple device characteristics (bias, noise, calibration)
- Realistic GPS trajectories with noise
- Configurable event class distribution
- Ground truth pothole measurements
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import json
import os


class EventClass(Enum):
    """Road event classification labels"""
    NORMAL = "NORMAL"
    SPEED_BREAKER = "SPEED_BREAKER"
    POTHOLE = "POTHOLE"
    ROUGH_PATCH = "ROUGH_PATCH"
    SEVERE_POTHOLE = "SEVERE_POTHOLE"
    OTHER_ANOMALY = "OTHER_ANOMALY"


class Severity(Enum):
    """Pothole severity levels"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RoadType(Enum):
    """Road surface types"""
    URBAN = "URBAN"
    RESIDENTIAL = "RESIDENTIAL"
    HIGHWAY = "HIGHWAY"
    RURAL = "RURAL"
    ARTERIAL = "ARTERIAL"
    SERVICE_ROAD = "SERVICE_ROAD"


class Weather(Enum):
    """Environmental conditions"""
    CLEAR = "CLEAR"
    RAIN = "RAIN"
    WET = "WET"
    DUSTY = "DUSTY"


@dataclass
class DeviceProfile:
    """Device-specific sensor characteristics"""
    device_id: str
    accel_bias: np.ndarray  # [x, y, z] bias
    accel_noise_std: float
    gyro_bias: np.ndarray  # [x, y, z] bias
    gyro_noise_std: float
    sampling_rate_hz: float
    calibration_offset: float


@dataclass
class PotholeGroundTruth:
    """Ground truth measurements for pothole events"""
    depth_cm: float
    length_cm: float
    width_cm: float
    severity: Severity


class SyntheticDataGenerator:
    """
    Generates realistic synthetic sensor data for road anomaly detection.
    
    The generator creates continuous temporal windows representing vehicle
    movement over different road surfaces, with realistic physics-based
    sensor responses to various road conditions.
    """
    
    def __init__(
        self,
        num_observations: int = 100000,
        num_devices: int = 30,
        seed: int = 42,
        sampling_rate_hz: float = 50.0,
        base_speed_kmph: float = 40.0
    ):
        """
        Initialize the synthetic data generator.
        
        Args:
            num_observations: Total number of sensor observations to generate
            num_devices: Number of unique devices to simulate
            seed: Random seed for reproducibility
            sampling_rate_hz: Sensor sampling frequency in Hz
            base_speed_kmph: Base vehicle speed in km/h
        """
        self.num_observations = num_observations
        self.num_devices = num_devices
        self.seed = seed
        self.sampling_rate_hz = sampling_rate_hz
        self.base_speed_kmph = base_speed_kmph
        
        np.random.seed(seed)
        
        # Initialize device profiles
        self.devices = self._generate_device_profiles()
        
        # Initialize routes for GPS trajectories
        self.routes = self._generate_routes()
        
        # Event class distribution (weighted by real-world prevalence)
        self.event_distribution = {
            EventClass.NORMAL: 0.75,          # Most common
            EventClass.ROUGH_PATCH: 0.10,     # Moderate occurrences
            EventClass.SPEED_BREAKER: 0.08,  # Common on urban roads
            EventClass.POTHOLE: 0.05,         # Less common
            EventClass.SEVERE_POTHOLE: 0.015, # Rare but critical
            EventClass.OTHER_ANOMALY: 0.005  # Very rare
        }
        
        # Road type distribution
        self.road_type_distribution = {
            RoadType.URBAN: 0.35,
            RoadType.RESIDENTIAL: 0.25,
            RoadType.HIGHWAY: 0.20,
            RoadType.RURAL: 0.12,
            RoadType.ARTERIAL: 0.06,
            RoadType.SERVICE_ROAD: 0.02
        }
        
        # Weather distribution
        self.weather_distribution = {
            Weather.CLEAR: 0.70,
            Weather.WET: 0.15,
            Weather.RAIN: 0.10,
            Weather.DUSTY: 0.05
        }
        
        # Speed scenarios for dependency modeling
        self.speed_scenarios = [10, 20, 40, 60, 80]  # km/h
        
    def _generate_device_profiles(self) -> List[DeviceProfile]:
        """Generate device-specific sensor characteristics"""
        devices = []
        for i in range(self.num_devices):
            device_id = f"device_{i:04d}"
            
            # Random sensor bias (small calibration differences)
            accel_bias = np.random.uniform(-0.2, 0.2, 3)
            gyro_bias = np.random.uniform(-0.05, 0.05, 3)
            
            # Device-specific noise characteristics
            accel_noise_std = np.random.uniform(0.05, 0.15)
            gyro_noise_std = np.random.uniform(0.01, 0.03)
            
            # Slight sampling rate variations
            sampling_rate = self.sampling_rate_hz * np.random.uniform(0.95, 1.05)
            
            # Calibration offset
            calibration_offset = np.random.uniform(-0.1, 0.1)
            
            devices.append(DeviceProfile(
                device_id=device_id,
                accel_bias=accel_bias,
                accel_noise_std=accel_noise_std,
                gyro_bias=gyro_bias,
                gyro_noise_std=gyro_noise_std,
                sampling_rate_hz=sampling_rate,
                calibration_offset=calibration_offset
            ))
        
        return devices
    
    def _generate_routes(self) -> List[Dict]:
        """Generate GPS route trajectories"""
        routes = []
        base_lat = 28.6139  # Delhi region (example)
        base_lon = 77.2090
        
        for i in range(50):  # 50 unique routes
            route_id = f"route_{i:04d}"
            
            # Random starting point
            start_lat = base_lat + np.random.uniform(-0.1, 0.1)
            start_lon = base_lon + np.random.uniform(-0.1, 0.1)
            
            # Route direction and length
            direction = np.random.uniform(0, 2 * np.pi)
            length_km = np.random.uniform(2, 15)
            
            routes.append({
                'route_id': route_id,
                'start_lat': start_lat,
                'start_lon': start_lon,
                'direction': direction,
                'length_km': length_km
            })
        
        return routes
    
    def _select_device(self) -> DeviceProfile:
        """Randomly select a device profile"""
        return np.random.choice(self.devices)
    
    def _select_route(self) -> Dict:
        """Randomly select a route"""
        return np.random.choice(self.routes)
    
    def _select_event_class(self) -> EventClass:
        """Select event class based on distribution"""
        events = list(self.event_distribution.keys())
        weights = list(self.event_distribution.values())
        return np.random.choice(events, p=weights)
    
    def _select_road_type(self) -> RoadType:
        """Select road type based on distribution"""
        road_types = list(self.road_type_distribution.keys())
        weights = list(self.road_type_distribution.values())
        return np.random.choice(road_types, p=weights)
    
    def _select_weather(self) -> Weather:
        """Select weather condition based on distribution"""
        weathers = list(self.weather_distribution.keys())
        weights = list(self.weather_distribution.values())
        return np.random.choice(weathers, p=weights)
    
    def _select_speed(self) -> float:
        """Select vehicle speed based on road type"""
        speed = np.random.choice(self.speed_scenarios)
        # Add some variation
        speed = speed * np.random.uniform(0.9, 1.1)
        return speed
    
    def _generate_gps_position(
        self,
        route: Dict,
        distance_m: float,
        add_noise: bool = True
    ) -> Tuple[float, float]:
        """
        Generate GPS position along a route with optional noise.
        
        Args:
            route: Route dictionary with start position and direction
            distance_m: Distance traveled along route in meters
            add_noise: Whether to add GPS noise
            
        Returns:
            Tuple of (latitude, longitude)
        """
        # Calculate position along route
        earth_radius = 6371000  # meters
        
        lat_offset = (distance_m / earth_radius) * np.cos(route['direction']) * (180 / np.pi)
        lon_offset = (distance_m / earth_radius) * np.sin(route['direction']) * (180 / np.pi)
        
        lat = route['start_lat'] + lat_offset
        lon = route['start_lon'] + lon_offset
        
        if add_noise:
            # Add GPS noise (typical GPS accuracy: 5-10 meters)
            noise_scale = 0.0001  # approximately 10 meters
            lat += np.random.normal(0, noise_scale)
            lon += np.random.normal(0, noise_scale)
            
            # Occasional GPS drift
            if np.random.random() < 0.05:  # 5% chance
                lat += np.random.normal(0, noise_scale * 3)
                lon += np.random.normal(0, noise_scale * 3)
        
        return lat, lon
    
    def _generate_normal_sensor_data(
        self,
        device: DeviceProfile,
        duration_ms: float = 200.0
    ) -> np.ndarray:
        """
        Generate normal driving sensor data (low vibration, moderate noise).
        
        Args:
            device: Device profile for sensor characteristics
            duration_ms: Duration of the window in milliseconds
            
        Returns:
            Sensor data array of shape (n_samples, 6) with columns [ax, ay, az, gx, gy, gz]
        """
        n_samples = int(duration_ms * device.sampling_rate_hz / 1000)
        
        # Base acceleration (gravity + slight movement)
        # Gravity is ~9.8 m/s^2 on Z axis when upright
        base_accel = np.array([0.0, 0.0, 9.8])
        
        # Add small variations for normal road movement
        accel_variations = np.random.normal(0, 0.3, (n_samples, 3))
        accel_data = base_accel + accel_variations + device.accel_bias
        
        # Add device-specific noise
        accel_data += np.random.normal(0, device.accel_noise_std, (n_samples, 3))
        
        # Gyroscope data (small rotations during normal driving)
        gyro_data = np.random.normal(0, 0.1, (n_samples, 3)) + device.gyro_bias
        gyro_data += np.random.normal(0, device.gyro_noise_std, (n_samples, 3))
        
        return np.hstack([accel_data, gyro_data])
    
    def _generate_rough_patch_data(
        self,
        device: DeviceProfile,
        duration_ms: float = 500.0,
        intensity: float = 1.0
    ) -> np.ndarray:
        """
        Generate rough patch sensor data (repeated moderate vibration).
        
        Args:
            device: Device profile for sensor characteristics
            duration_ms: Duration of the rough patch in milliseconds
            intensity: Intensity multiplier (1.0 = standard rough patch)
            
        Returns:
            Sensor data array
        """
        n_samples = int(duration_ms * device.sampling_rate_hz / 1000)
        
        # Base acceleration with repeated disturbances
        base_accel = np.array([0.0, 0.0, 9.8])
        
        # Create periodic disturbances
        t = np.linspace(0, duration_ms / 1000, n_samples)
        disturbance_freq = 2.0  # Hz
        disturbance = np.sin(2 * np.pi * disturbance_freq * t) * intensity * 2.0
        
        accel_data = np.zeros((n_samples, 3))
        accel_data[:, 0] = disturbance * np.random.uniform(0.5, 1.5)  # X-axis
        accel_data[:, 1] = disturbance * np.random.uniform(0.3, 0.8)  # Y-axis
        accel_data[:, 2] = base_accel[2] + disturbance * np.random.uniform(0.8, 1.5)  # Z-axis
        
        # Add device characteristics
        accel_data += device.accel_bias
        accel_data += np.random.normal(0, device.accel_noise_std * 1.5, (n_samples, 3))
        
        # Gyroscope with increased activity
        gyro_data = np.random.normal(0, 0.3 * intensity, (n_samples, 3)) + device.gyro_bias
        gyro_data += np.random.normal(0, device.gyro_noise_std * 1.5, (n_samples, 3))
        
        return np.hstack([accel_data, gyro_data])
    
    def _generate_speed_breaker_data(
        self,
        device: DeviceProfile,
        speed_kmph: float,
        duration_ms: float = 800.0
    ) -> np.ndarray:
        """
        Generate speed breaker sensor data with characteristic approach-impact-recovery pattern.
        
        Args:
            device: Device profile for sensor characteristics
            speed_kmph: Vehicle speed in km/h
            duration_ms: Total duration of the event in milliseconds
            
        Returns:
            Sensor data array
        """
        n_samples = int(duration_ms * device.sampling_rate_hz / 1000)
        
        # Speed-dependent impact intensity
        speed_factor = speed_kmph / 40.0  # Normalize to 40 km/h baseline
        
        # Create temporal phases: approach -> impact -> recovery
        approach_samples = int(n_samples * 0.3)
        impact_samples = int(n_samples * 0.2)
        recovery_samples = n_samples - approach_samples - impact_samples
        
        sensor_data = np.zeros((n_samples, 6))
        
        # Approach phase: slight acceleration change
        sensor_data[:approach_samples, :3] = np.array([0.0, 0.0, 9.8]) + \
            np.random.normal(0, 0.4, (approach_samples, 3))
        
        # Impact phase: characteristic vertical response
        impact_intensity = 3.0 * speed_factor
        sensor_data[approach_samples:approach_samples + impact_samples, 2] = \
            9.8 + np.random.normal(impact_intensity, 1.0, impact_samples)
        sensor_data[approach_samples:approach_samples + impact_samples, :2] = \
            np.random.normal(0, 1.5 * speed_factor, (impact_samples, 2))
        
        # Recovery phase: oscillation decay
        recovery_t = np.linspace(0, 1, recovery_samples)
        recovery_oscillation = np.exp(-3 * recovery_t) * np.sin(10 * np.pi * recovery_t)
        sensor_data[approach_samples + impact_samples:, 2] = \
            9.8 + recovery_oscillation * 2.0 * speed_factor
        
        # Add device characteristics
        sensor_data[:, :3] += device.accel_bias
        sensor_data[:, :3] += np.random.normal(0, device.accel_noise_std, (n_samples, 3))
        
        # Gyroscope data
        sensor_data[:, 3:] = np.random.normal(0, 0.2 * speed_factor, (n_samples, 3)) + device.gyro_bias
        sensor_data[:, 3:] += np.random.normal(0, device.gyro_noise_std, (n_samples, 3))
        
        return sensor_data
    
    def _generate_pothole_data(
        self,
        device: DeviceProfile,
        speed_kmph: float,
        depth_cm: float,
        duration_ms: float = 400.0,
        is_severe: bool = False
    ) -> Tuple[np.ndarray, PotholeGroundTruth]:
        """
        Generate pothole sensor data with speed-dependent impact characteristics.
        
        Args:
            device: Device profile for sensor characteristics
            speed_kmph: Vehicle speed in km/h
            depth_cm: Pothole depth in centimeters
            duration_ms: Duration of the event in milliseconds
            is_severe: Whether this is a severe pothole
            
        Returns:
            Tuple of (sensor data array, ground truth measurements)
        """
        n_samples = int(duration_ms * device.sampling_rate_hz / 1000)
        
        # Speed and depth dependent impact
        speed_factor = speed_kmph / 40.0
        depth_factor = depth_cm / 5.0  # Normalize to 5cm baseline
        severity_multiplier = 2.0 if is_severe else 1.0
        
        impact_intensity = 4.0 * speed_factor * depth_factor * severity_multiplier
        
        # Create sharp impact pattern
        sensor_data = np.zeros((n_samples, 6))
        
        # Pre-impact: normal driving
        pre_impact_samples = int(n_samples * 0.2)
        sensor_data[:pre_impact_samples, :3] = np.array([0.0, 0.0, 9.8]) + \
            np.random.normal(0, 0.3, (pre_impact_samples, 3))
        
        # Impact: sharp vertical disturbance
        impact_samples = int(n_samples * 0.15)
        sensor_data[pre_impact_samples:pre_impact_samples + impact_samples, 2] = \
            9.8 + np.random.normal(impact_intensity, 1.5, impact_samples)
        sensor_data[pre_impact_samples:pre_impact_samples + impact_samples, :2] = \
            np.random.normal(0, 2.0 * speed_factor, (impact_samples, 2))
        
        # Recovery: oscillation with stronger decay for deeper potholes
        recovery_samples = n_samples - pre_impact_samples - impact_samples
        recovery_t = np.linspace(0, 1, recovery_samples)
        decay_rate = 4.0 if is_severe else 2.5
        recovery_oscillation = np.exp(-decay_rate * recovery_t) * \
            np.sin(15 * np.pi * recovery_t) * depth_factor
        
        sensor_data[pre_impact_samples + impact_samples:, 2] = \
            9.8 + recovery_oscillation * 3.0 * severity_multiplier
        
        # Add device characteristics
        sensor_data[:, :3] += device.accel_bias
        sensor_data[:, :3] += np.random.normal(0, device.accel_noise_std * 1.2, (n_samples, 3))
        
        # Gyroscope data (more active for severe potholes)
        gyro_intensity = 0.3 * speed_factor * severity_multiplier
        sensor_data[:, 3:] = np.random.normal(0, gyro_intensity, (n_samples, 3)) + device.gyro_bias
        sensor_data[:, 3:] += np.random.normal(0, device.gyro_noise_std * 1.2, (n_samples, 3))
        
        # Determine severity based on depth and impact
        if depth_cm < 3:
            severity = Severity.LOW
        elif depth_cm < 6:
            severity = Severity.MEDIUM
        elif depth_cm < 10:
            severity = Severity.HIGH
        else:
            severity = Severity.CRITICAL
        
        # Generate realistic dimensions
        length_cm = depth_cm * np.random.uniform(1.5, 3.0)
        width_cm = depth_cm * np.random.uniform(1.2, 2.5)
        
        ground_truth = PotholeGroundTruth(
            depth_cm=depth_cm,
            length_cm=length_cm,
            width_cm=width_cm,
            severity=severity
        )
        
        return sensor_data, ground_truth
    
    def _generate_event_window(
        self,
        event_class: EventClass,
        device: DeviceProfile,
        speed_kmph: float,
        road_type: RoadType
    ) -> Tuple[np.ndarray, Optional[PotholeGroundTruth]]:
        """
        Generate a complete event window with surrounding context.
        
        Args:
            event_class: Type of event to generate
            device: Device profile
            speed_kmph: Vehicle speed
            road_type: Type of road surface
            
        Returns:
            Tuple of (sensor data array, ground truth if applicable)
        """
        # Context windows before and after event
        context_duration_ms = 300
        
        # Generate pre-event context (normal driving)
        pre_context = self._generate_normal_sensor_data(device, context_duration_ms)
        
        # Generate event-specific data
        event_data = None
        ground_truth = None
        
        if event_class == EventClass.NORMAL:
            # Just extended normal driving
            event_data = self._generate_normal_sensor_data(device, context_duration_ms * 2)
            
        elif event_class == EventClass.ROUGH_PATCH:
            # Rough patch with moderate intensity
            intensity = 1.0 if road_type != RoadType.HIGHWAY else 0.7
            event_data = self._generate_rough_patch_data(device, 500.0, intensity)
            
        elif event_class == EventClass.SPEED_BREAKER:
            # Speed breaker with speed-dependent signature
            event_data = self._generate_speed_breaker_data(device, speed_kmph)
            
        elif event_class == EventClass.POTHOLE:
            # Pothole with realistic depth distribution
            # More shallow potholes than deep ones
            if np.random.random() < 0.6:
                depth_cm = np.random.uniform(1, 5)  # Shallow
            elif np.random.random() < 0.3:
                depth_cm = np.random.uniform(5, 10)  # Medium
            else:
                depth_cm = np.random.uniform(10, 15)  # Deep
            
            event_data, ground_truth = self._generate_pothole_data(
                device, speed_kmph, depth_cm, is_severe=False
            )
            
        elif event_class == EventClass.SEVERE_POTHOLE:
            # Severe pothole with significant depth
            depth_cm = np.random.uniform(10, 25)
            event_data, ground_truth = self._generate_pothole_data(
                device, speed_kmph, depth_cm, is_severe=True
            )
            
        elif event_class == EventClass.OTHER_ANOMALY:
            # Random anomaly (e.g., debris, manhole cover)
            event_data = self._generate_rough_patch_data(device, 300.0, intensity=1.5)
        
        # Generate post-event context (normal driving)
        post_context = self._generate_normal_sensor_data(device, context_duration_ms)
        
        # Combine all segments
        full_window = np.vstack([pre_context, event_data, post_context])
        
        return full_window, ground_truth
    
    def _compute_derived_features(self, sensor_data: np.ndarray) -> Dict:
        """
        Compute derived features from raw sensor data.
        
        Args:
            sensor_data: Array of shape (n_samples, 6) with [ax, ay, az, gx, gy, gz]
            
        Returns:
            Dictionary of derived features
        """
        accel = sensor_data[:, :3]
        gyro = sensor_data[:, 3:]
        
        # Acceleration magnitude
        accel_mag = np.linalg.norm(accel, axis=1)
        
        # Gyro magnitude
        gyro_mag = np.linalg.norm(gyro, axis=1)
        
        # Vibration RMS (deviation from gravity)
        vibration_rms = np.sqrt(np.mean((accel_mag - 9.8) ** 2))
        
        # Vibration peak
        vibration_peak = np.max(np.abs(accel_mag - 9.8))
        
        # Jerk (rate of change of acceleration)
        jerk = np.diff(accel, axis=0)
        jerk_rms = np.sqrt(np.mean(jerk ** 2))
        
        # FFT for dominant frequency
        if len(accel_mag) > 10:
            fft = np.fft.fft(accel_mag - np.mean(accel_mag))
            freqs = np.fft.fftfreq(len(accel_mag), d=1/self.sampling_rate_hz)
            dominant_freq_idx = np.argmax(np.abs(fft[1:len(fft)//2])) + 1
            dominant_freq = abs(freqs[dominant_freq_idx])
        else:
            dominant_freq = 0.0
        
        return {
            'vibration_rms': vibration_rms,
            'vibration_peak': vibration_peak,
            'jerk_rms': jerk_rms,
            'frequency_dominant_hz': dominant_freq,
            'accel_magnitude_mean': np.mean(accel_mag),
            'accel_magnitude_std': np.std(accel_mag),
            'gyro_magnitude_mean': np.mean(gyro_mag),
            'gyro_magnitude_std': np.std(gyro_mag)
        }
    
    def generate_dataset(self) -> pd.DataFrame:
        """
        Generate the complete synthetic dataset.
        
        Returns:
            DataFrame with all sensor observations and metadata
        """
        observations = []
        current_time = datetime.now()
        
        for i in range(self.num_observations):
            # Select random characteristics
            device = self._select_device()
            route = self._select_route()
            event_class = self._select_event_class()
            road_type = self._select_road_type()
            weather = self._select_weather()
            speed_kmph = self._select_speed()
            
            # Generate event window
            sensor_window, ground_truth = self._generate_event_window(
                event_class, device, speed_kmph, road_type
            )
            
            # Compute derived features
            derived_features = self._compute_derived_features(sensor_window)
            
            # Generate GPS position
            distance_m = i * 10  # 10 meters between observations
            lat, lon = self._generate_gps_position(route, distance_m)
            
            # Create observation record
            observation = {
                'timestamp': current_time.strftime('%Y-%m-%d %H:%M:%S.%f'),
                'device_id': device.device_id,
                'route_id': route['route_id'],
                'event_id': f"event_{i:06d}",
                'latitude': lat,
                'longitude': lon,
                'speed_kmph': speed_kmph,
                'road_type': road_type.value,
                'weather': weather.value,
                'event_class': event_class.value,
                'accel_x_mean': np.mean(sensor_window[:, 0]),
                'accel_y_mean': np.mean(sensor_window[:, 1]),
                'accel_z_mean': np.mean(sensor_window[:, 2]),
                'accel_x_std': np.std(sensor_window[:, 0]),
                'accel_y_std': np.std(sensor_window[:, 1]),
                'accel_z_std': np.std(sensor_window[:, 2]),
                'gyro_x_mean': np.mean(sensor_window[:, 3]),
                'gyro_y_mean': np.mean(sensor_window[:, 4]),
                'gyro_z_mean': np.mean(sensor_window[:, 5]),
                'gyro_x_std': np.std(sensor_window[:, 3]),
                'gyro_y_std': np.std(sensor_window[:, 4]),
                'gyro_z_std': np.std(sensor_window[:, 5]),
                'vibration_rms': derived_features['vibration_rms'],
                'vibration_peak': derived_features['vibration_peak'],
                'jerk_rms': derived_features['jerk_rms'],
                'frequency_dominant_hz': derived_features['frequency_dominant_hz'],
                'event_duration_ms': len(sensor_window) * 1000 / device.sampling_rate_hz,
                'sampling_rate_hz': device.sampling_rate_hz
            }
            
            # Add ground truth for pothole events
            if ground_truth is not None:
                observation['pothole_depth_cm'] = ground_truth.depth_cm
                observation['pothole_length_cm'] = ground_truth.length_cm
                observation['pothole_width_cm'] = ground_truth.width_cm
                observation['severity'] = ground_truth.severity.value
            else:
                observation['pothole_depth_cm'] = None
                observation['pothole_length_cm'] = None
                observation['pothole_width_cm'] = None
                observation['severity'] = None
            
            observations.append(observation)
            
            # Advance time
            current_time += timedelta(milliseconds=100)
        
        return pd.DataFrame(observations)
    
    def save_dataset(
        self,
        df: pd.DataFrame,
        output_dir: str = 'data/raw',
        filename: str = 'synthetic_sensor_data.csv'
    ):
        """
        Save generated dataset to CSV file.
        
        Args:
            df: DataFrame to save
            output_dir: Output directory path
            filename: Output filename
        """
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, filename)
        df.to_csv(output_path, index=False)
        print(f"Dataset saved to {output_path}")
        print(f"Total observations: {len(df)}")
        print(f"Event class distribution:")
        print(df['event_class'].value_counts())
    
    def generate_metadata(self, df: pd.DataFrame) -> Dict:
        """
        Generate metadata about the dataset.
        
        Args:
            df: Dataset DataFrame
            
        Returns:
            Dictionary of metadata
        """
        metadata = {
            'dataset_info': {
                'total_observations': len(df),
                'num_devices': df['device_id'].nunique(),
                'num_routes': df['route_id'].nunique(),
                'generation_timestamp': datetime.now().isoformat(),
                'random_seed': self.seed,
                'sampling_rate_hz': self.sampling_rate_hz
            },
            'event_distribution': df['event_class'].value_counts().to_dict(),
            'road_type_distribution': df['road_type'].value_counts().to_dict(),
            'weather_distribution': df['weather'].value_counts().to_dict(),
            'speed_statistics': {
                'mean_kmph': float(df['speed_kmph'].mean()),
                'std_kmph': float(df['speed_kmph'].std()),
                'min_kmph': float(df['speed_kmph'].min()),
                'max_kmph': float(df['speed_kmph'].max())
            },
            'pothole_statistics': {
                'total_potholes': int(df['event_class'].isin(['POTHOLE', 'SEVERE_POTHOLE']).sum()),
                'depth_mean_cm': float(df['pothole_depth_cm'].mean()),
                'depth_std_cm': float(df['pothole_depth_cm'].std()),
                'severity_distribution': df[df['severity'].notna()]['severity'].value_counts().to_dict()
            },
            'feature_statistics': {
                'vibration_rms_mean': float(df['vibration_rms'].mean()),
                'vibration_rms_std': float(df['vibration_rms'].std()),
                'jerk_rms_mean': float(df['jerk_rms'].mean()),
                'jerk_rms_std': float(df['jerk_rms'].std())
            }
        }
        
        return metadata
    
    def save_metadata(self, metadata: Dict, output_dir: str = 'data/metadata'):
        """
        Save metadata to JSON file.
        
        Args:
            metadata: Metadata dictionary
            output_dir: Output directory path
        """
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, 'dataset_metadata.json')
        with open(output_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"Metadata saved to {output_path}")


def main():
    """Main function to generate synthetic dataset"""
    print("Generating synthetic sensor data for Sadak Setu ML pipeline...")
    
    # Initialize generator
    generator = SyntheticDataGenerator(
        num_observations=100000,
        num_devices=30,
        seed=42,
        sampling_rate_hz=50.0,
        base_speed_kmph=40.0
    )
    
    # Generate dataset
    print("Generating dataset...")
    df = generator.generate_dataset()
    
    # Save dataset
    generator.save_dataset(df)
    
    # Generate and save metadata
    print("Generating metadata...")
    metadata = generator.generate_metadata(df)
    generator.save_metadata(metadata)
    
    print("Synthetic data generation completed successfully!")
    print(f"\nDataset shape: {df.shape}")
    print(f"\nSample observations:")
    print(df.head())
    
    # Create sample dataset for local testing
    print("\nCreating sample dataset for local testing...")
    sample_df = df.sample(n=1000, random_state=42)
    generator.save_dataset(sample_df, output_dir='data/samples', filename='sample_sensor_data.csv')
    
    print("Sample dataset saved to data/samples/sample_sensor_data.csv")


if __name__ == '__main__':
    main()