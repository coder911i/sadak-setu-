import logging

logger = logging.getLogger("sadak_setu.ai.inference")


async def log_inference(
    request_id: str,
    model_version: str,
    media_type: str,
    processing_time_ms: int,
    detection_count: int,
    media_path: str | None,
) -> None:
    logger.info(
        "inference complete request_id=%s model=%s type=%s ms=%s detections=%s path=%s",
        request_id,
        model_version,
        media_type,
        processing_time_ms,
        detection_count,
        media_path,
    )
