from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import VerificationRequest, VerificationResponse
from app.verification.comparator import VerificationComparator
from app.dependencies import get_detector

router = APIRouter()

@router.post("/before-after", response_model=VerificationResponse)
async def verify_before_after(payload: VerificationRequest, detector=Depends(get_detector)):
    try:
        response = await VerificationComparator.compare_before_after(
            before_url=payload.beforeMediaUrl,
            after_url=payload.afterMediaUrl,
            detector=detector,
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification error: {str(e)}")
