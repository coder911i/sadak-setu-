import uuid
import time
import urllib.request
import cv2
import numpy as np
from app.config import settings
from app.models.schemas import VerificationResponse, VerificationStatusEnum


class VerificationComparator:
    @staticmethod
    def _fetch_image(url: str) -> np.ndarray:
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = resp.read()
        arr = np.frombuffer(data, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError(f"Failed to decode image from {url}")
        return img

    @classmethod
    async def compare_before_after(
        cls,
        before_url: str,
        after_url: str,
        detector=None,
    ) -> VerificationResponse:
        """
        In live mode: fetches real images, calculates ORB scene similarity and runs
        defect detection to compute real defect eradication.
        In mock mode: evaluates simulated scenarios for development/testing.
        """
        start = time.time()

        if settings.AI_MODE == "live":
            img_before = cls._fetch_image(before_url)
            img_after = cls._fetch_image(after_url)

            h, w = 512, 512
            before_resized = cv2.resize(img_before, (w, h))
            after_resized = cv2.resize(img_after, (w, h))

            gray_before = cv2.cvtColor(before_resized, cv2.COLOR_BGR2GRAY)
            gray_after = cv2.cvtColor(after_resized, cv2.COLOR_BGR2GRAY)

            # 1. ORB scene similarity
            orb = cv2.ORB_create(nfeatures=500)
            kp1, des1 = orb.detectAndCompute(gray_before, None)
            kp2, des2 = orb.detectAndCompute(gray_after, None)

            visual_similarity = 0.5
            if des1 is not None and des2 is not None and len(kp1) > 0 and len(kp2) > 0:
                bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
                matches = bf.match(des1, des2)
                match_ratio = len(matches) / max(len(kp1), len(kp2), 1)
                visual_similarity = min(1.0, max(0.0, float(match_ratio * 2.0)))

            # 2. Defect detection before vs after
            before_dets = []
            after_dets = []
            if detector is not None:
                _, enc_before = cv2.imencode(".jpg", before_resized)
                _, enc_after = cv2.imencode(".jpg", after_resized)
                before_dets = await detector.detect_image(enc_before.tobytes())
                after_dets = await detector.detect_image(enc_after.tobytes())

            before_count = len(before_dets)
            after_count = len(after_dets)

            if before_count > 0:
                defect_reduction = max(0.0, min(100.0, float(before_count - after_count) / before_count * 100.0))
            else:
                defect_reduction = 100.0 if after_count == 0 else 0.0

            duration = round((time.time() - start) * 1000, 1)

            if visual_similarity < 0.15:
                return VerificationResponse(
                    verificationId=str(uuid.uuid4()),
                    result=VerificationStatusEnum.REVIEW_REQUIRED,
                    confidence=0.65,
                    reason="Scene visual similarity is very low between before and after images. Location confirmation required.",
                    visualSimilarity=round(visual_similarity, 2),
                    defectReduction=round(defect_reduction, 1),
                    analysisTimeMs=duration,
                )

            if after_count == 0 and (before_count > 0 or defect_reduction >= 90.0):
                return VerificationResponse(
                    verificationId=str(uuid.uuid4()),
                    result=VerificationStatusEnum.VERIFIED,
                    confidence=0.92,
                    reason=f"Verified: All detected defects eradicated ({before_count} before, 0 remaining). Surface grade restored.",
                    visualSimilarity=round(visual_similarity, 2),
                    defectReduction=round(defect_reduction, 1),
                    analysisTimeMs=duration,
                )

            if after_count > 0:
                return VerificationResponse(
                    verificationId=str(uuid.uuid4()),
                    result=VerificationStatusEnum.NOT_VERIFIED,
                    confidence=0.85,
                    reason=f"Defects persist in repair evidence ({after_count} defect(s) still detected). Incomplete repair.",
                    visualSimilarity=round(visual_similarity, 2),
                    defectReduction=round(defect_reduction, 1),
                    analysisTimeMs=duration,
                )

            return VerificationResponse(
                verificationId=str(uuid.uuid4()),
                result=VerificationStatusEnum.REVIEW_REQUIRED,
                confidence=0.70,
                reason="Inconclusive automated detection; supervisor inspection recommended.",
                visualSimilarity=round(visual_similarity, 2),
                defectReduction=round(defect_reduction, 1),
                analysisTimeMs=duration,
            )

        # Mock / prototype path (explicitly simulated)
        duration = 250.0
        if "fail" in after_url.lower():
            return VerificationResponse(
                verificationId=str(uuid.uuid4()),
                result=VerificationStatusEnum.NOT_VERIFIED,
                confidence=0.87,
                reason="[MOCK PROTOTYPE] Post-repair visual audit detected incomplete asphalt leveling and persistent void cracking.",
                visualSimilarity=0.61,
                defectReduction=34.0,
                analysisTimeMs=duration,
            )

        if "review" in after_url.lower():
            return VerificationResponse(
                verificationId=str(uuid.uuid4()),
                result=VerificationStatusEnum.REVIEW_REQUIRED,
                confidence=0.68,
                reason="[MOCK PROTOTYPE] Surface patch boundary has irregular contour variance. Recommended for human supervisor review.",
                visualSimilarity=0.74,
                defectReduction=72.5,
                analysisTimeMs=duration,
            )

        return VerificationResponse(
            verificationId=str(uuid.uuid4()),
            result=VerificationStatusEnum.VERIFIED,
            confidence=0.94,
            reason="[MOCK PROTOTYPE] Pothole cavity has been cleanly compacted and filled to grade. Surrounding road crown restored.",
            visualSimilarity=0.91,
            defectReduction=98.5,
            analysisTimeMs=duration,
        )
