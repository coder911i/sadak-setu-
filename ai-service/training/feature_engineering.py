"""
Feature Engineering Pipeline for Sadak Setu ML Pipeline

This module extends the existing feature extraction capabilities to create
comprehensive engineered features for ML model training. It builds upon
the existing backend feature extraction and adds advanced time-domain and
frequency-domain features for road anomaly detection.

Key Features:
- Time-domain statistical features
- Frequency-domain spectral features
- Speed-adjusted impact features
- Window-based context features
- Signal quality indicators
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from scipy import signal
from scipy.fft import fft, fftfreq
import warnings

warnings.filterwarnings('ignore')


class FeatureEngineer:
    """
    Comprehensive feature engineering for sensor-based road anomaly detection.
    
    This class transforms raw sensor data into meaningful features that capture
    the physical characteristics of road events while being robust to device
    variations and environmental conditions.
    """
    
    def __init__(self, sampling_rate_hz: float = 50.0):
        """
        Initialize the feature engineer.
        
        Args:
            sampling_rate_hz: Sensor sampling frequency in Hz
        """
        self.sampling_rate_hz = sampling_rate_hz
    
    def compute_magnitude(self, data: np.ndarray, axis: int = 1) -> np.ndarray:
        """
        Compute magnitude of 3D vector data.
        
        Args:
            data: Array of shape (n_samples, 3) with [x, y, z] components
            axis: Axis along which to compute magnitude
            
        Returns:
            Array of magnitude values
        """
        return np.linalg.norm(data, axis=axis)
    
    def compute_vertical_acceleration(self, accel_data: np.ndarray) -> np.ndarray:
        """
        Extract vertical acceleration component (Z-axis).
        
        Args:
            accel_data: Array of shape (n_samples, 3) with [ax, ay, az]
            
        Returns:
            Z-axis acceleration values
        """
        return accel_data[:, 2]
    
    def compute_jerk(self, accel_data: np.ndarray) -> np.ndarray:
        """
        Compute jerk (rate of change of acceleration).
        
        Args:
            accel_data: Array of shape (n_samples, 3) acceleration data
            
        Returns:
            Array of jerk values (magnitude of acceleration change)
        """
        jerk = np.diff(accel_data, axis=0)
        jerk_magnitude = self.compute_magnitude(jerk)
        # Pad with first value to maintain same length
        return np.concatenate([[jerk_magnitude[0]], jerk_magnitude])
    
    def compute_rolling_statistics(
        self,
        data: np.ndarray,
        window_size: int = 10
    ) -> Dict[str, np.ndarray]:
        """
        Compute rolling statistics over a sliding window.
        
        Args:
            data: 1D array of values
            window_size: Size of rolling window in samples
            
        Returns:
            Dictionary of rolling statistics
        """
        if len(data) < window_size:
            window_size = len(data)
        
        rolling_mean = np.convolve(data, np.ones(window_size)/window_size, mode='same')
        rolling_std = np.array([np.std(data[max(0, i-window_size//2):min(len(data), i+window_size//2+1)]) 
                               for i in range(len(data))])
        
        return {
            'rolling_mean': rolling_mean,
            'rolling_std': rolling_std
        }
    
    def compute_peak_features(self, data: np.ndarray) -> Dict[str, float]:
        """
        Compute peak-related features.
        
        Args:
            data: 1D array of values
            
        Returns:
            Dictionary of peak features
        """
        if len(data) == 0:
            return {
                'peak': 0.0,
                'peak_to_peak': 0.0,
                'peak_index': 0.0
            }
        
        peak = np.max(data)
        trough = np.min(data)
        peak_to_peak = peak - trough
        peak_index = float(np.argmax(data)) / len(data)  # Normalized position
        
        return {
            'peak': peak,
            'peak_to_peak': peak_to_peak,
            'peak_index': peak_index
        }
    
    def compute_frequency_features(
        self,
        data: np.ndarray,
        max_freq_hz: float = 25.0
    ) -> Dict[str, float]:
        """
        Compute frequency-domain features using FFT.
        
        Args:
            data: 1D array of values
            max_freq_hz: Maximum frequency to consider in Hz
            
        Returns:
            Dictionary of frequency features
        """
        if len(data) < 2:
            return {
                'dominant_frequency_hz': 0.0,
                'spectral_centroid_hz': 0.0,
                'spectral_energy': 0.0,
                'spectral_entropy': 0.0
            }
        
        # Remove DC component
        data_centered = data - np.mean(data)
        
        # Compute FFT
        fft_values = fft(data_centered)
        fft_freqs = fftfreq(len(data), 1/self.sampling_rate_hz)
        
        # Consider only positive frequencies up to max_freq
        positive_freq_mask = (fft_freqs > 0) & (fft_freqs <= max_freq_hz)
        positive_freqs = fft_freqs[positive_freq_mask]
        positive_fft = np.abs(fft_values[positive_freq_mask])
        
        if len(positive_fft) == 0:
            return {
                'dominant_frequency_hz': 0.0,
                'spectral_centroid_hz': 0.0,
                'spectral_energy': 0.0,
                'spectral_entropy': 0.0
            }
        
        # Dominant frequency
        dominant_freq_idx = np.argmax(positive_fft)
        dominant_frequency = positive_freqs[dominant_freq_idx]
        
        # Spectral centroid (weighted mean frequency)
        spectral_energy = np.sum(positive_fft)
        if spectral_energy > 0:
            spectral_centroid = np.sum(positive_freqs * positive_fft) / spectral_energy
        else:
            spectral_centroid = 0.0
        
        # Spectral entropy (measure of spectral complexity)
        if spectral_energy > 0:
            normalized_spectrum = positive_fft / spectral_energy
            spectral_entropy = -np.sum(normalized_spectrum * np.log(normalized_spectrum + 1e-10))
        else:
            spectral_entropy = 0.0
        
        return {
            'dominant_frequency_hz': dominant_frequency,
            'spectral_centroid_hz': spectral_centroid,
            'spectral_energy': spectral_energy,
            'spectral_entropy': spectral_entropy
        }
    
    def compute_statistical_features(self, data: np.ndarray) -> Dict[str, float]:
        """
        Compute comprehensive statistical features.
        
        Args:
            data: 1D array of values
            
        Returns:
            Dictionary of statistical features
        """
        if len(data) == 0:
            return {
                'mean': 0.0,
                'std': 0.0,
                'variance': 0.0,
                'median': 0.0,
                'min': 0.0,
                'max': 0.0,
                'range': 0.0,
                'skewness': 0.0,
                'kurtosis': 0.0,
                'rms': 0.0
            }
        
        mean = np.mean(data)
        std = np.std(data)
        variance = std ** 2
        median = np.median(data)
        min_val = np.min(data)
        max_val = np.max(data)
        range_val = max_val - min_val
        rms = np.sqrt(np.mean(data ** 2))
        
        # Skewness and kurtosis
        if std > 0:
            skewness = np.mean(((data - mean) / std) ** 3)
            kurtosis = np.mean(((data - mean) / std) ** 4) - 3
        else:
            skewness = 0.0
            kurtosis = 0.0
        
        return {
            'mean': mean,
            'std': std,
            'variance': variance,
            'median': median,
            'min': min_val,
            'max': max_val,
            'range': range_val,
            'skewness': skewness,
            'kurtosis': kurtosis,
            'rms': rms
        }
    
    def compute_speed_adjusted_features(
        self,
        accel_magnitude: np.ndarray,
        speed_kmph: float
    ) -> Dict[str, float]:
        """
        Compute speed-adjusted impact features.
        
        Args:
            accel_magnitude: Array of acceleration magnitude values
            speed_kmph: Vehicle speed in km/h
            
        Returns:
            Dictionary of speed-adjusted features
        """
        if speed_kmph <= 0:
            speed_kmph = 1.0  # Avoid division by zero
        
        # Normalize impact by speed (higher speed = sharper but shorter impact)
        speed_factor = speed_kmph / 40.0  # Normalize to 40 km/h baseline
        
        impact_intensity = np.max(np.abs(accel_magnitude - 9.8))
        speed_adjusted_impact = impact_intensity / speed_factor
        
        # Duration tends to decrease with speed
        duration_samples = len(accel_magnitude)
        speed_adjusted_duration = duration_samples * speed_factor
        
        return {
            'speed_adjusted_impact': speed_adjusted_impact,
            'speed_factor': speed_factor,
            'speed_adjusted_duration': speed_adjusted_duration
        }
    
    def compute_recovery_oscillation(
        self,
        vertical_accel: np.ndarray,
        peak_index: int
    ) -> Dict[str, float]:
        """
        Compute recovery oscillation features after peak impact.
        
        Args:
            vertical_accel: Vertical acceleration array
            peak_index: Index of the peak impact
            
        Returns:
            Dictionary of recovery features
        """
        if peak_index >= len(vertical_accel) - 1:
            return {
                'recovery_oscillation_count': 0,
                'recovery_decay_rate': 0.0,
                'recovery_duration': 0.0
            }
        
        # Extract post-peak data
        post_peak = vertical_accel[peak_index:]
        
        if len(post_peak) < 5:
            return {
                'recovery_oscillation_count': 0,
                'recovery_decay_rate': 0.0,
                'recovery_duration': 0.0
            }
        
        # Count zero-crossings (oscillations)
        zero_crossings = np.where(np.diff(np.sign(post_peak - 9.8)))[0]
        oscillation_count = len(zero_crossings)
        
        # Estimate decay rate using exponential fit
        if oscillation_count > 2:
            peaks, _ = signal.find_peaks(np.abs(post_peak - 9.8))
            if len(peaks) > 2:
                peak_values = np.abs(post_peak[peaks] - 9.8)
                if len(peak_values) > 2:
                    # Simple decay rate estimate
                    decay_rate = (peak_values[0] - peak_values[-1]) / len(peak_values)
                else:
                    decay_rate = 0.0
            else:
                decay_rate = 0.0
        else:
            decay_rate = 0.0
        
        recovery_duration = len(post_peak) / self.sampling_rate_hz
        
        return {
            'recovery_oscillation_count': float(oscillation_count),
            'recovery_decay_rate': decay_rate,
            'recovery_duration': recovery_duration
        }
    
    def compute_signal_quality_features(
        self,
        accel_data: np.ndarray,
        gyro_data: np.ndarray
    ) -> Dict[str, float]:
        """
        Compute signal quality and consistency features.
        
        Args:
            accel_data: Accelerometer data (n_samples, 3)
            gyro_data: Gyroscope data (n_samples, 3)
            
        Returns:
            Dictionary of signal quality features
        """
        # Check for missing or corrupted values
        accel_valid = np.isfinite(accel_data).all()
        gyro_valid = np.isfinite(gyro_data).all()
        
        # Signal-to-noise ratio estimation
        accel_mag = self.compute_magnitude(accel_data)
        signal_power = np.mean(accel_mag ** 2)
        noise_estimate = np.std(np.diff(accel_mag))
        snr = signal_power / (noise_estimate ** 2 + 1e-10)
        
        # Consistency check (variance of variance across axes)
        accel_variances = np.var(accel_data, axis=0)
        variance_consistency = np.std(accel_variances) / (np.mean(accel_variances) + 1e-10)
        
        return {
            'signal_valid': float(accel_valid and gyro_valid),
            'snr_db': 10 * np.log10(snr + 1e-10),
            'variance_consistency': variance_consistency,
            'data_completeness': 1.0  # All data present
        }
    
    def extract_features(
        self,
        accel_data: np.ndarray,
        gyro_data: np.ndarray,
        speed_kmph: float,
        metadata: Optional[Dict] = None
    ) -> Dict[str, float]:
        """
        Extract comprehensive feature set from sensor data.
        
        Args:
            accel_data: Accelerometer data array (n_samples, 3) [ax, ay, az]
            gyro_data: Gyroscope data array (n_samples, 3) [gx, gy, gz]
            speed_kmph: Vehicle speed in km/h
            metadata: Optional metadata dictionary
            
        Returns:
            Dictionary of engineered features
        """
        features = {}
        
        # Basic magnitude features
        accel_mag = self.compute_magnitude(accel_data)
        gyro_mag = self.compute_magnitude(gyro_data)
        vertical_accel = self.compute_vertical_acceleration(accel_data)
        
        # Statistical features for acceleration
        accel_stats = self.compute_statistical_features(accel_mag)
        for key, value in accel_stats.items():
            features[f'accel_mag_{key}'] = value
        
        # Statistical features for gyroscope
        gyro_stats = self.compute_statistical_features(gyro_mag)
        for key, value in gyro_stats.items():
            features[f'gyro_mag_{key}'] = value
        
        # Vertical acceleration features
        vertical_stats = self.compute_statistical_features(vertical_accel)
        for key, value in vertical_stats.items():
            features[f'vertical_accel_{key}'] = value
        
        # Jerk features
        jerk = self.compute_jerk(accel_data)
        jerk_stats = self.compute_statistical_features(jerk)
        for key, value in jerk_stats.items():
            features[f'jerk_{key}'] = value
        
        # Peak features
        accel_peak = self.compute_peak_features(accel_mag)
        for key, value in accel_peak.items():
            features[f'accel_{key}'] = value
        
        # Frequency features
        accel_freq = self.compute_frequency_features(accel_mag)
        for key, value in accel_freq.items():
            features[f'accel_freq_{key}'] = value
        
        # Speed-adjusted features
        speed_features = self.compute_speed_adjusted_features(accel_mag, speed_kmph)
        for key, value in speed_features.items():
            features[key] = value
        
        # Recovery oscillation features
        peak_idx = int(accel_peak['peak_index'] * len(accel_mag))
        recovery_features = self.compute_recovery_oscillation(vertical_accel, peak_idx)
        for key, value in recovery_features.items():
            features[key] = value
        
        # Signal quality features
        quality_features = self.compute_signal_quality_features(accel_data, gyro_data)
        for key, value in quality_features.items():
            features[key] = value
        
        # Add metadata if provided
        if metadata:
            for key, value in metadata.items():
                if isinstance(value, (int, float)):
                    features[f'meta_{key}'] = float(value)
        
        return features
    
    def extract_features_from_dataframe(
        self,
        df: pd.DataFrame,
        accel_cols: List[str] = ['accel_x_mean', 'accel_y_mean', 'accel_z_mean'],
        gyro_cols: List[str] = ['gyro_x_mean', 'gyro_y_mean', 'gyro_z_mean'],
        speed_col: str = 'speed_kmph'
    ) -> pd.DataFrame:
        """
        Extract features from DataFrame with aggregated sensor statistics.
        
        Args:
            df: DataFrame with aggregated sensor statistics
            accel_cols: Column names for accelerometer data
            gyro_cols: Column names for gyroscope data
            speed_col: Column name for speed data
            
        Returns:
            DataFrame with engineered features
        """
        feature_rows = []
        
        for idx, row in df.iterrows():
            # Reconstruct sensor arrays from statistics
            # This is a simplified approach - in practice, you'd use raw time series data
            accel_data = np.array([
                [row['accel_x_mean'], row['accel_y_mean'], row['accel_z_mean']]
            ])
            gyro_data = np.array([
                [row['gyro_x_mean'], row['gyro_y_mean'], row['gyro_z_mean']]
            ])
            
            # Extract basic features using existing statistics
            features = {
                'accel_magnitude': np.sqrt(
                    row['accel_x_mean']**2 + row['accel_y_mean']**2 + row['accel_z_mean']**2
                ),
                'gyro_magnitude': np.sqrt(
                    row['gyro_x_mean']**2 + row['gyro_y_mean']**2 + row['gyro_z_mean']**2
                ),
                'vertical_acceleration': row['accel_z_mean'],
                'speed_kmph': row[speed_col],
                'vibration_rms': row.get('vibration_rms', 0.0),
                'vibration_peak': row.get('vibration_peak', 0.0),
                'jerk_rms': row.get('jerk_rms', 0.0),
                'frequency_dominant_hz': row.get('frequency_dominant_hz', 0.0),
                'accel_std': np.sqrt(
                    row['accel_x_std']**2 + row['accel_y_std']**2 + row['accel_z_std']**2
                ),
                'gyro_std': np.sqrt(
                    row['gyro_x_std']**2 + row['gyro_y_std']**2 + row['gyro_z_std']**2
                ),
                'accel_peak_to_peak': (
                    row['accel_z_mean'] + row['accel_z_std'] * 2 -
                    (row['accel_z_mean'] - row['accel_z_std'] * 2)
                ),
                'speed_adjusted_impact': row.get('vibration_peak', 0.0) / (row[speed_col] / 40.0 + 0.1),
                'event_duration_ms': row.get('event_duration_ms', 0.0)
            }
            
            # Add metadata features
            features['road_type'] = row.get('road_type', 'UNKNOWN')
            features['weather'] = row.get('weather', 'UNKNOWN')
            
            feature_rows.append(features)
        
        return pd.DataFrame(feature_rows)
    
    def create_feature_importance_report(
        self,
        feature_names: List[str],
        importances: np.ndarray,
        top_n: int = 20
    ) -> pd.DataFrame:
        """
        Create a feature importance report.
        
        Args:
            feature_names: List of feature names
            importances: Array of importance values
            top_n: Number of top features to report
            
        Returns:
            DataFrame with feature importance rankings
        """
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': importances
        })
        
        importance_df = importance_df.sort_values('importance', ascending=False)
        importance_df['rank'] = range(1, len(importance_df) + 1)
        
        return importance_df.head(top_n)


def main():
    """Main function to test feature engineering"""
    print("Testing Feature Engineering Pipeline...")
    
    # Create sample sensor data
    n_samples = 100
    accel_data = np.random.normal(0, 1, (n_samples, 3))
    accel_data[:, 2] += 9.8  # Add gravity to Z-axis
    gyro_data = np.random.normal(0, 0.1, (n_samples, 3))
    speed_kmph = 40.0
    
    # Initialize feature engineer
    engineer = FeatureEngineer(sampling_rate_hz=50.0)
    
    # Extract features
    features = engineer.extract_features(accel_data, gyro_data, speed_kmph)
    
    print(f"Extracted {len(features)} features")
    print("\nSample features:")
    for key, value in list(features.items())[:10]:
        print(f"  {key}: {value:.4f}")
    
    # Test with DataFrame
    print("\nTesting DataFrame feature extraction...")
    sample_df = pd.DataFrame({
        'accel_x_mean': [0.1, -0.2, 0.3],
        'accel_y_mean': [0.2, 0.1, -0.1],
        'accel_z_mean': [9.8, 10.2, 9.5],
        'accel_x_std': [0.5, 0.6, 0.4],
        'accel_y_std': [0.4, 0.5, 0.3],
        'accel_z_std': [0.8, 1.0, 0.7],
        'gyro_x_mean': [0.05, -0.03, 0.02],
        'gyro_y_mean': [0.02, 0.04, -0.01],
        'gyro_z_mean': [0.01, -0.02, 0.03],
        'gyro_x_std': [0.1, 0.12, 0.08],
        'gyro_y_std': [0.08, 0.1, 0.07],
        'gyro_z_std': [0.06, 0.09, 0.05],
        'speed_kmph': [40, 35, 45],
        'vibration_rms': [1.2, 1.5, 1.0],
        'vibration_peak': [3.5, 4.2, 2.8],
        'jerk_rms': [5.0, 6.0, 4.0],
        'frequency_dominant_hz': [8.5, 10.2, 7.0],
        'event_duration_ms': [500, 600, 450],
        'road_type': ['URBAN', 'HIGHWAY', 'RESIDENTIAL'],
        'weather': ['CLEAR', 'CLEAR', 'WET']
    })
    
    feature_df = engineer.extract_features_from_dataframe(sample_df)
    print(f"Created feature DataFrame with shape: {feature_df.shape}")
    print("\nSample engineered features:")
    print(feature_df.head())
    
    print("\nFeature Engineering Pipeline test completed successfully!")


if __name__ == '__main__':
    main()