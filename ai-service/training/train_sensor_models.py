"""
ML Model Training Pipeline for Sadak Setu Sensor-Based Anomaly Detection

This module implements the complete ML training pipeline for road anomaly detection
using sensor data. It includes:

1. Road event classification (multi-class)
2. Severity classification (multi-class for potholes)
3. Pothole depth regression (for pothole events only)

The pipeline implements proper data splitting to prevent leakage by grouping
by event_id, route_id, and device_id.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json
import joblib
from datetime import datetime
from typing import Dict, Tuple, Optional, List
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    precision_recall_fscore_support, mean_absolute_error, 
    mean_squared_error, r2_score
)
from sklearn.multioutput import MultiOutputClassifier
import warnings

warnings.filterwarnings('ignore')


class SensorMLTrainer:
    """
    ML trainer for sensor-based road anomaly detection.
    
    This class handles the complete training pipeline including data splitting,
    model training, evaluation, and saving.
    """
    
    def __init__(
        self,
        features_path: str = 'data/processed/features.csv',
        output_dir: str = 'ai-service/models/sensor_anomaly',
        random_state: int = 42
    ):
        """
        Initialize the ML trainer.
        
        Args:
            features_path: Path to engineered features CSV
            output_dir: Directory to save trained models
            random_state: Random seed for reproducibility
        """
        self.features_path = features_path
        self.output_dir = output_dir
        self.random_state = random_state
        
        # Create output directory
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Initialize models and encoders
        self.event_classifier = None
        self.severity_classifier = None
        self.depth_regressor = None
        
        self.label_encoders = {}
        self.scaler = StandardScaler()
        
        # Training metadata
        self.training_metadata = {}
        
    def load_data(self) -> pd.DataFrame:
        """
        Load engineered features dataset.
        
        Returns:
            DataFrame with features and targets
        """
        print(f"Loading features from {self.features_path}...")
        df = pd.read_csv(self.features_path)
        print(f"Loaded dataset with shape: {df.shape}")
        return df
    
    def split_data_leakage_prevention(
        self,
        df: pd.DataFrame,
        group_by: str = 'event_id',
        test_size: float = 0.2,
        val_size: float = 0.15
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Split data preventing leakage by grouping.
        
        Args:
            df: Input DataFrame
            group_by: Column to group by for splitting (event_id, route_id, device_id)
            test_size: Proportion of data for test set
            val_size: Proportion of data for validation set
            
        Returns:
            Tuple of (train_df, val_df, test_df)
        """
        print(f"\nSplitting data by {group_by} to prevent leakage...")
        
        # Get unique groups
        unique_groups = df[group_by].unique()
        print(f"Total unique {group_by}s: {len(unique_groups)}")
        
        # First split: train vs (val + test)
        train_groups, temp_groups = train_test_split(
            unique_groups,
            test_size=(test_size + val_size),
            random_state=self.random_state
        )
        
        # Second split: val vs test from temp
        val_size_adjusted = val_size / (test_size + val_size)
        val_groups, test_groups = train_test_split(
            temp_groups,
            test_size=(1 - val_size_adjusted),
            random_state=self.random_state
        )
        
        print(f"Train groups: {len(train_groups)} ({len(train_groups)/len(unique_groups):.1%})")
        print(f"Validation groups: {len(val_groups)} ({len(val_groups)/len(unique_groups):.1%})")
        print(f"Test groups: {len(test_groups)} ({len(test_groups)/len(unique_groups):.1%})")
        
        # Split dataframes based on groups
        train_df = df[df[group_by].isin(train_groups)].copy()
        val_df = df[df[group_by].isin(val_groups)].copy()
        test_df = df[df[group_by].isin(test_groups)].copy()
        
        print(f"\nFinal split sizes:")
        print(f"Train: {len(train_df)} samples ({len(train_df)/len(df):.1%})")
        print(f"Validation: {len(val_df)} samples ({len(val_df)/len(df):.1%})")
        print(f"Test: {len(test_df)} samples ({len(test_df)/len(df):.1%})")
        
        return train_df, val_df, test_df
    
    def prepare_features(
        self,
        df: pd.DataFrame,
        fit_scaler: bool = True
    ) -> np.ndarray:
        """
        Prepare feature matrix for ML training.
        
        Args:
            df: Input DataFrame
            fit_scaler: Whether to fit the scaler (True for train, False for val/test)
            
        Returns:
            Feature matrix
        """
        # Select numeric features only
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        # Exclude target and identifier columns
        exclude_cols = ['event_class', 'severity', 'pothole_depth_cm', 
                       'latitude', 'longitude', 'timestamp']
        
        feature_cols = [col for col in numeric_cols if col not in exclude_cols]
        
        print(f"Using {len(feature_cols)} features: {feature_cols[:5]}...")
        
        # Store feature names for later use
        if fit_scaler:
            self.feature_names = feature_cols
        
        # Extract feature matrix
        X = df[feature_cols].values
        
        # Handle missing values
        X = np.nan_to_num(X, nan=0.0)
        
        # Scale features
        if fit_scaler:
            X_scaled = self.scaler.fit_transform(X)
        else:
            X_scaled = self.scaler.transform(X)
        
        return X_scaled
    
    def train_event_classifier(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray
    ) -> Dict:
        """
        Train road event classifier.
        
        Args:
            X_train: Training features
            y_train: Training labels
            X_val: Validation features
            y_val: Validation labels
            
        Returns:
            Dictionary of training results
        """
        print("\n" + "="*60)
        print("Training Event Classifier")
        print("="*60)
        
        # Encode labels
        le = LabelEncoder()
        y_train_encoded = le.fit_transform(y_train)
        y_val_encoded = le.transform(y_val)
        
        self.label_encoders['event_class'] = le
        
        print(f"Classes: {le.classes_}")
        print(f"Class distribution: {np.bincount(y_train_encoded)}")
        
        # Train Random Forest classifier
        print("Training Random Forest classifier...")
        self.event_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=self.random_state,
            n_jobs=-1,
            class_weight='balanced'
        )
        
        self.event_classifier.fit(X_train, y_train_encoded)
        
        # Evaluate
        train_pred = self.event_classifier.predict(X_train)
        val_pred = self.event_classifier.predict(X_val)
        
        train_acc = accuracy_score(y_train_encoded, train_pred)
        val_acc = accuracy_score(y_val_encoded, val_pred)
        
        print(f"Train Accuracy: {train_acc:.4f}")
        print(f"Validation Accuracy: {val_acc:.4f}")
        
        # Detailed classification report
        print("\nClassification Report (Validation):")
        report = classification_report(
            y_val_encoded, val_pred, 
            target_names=le.classes_,
            output_dict=True
        )
        
        # Print key metrics
        for class_name in le.classes_:
            if class_name in report:
                metrics = report[class_name]
                print(f"{class_name}: Precision={metrics['precision']:.3f}, "
                      f"Recall={metrics['recall']:.3f}, F1={metrics['f1-score']:.3f}")
        
        # Feature importance
        if hasattr(self, 'feature_names'):
            feature_importance = dict(zip(
                self.feature_names,
                self.event_classifier.feature_importances_
            ))
        else:
            feature_importance = {}
        
        top_features = sorted(
            feature_importance.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]
        
        print("\nTop 10 Important Features:")
        for feature, importance in top_features:
            print(f"  {feature}: {importance:.4f}")
        
        results = {
            'model_type': 'RandomForestClassifier',
            'train_accuracy': float(train_acc),
            'validation_accuracy': float(val_acc),
            'classification_report': report,
            'feature_importance': feature_importance,
            'classes': list(le.classes_)
        }
        
        return results
    
    def train_severity_classifier(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray
    ) -> Optional[Dict]:
        """
        Train severity classifier for pothole events only.
        
        Args:
            X_train: Training features
            y_train: Training labels (may contain NaN for non-pothole events)
            X_val: Validation features
            y_val: Validation labels
            
        Returns:
            Dictionary of training results or None if insufficient data
        """
        print("\n" + "="*60)
        print("Training Severity Classifier (Potholes Only)")
        print("="*60)
        
        # Filter for pothole events only
        pothole_mask_train = ~pd.isna(y_train)
        pothole_mask_val = ~pd.isna(y_val)
        
        if pothole_mask_train.sum() < 50:
            print("Insufficient pothole data for severity classifier")
            return None
        
        X_train_pothole = X_train[pothole_mask_train]
        y_train_pothole = y_train[pothole_mask_train]
        X_val_pothole = X_val[pothole_mask_val]
        y_val_pothole = y_val[pothole_mask_val]
        
        print(f"Pothole samples - Train: {len(X_train_pothole)}, Val: {len(X_val_pothole)}")
        
        # Encode labels
        le = LabelEncoder()
        y_train_encoded = le.fit_transform(y_train_pothole)
        y_val_encoded = le.transform(y_val_pothole)
        
        self.label_encoders['severity'] = le
        
        print(f"Severity classes: {le.classes_}")
        print(f"Class distribution: {np.bincount(y_train_encoded)}")
        
        # Train Gradient Boosting classifier
        print("Training Gradient Boosting classifier...")
        self.severity_classifier = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=self.random_state
        )
        
        self.severity_classifier.fit(X_train_pothole, y_train_encoded)
        
        # Evaluate
        train_pred = self.severity_classifier.predict(X_train_pothole)
        val_pred = self.severity_classifier.predict(X_val_pothole)
        
        train_acc = accuracy_score(y_train_encoded, train_pred)
        val_acc = accuracy_score(y_val_encoded, val_pred)
        
        print(f"Train Accuracy: {train_acc:.4f}")
        print(f"Validation Accuracy: {val_acc:.4f}")
        
        # Classification report
        print("\nClassification Report (Validation):")
        report = classification_report(
            y_val_encoded, val_pred,
            target_names=le.classes_,
            output_dict=True
        )
        
        for class_name in le.classes_:
            if class_name in report:
                metrics = report[class_name]
                print(f"{class_name}: Precision={metrics['precision']:.3f}, "
                      f"Recall={metrics['recall']:.3f}, F1={metrics['f1-score']:.3f}")
        
        results = {
            'model_type': 'GradientBoostingClassifier',
            'train_accuracy': float(train_acc),
            'validation_accuracy': float(val_acc),
            'classification_report': report,
            'classes': list(le.classes_),
            'train_samples': int(len(X_train_pothole)),
            'val_samples': int(len(X_val_pothole))
        }
        
        return results
    
    def train_depth_regressor(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray
    ) -> Optional[Dict]:
        """
        Train pothole depth regressor for pothole events only.
        
        Args:
            X_train: Training features
            y_train: Training labels (depth in cm, may contain NaN)
            X_val: Validation features
            y_val: Validation labels
            
        Returns:
            Dictionary of training results or None if insufficient data
        """
        print("\n" + "="*60)
        print("Training Depth Regressor (Potholes Only)")
        print("="*60)
        
        # Filter for pothole events with valid depth
        pothole_mask_train = ~pd.isna(y_train)
        pothole_mask_val = ~pd.isna(y_val)
        
        if pothole_mask_train.sum() < 50:
            print("Insufficient pothole data for depth regressor")
            return None
        
        X_train_pothole = X_train[pothole_mask_train]
        y_train_pothole = y_train[pothole_mask_train]
        X_val_pothole = X_val[pothole_mask_val]
        y_val_pothole = y_val[pothole_mask_val]
        
        print(f"Pothole samples - Train: {len(X_train_pothole)}, Val: {len(X_val_pothole)}")
        print(f"Depth range - Train: [{y_train_pothole.min():.1f}, {y_train_pothole.max():.1f}] cm")
        
        # Train Random Forest regressor
        print("Training Random Forest regressor...")
        self.depth_regressor = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=self.random_state,
            n_jobs=-1
        )
        
        self.depth_regressor.fit(X_train_pothole, y_train_pothole)
        
        # Evaluate
        train_pred = self.depth_regressor.predict(X_train_pothole)
        val_pred = self.depth_regressor.predict(X_val_pothole)
        
        train_mae = mean_absolute_error(y_train_pothole, train_pred)
        val_mae = mean_absolute_error(y_val_pothole, val_pred)
        train_rmse = np.sqrt(mean_squared_error(y_train_pothole, train_pred))
        val_rmse = np.sqrt(mean_squared_error(y_val_pothole, val_pred))
        train_r2 = r2_score(y_train_pothole, train_pred)
        val_r2 = r2_score(y_val_pothole, val_pred)
        
        print(f"Train MAE: {train_mae:.3f} cm, RMSE: {train_rmse:.3f} cm, R²: {train_r2:.3f}")
        print(f"Validation MAE: {val_mae:.3f} cm, RMSE: {val_rmse:.3f} cm, R²: {val_r2:.3f}")
        
        results = {
            'model_type': 'RandomForestRegressor',
            'train_mae': float(train_mae),
            'val_mae': float(val_mae),
            'train_rmse': float(train_rmse),
            'val_rmse': float(val_rmse),
            'train_r2': float(train_r2),
            'val_r2': float(val_r2),
            'train_samples': int(len(X_train_pothole)),
            'val_samples': int(len(X_val_pothole))
        }
        
        return results
    
    def save_models(self) -> None:
        """Save trained models and preprocessors."""
        print("\nSaving trained models...")
        
        # Save models
        if self.event_classifier:
            joblib.dump(
                self.event_classifier, 
                f"{self.output_dir}/event_classifier.pkl"
            )
            print(f"Saved event classifier to {self.output_dir}/event_classifier.pkl")
        
        if self.severity_classifier:
            joblib.dump(
                self.severity_classifier,
                f"{self.output_dir}/severity_classifier.pkl"
            )
            print(f"Saved severity classifier to {self.output_dir}/severity_classifier.pkl")
        
        if self.depth_regressor:
            joblib.dump(
                self.depth_regressor,
                f"{self.output_dir}/depth_regressor.pkl"
            )
            print(f"Saved depth regressor to {self.output_dir}/depth_regressor.pkl")
        
        # Save preprocessors
        joblib.dump(self.scaler, f"{self.output_dir}/scaler.pkl")
        joblib.dump(self.label_encoders, f"{self.output_dir}/label_encoders.pkl")
        joblib.dump(self.feature_names, f"{self.output_dir}/feature_names.pkl")
        
        print(f"Saved preprocessors to {self.output_dir}/")
    
    def save_metadata(self, results: Dict) -> None:
        """Save training metadata and results."""
        metadata = {
            'training_info': {
                'timestamp': datetime.now().isoformat(),
                'random_state': self.random_state,
                'features_path': self.features_path,
                'output_directory': self.output_dir,
                'model_version': '1.0.0'
            },
            'data_splitting': {
                'grouping_strategy': 'event_id',
                'train_samples': int(self.train_samples),
                'val_samples': int(self.val_samples),
                'test_samples': int(self.test_samples)
            },
            'feature_info': {
                'num_features': len(self.feature_names),
                'feature_names': self.feature_names
            },
            'model_results': results
        }
        
        metadata_path = f"{self.output_dir}/training_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Saved training metadata to {metadata_path}")
    
    def train_pipeline(self) -> Dict:
        """
        Execute complete training pipeline.
        
        Returns:
            Dictionary of all training results
        """
        print("="*60)
        print("Sensor ML Training Pipeline")
        print("="*60)
        
        # Load data
        df = self.load_data()
        
        # Split data with leakage prevention
        train_df, val_df, test_df = self.split_data_leakage_prevention(df)
        
        self.train_samples = len(train_df)
        self.val_samples = len(val_df)
        self.test_samples = len(test_df)
        
        # Prepare features
        print("\nPreparing features...")
        X_train = self.prepare_features(train_df, fit_scaler=True)
        X_val = self.prepare_features(val_df, fit_scaler=False)
        X_test = self.prepare_features(test_df, fit_scaler=False)
        
        # Extract targets
        y_train_event = train_df['event_class'].values
        y_val_event = val_df['event_class'].values
        y_test_event = test_df['event_class'].values
        
        y_train_severity = train_df['severity'].values
        y_val_severity = val_df['severity'].values
        
        y_train_depth = train_df['pothole_depth_cm'].values
        y_val_depth = val_df['pothole_depth_cm'].values
        
        # Train models
        results = {}
        
        # Task 1: Event Classification
        event_results = self.train_event_classifier(
            X_train, y_train_event, X_val, y_val_event
        )
        results['event_classification'] = event_results
        
        # Task 2: Severity Classification (potholes only)
        severity_results = self.train_severity_classifier(
            X_train, y_train_severity, X_val, y_val_severity
        )
        if severity_results:
            results['severity_classification'] = severity_results
        
        # Task 3: Depth Regression (potholes only)
        depth_results = self.train_depth_regressor(
            X_train, y_train_depth, X_val, y_val_depth
        )
        if depth_results:
            results['depth_regression'] = depth_results
        
        # Save models and metadata
        self.save_models()
        self.save_metadata(results)
        
        print("\n" + "="*60)
        print("Training Pipeline Completed Successfully")
        print("="*60)
        
        return results


def main():
    """Main function to run training pipeline"""
    print("Starting Sensor ML Training Pipeline...")
    
    # Initialize trainer
    trainer = SensorMLTrainer(
        features_path='data/processed/features.csv',
        output_dir='ai-service/models/sensor_anomaly',
        random_state=42
    )
    
    # Run training pipeline
    results = trainer.train_pipeline()
    
    print("\nTraining Summary:")
    print(f"Event Classifier Accuracy: {results['event_classification']['validation_accuracy']:.4f}")
    
    if 'severity_classification' in results:
        print(f"Severity Classifier Accuracy: {results['severity_classification']['validation_accuracy']:.4f}")
    
    if 'depth_regression' in results:
        print(f"Depth Regressor MAE: {results['depth_regression']['val_mae']:.3f} cm")
        print(f"Depth Regressor R²: {results['depth_regression']['val_r2']:.3f}")
    
    print("\nModels saved to ai-service/models/sensor_anomaly/")
    print("Training completed successfully!")


if __name__ == '__main__':
    main()