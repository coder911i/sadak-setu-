"""
Severity Classification Interface & Prototype Heuristic Engine.

Currently, severity is determined via a prototype heuristic model (based on damage class
and normalized bounding box area) as no independently trained severity ML weights exist.
This module establishes the interface and prototype engine for future trained severity models.
"""
from abc import ABC, abstractmethod
from typing import Optional
import numpy as np
from app.models.schemas import DamageSeverityEnum, DamageTypeEnum


class SeverityClassifierInterface(ABC):
    """Abstract interface for damage severity assessment."""

    @abstractmethod
    def classify_severity(
        self,
        damage_type: str,
        bbox_area: float,
        confidence: float,
        crop: Optional[np.ndarray] = None,
    ) -> DamageSeverityEnum:
        """Classifies severity into LOW, MEDIUM, HIGH, or CRITICAL."""
        pass


class PrototypeHeuristicSeverityClassifier(SeverityClassifierInterface):
    """
    Explicit prototype heuristic classifier.
    Combines damage class semantics with relative bounding box coverage.
    NOTE: This is a rule-based prototype heuristic, NOT an independently validated ML model.
    """

    def classify_severity(
        self,
        damage_type: str,
        bbox_area: float,
        confidence: float,
        crop: Optional[np.ndarray] = None,
    ) -> DamageSeverityEnum:
        dt = damage_type.upper()

        if dt == "POTHOLE":
            # Large coverage pothole on road lane
            if bbox_area > 0.08:
                return DamageSeverityEnum.CRITICAL
            elif bbox_area > 0.02:
                return DamageSeverityEnum.HIGH
            else:
                return DamageSeverityEnum.MEDIUM

        elif dt == "CRACK":
            if bbox_area > 0.12:
                return DamageSeverityEnum.HIGH
            elif bbox_area > 0.03:
                return DamageSeverityEnum.MEDIUM
            else:
                return DamageSeverityEnum.LOW

        elif dt in ("SURFACE_DAMAGE", "RUTTING"):
            if bbox_area > 0.15:
                return DamageSeverityEnum.HIGH
            elif bbox_area > 0.05:
                return DamageSeverityEnum.MEDIUM
            else:
                return DamageSeverityEnum.LOW

        elif dt == "EDGE_DAMAGE":
            if bbox_area > 0.10:
                return DamageSeverityEnum.HIGH
            else:
                return DamageSeverityEnum.LOW

        return DamageSeverityEnum.MEDIUM


# Singleton prototype instance
default_severity_classifier = PrototypeHeuristicSeverityClassifier()
