from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
import time
from backend.app.schemas.analysis import UploadResponse
from backend.app.database.database import db

router = APIRouter(prefix="/api", tags=["upload"])

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "tif", "tiff", "geojson"}

@router.post("/upload", response_model=UploadResponse)
async def upload_drone_imagery(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file format .{ext}. Allowed: JPG, PNG, TIFF, GeoTIFF")
    
    contents = await file.read()
    file_size = len(contents)
    
    job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"
    
    db.jobs[job_id] = {
        "job_id": job_id,
        "filename": file.filename,
        "size": file_size,
        "status": "queued",
        "progress_percentage": 0,
        "current_step": "Imagery uploaded. Ready for AI processing.",
        "step_index": 0,
        "total_steps": 10,
        "logs": [f"[{time.strftime('%H:%M:%S')}] Drone image '{file.filename}' ({round(file_size/1024, 1)} KB) uploaded successfully."]
    }
    
    return UploadResponse(
        job_id=job_id,
        filename=file.filename,
        size=file_size,
        status="uploaded",
        message="Drone imagery uploaded successfully."
    )
