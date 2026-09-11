"""
Process Synthetic Dataset - Feature Engineering Pipeline

This script processes the raw synthetic sensor data to create engineered features
for ML model training. It applies the feature engineering pipeline to the generated
dataset and creates clean, processed datasets ready for model development.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json
from feature_engineering import FeatureEngineer
import warnings

warnings.filterwarnings('ignore')


def process_synthetic_dataset(
    input_path: str = 'data/raw/synthetic_sensor_data.csv',
    output_dir: str = 'data/processed',
    sample_size: int = None
):
    """
    Process synthetic sensor dataset and generate engineered features.
    
    Args:
        input_path: Path to raw synthetic data CSV
        output_dir: Directory to save processed data
        sample_size: Optional sample size for testing (None for full dataset)
    """
    print(f"Loading synthetic dataset from {input_path}...")
    
    # Load raw data
    df = pd.read_csv(input_path)
    
    if sample_size and sample_size < len(df):
        print(f"Sampling {sample_size} rows for testing...")
        df = df.sample(n=sample_size, random_state=42)
    
    print(f"Dataset shape: {df.shape}")
    print(f"Event class distribution:\n{df['event_class'].value_counts()}")
    
    # Initialize feature engineer
    engineer = FeatureEngineer(sampling_rate_hz=50.0)
    
    print("\nExtracting engineered features...")
    feature_df = engineer.extract_features_from_dataframe(df)
    
    print(f"Feature DataFrame shape: {feature_df.shape}")
    print(f"Feature columns: {list(feature_df.columns)}")
    
    # Add target variables
    feature_df['event_class'] = df['event_class'].values
    feature_df['severity'] = df['severity'].values
    feature_df['pothole_depth_cm'] = df['pothole_depth_cm'].values
    
    # Add metadata columns
    metadata_cols = ['device_id', 'route_id', 'event_id', 'timestamp', 
                    'latitude', 'longitude', 'road_type', 'weather']
    for col in metadata_cols:
        if col in df.columns:
            feature_df[col] = df[col].values
    
    # Create output directory
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Save processed features
    features_path = f"{output_dir}/features.csv"
    feature_df.to_csv(features_path, index=False)
    print(f"\nFeatures saved to {features_path}")
    
    # Create clean dataset (basic cleaning and validation)
    print("\nCreating clean sensor dataset...")
    clean_df = df.copy()
    
    # Handle missing values
    print(f"Missing values before cleaning:")
    print(clean_df.isnull().sum()[clean_df.isnull().sum() > 0])
    
    # Fill missing numeric values with 0 for sensor data
    numeric_cols = clean_df.select_dtypes(include=[np.number]).columns
    clean_df[numeric_cols] = clean_df[numeric_cols].fillna(0)
    
    # Fill missing categorical values
    categorical_cols = clean_df.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        clean_df[col] = clean_df[col].fillna('UNKNOWN')
    
    # Remove outliers (basic validation)
    print("\nValidating data ranges...")
    
    # Speed should be reasonable (0-150 km/h)
    clean_df = clean_df[(clean_df['speed_kmph'] >= 0) & (clean_df['speed_kmph'] <= 150)]
    
    # GPS coordinates should be valid
    clean_df = clean_df[(clean_df['latitude'].between(-90, 90)) & 
                        (clean_df['longitude'].between(-180, 180))]
    
    # Vibration should be non-negative
    clean_df['vibration_rms'] = clean_df['vibration_rms'].abs()
    clean_df['vibration_peak'] = clean_df['vibration_peak'].abs()
    
    print(f"Clean dataset shape: {clean_df.shape}")
    
    # Save clean dataset
    clean_path = f"{output_dir}/clean_sensor_data.csv"
    clean_df.to_csv(clean_path, index=False)
    print(f"Clean dataset saved to {clean_path}")
    
    # Generate processing metadata
    processing_metadata = {
        'processing_info': {
            'input_file': input_path,
            'output_directory': output_dir,
            'original_rows': len(df),
            'cleaned_rows': len(clean_df),
            'feature_rows': len(feature_df),
            'processing_timestamp': pd.Timestamp.now().isoformat()
        },
        'feature_statistics': {
            'total_features': len(feature_df.columns),
            'numeric_features': len(feature_df.select_dtypes(include=[np.number]).columns),
            'categorical_features': len(feature_df.select_dtypes(include=['object']).columns),
            'feature_names': list(feature_df.columns)
        },
        'data_quality': {
            'missing_values_after_cleaning': int(clean_df.isnull().sum().sum()),
            'duplicate_rows': int(clean_df.duplicated().sum()),
            'event_class_distribution': clean_df['event_class'].value_counts().to_dict()
        }
    }
    
    # Save processing metadata
    metadata_path = f"{output_dir}/processing_metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(processing_metadata, f, indent=2)
    print(f"Processing metadata saved to {metadata_path}")
    
    print("\n" + "="*50)
    print("PROCESSING SUMMARY")
    print("="*50)
    print(f"Original dataset: {len(df)} rows")
    print(f"Cleaned dataset: {len(clean_df)} rows")
    print(f"Feature dataset: {len(feature_df)} rows")
    print(f"Total features extracted: {len(feature_df.columns)}")
    print(f"Files saved:")
    print(f"  - {features_path}")
    print(f"  - {clean_path}")
    print(f"  - {metadata_path}")
    
    return feature_df, clean_df, processing_metadata


def main():
    """Main function to process synthetic dataset"""
    print("="*60)
    print("Synthetic Dataset Processing Pipeline")
    print("="*60)
    
    # Process full dataset
    feature_df, clean_df, metadata = process_synthetic_dataset(
        input_path='data/raw/synthetic_sensor_data.csv',
        output_dir='data/processed'
    )
    
    # Also process sample dataset for quick testing
    print("\n" + "="*60)
    print("Processing Sample Dataset for Testing")
    print("="*60)
    
    sample_feature_df, sample_clean_df, sample_metadata = process_synthetic_dataset(
        input_path='data/samples/sample_sensor_data.csv',
        output_dir='data/samples/processed',
        sample_size=None  # Process full sample dataset
    )
    
    print("\nDataset processing completed successfully!")
    print("\nGenerated files:")
    print("  data/processed/features.csv")
    print("  data/processed/clean_sensor_data.csv")
    print("  data/processed/processing_metadata.json")
    print("  data/samples/processed/features.csv")
    print("  data/samples/processed/clean_sensor_data.csv")
    print("  data/samples/processed/processing_metadata.json")


if __name__ == '__main__':
    main()