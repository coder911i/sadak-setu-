from fastapi import APIRouter, HTTPException
from app.models.schemas import VerificationRequest, VerificationResponse
from app.verification.comparator import VerificationComparator

router = APIRouter()

@router.post("/before-after", response_model=VerificationResponse)
async def verify_before_after(payload: VerificationRequest):
    try:
        response = VerificationComparator.compare_before_after(
            before_img=None,
            after_img=None,
            after_url=payload.afterMediaUrl
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification error: {str(e)}")
