import pytest
from models.severity_classifier import (
    PrototypeHeuristicSeverityClassifier,
    default_severity_classifier,
)
from app.models.schemas import DamageSeverityEnum


def test_severity_classifier_pothole():
    clf = default_severity_classifier
    assert clf.classify_severity("POTHOLE", bbox_area=0.10, confidence=0.9) == DamageSeverityEnum.CRITICAL
    assert clf.classify_severity("POTHOLE", bbox_area=0.04, confidence=0.9) == DamageSeverityEnum.HIGH
    assert clf.classify_severity("POTHOLE", bbox_area=0.01, confidence=0.9) == DamageSeverityEnum.MEDIUM


def test_severity_classifier_crack():
    clf = default_severity_classifier
    assert clf.classify_severity("CRACK", bbox_area=0.15, confidence=0.8) == DamageSeverityEnum.HIGH
    assert clf.classify_severity("CRACK", bbox_area=0.05, confidence=0.8) == DamageSeverityEnum.MEDIUM
    assert clf.classify_severity("CRACK", bbox_area=0.01, confidence=0.8) == DamageSeverityEnum.LOW
