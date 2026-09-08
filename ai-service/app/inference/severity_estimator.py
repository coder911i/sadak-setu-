from app.models.schemas import DamageSeverityEnum

class SeverityEstimator:
    @staticmethod
    def estimate_severity(damage_type: str, box_width: float, box_height: float, img_w: int = 1280, img_h: int = 720) -> DamageSeverityEnum:
        """Estimates severity based on relative area coverage and aspect ratio of detected defect."""
        box_area = box_width * box_height
        img_area = img_w * img_h
        coverage_pct = (box_area / img_area) * 100

        if damage_type == "POTHOLE":
            if coverage_pct > 3.0:
                return DamageSeverityEnum.CRITICAL
            elif coverage_pct > 1.2:
                return DamageSeverityEnum.HIGH
            elif coverage_pct > 0.4:
                return DamageSeverityEnum.MEDIUM
            else:
                return DamageSeverityEnum.LOW

        if damage_type == "CRACK":
            length = max(box_width, box_height)
            if length > 250:
                return DamageSeverityEnum.HIGH
            elif length > 120:
                return DamageSeverityEnum.MEDIUM
            else:
                return DamageSeverityEnum.LOW

        if coverage_pct > 2.0:
            return DamageSeverityEnum.HIGH
        return DamageSeverityEnum.MEDIUM
