from fastapi import APIRouter, HTTPException
import time
from backend.app.schemas.analysis import AnalysisStartResponse, JobStatusResponse
from backend.app.database.database import db
from backend.app.services.pipeline import AIPipelineEngine

router = APIRouter(prefix="/api", tags=["analysis"])

@router.post("/analyze/{job_id}", response_model=AnalysisStartResponse)
async def start_analysis(job_id: str):
    if job_id not in db.jobs:
        # Create job if not exists
        db.jobs[job_id] = {
            "job_id": job_id,
            "filename": "drone_ortho.tif",
            "size": 1048576,
            "status": "queued",
            "progress_percentage": 0,
            "current_step": "Job initialized",
            "step_index": 0,
            "total_steps": 10,
            "logs": [f"[{time.strftime('%H:%M:%S')}] Job '{job_id}' started."]
        }
    
    db.jobs[job_id]["status"] = "processing"
    db.jobs[job_id]["step_index"] = 0
    db.jobs[job_id]["progress_percentage"] = 10
    db.jobs[job_id]["current_step"] = "Image Preprocessing"
    db.jobs[job_id]["logs"].append(f"[{time.strftime('%H:%M:%S')}] AI Cadastral Extraction Pipeline started.")
    
    return AnalysisStartResponse(
        job_id=job_id,
        status="processing",
        message="AI Pipeline analysis started successfully."
    )

@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    if job_id not in db.jobs:
        raise HTTPException(status_code=404, detail="Job ID not found")
    
    job = db.jobs[job_id]
    
    # Auto-advance processing for simulation demo
    if job["status"] == "processing":
        current = job.get("step_index", 0)
        if current < 9:
            next_step = current + 1
            step_info = AIPipelineEngine.process_job_step(next_step)
            job["step_index"] = next_step
            job["progress_percentage"] = step_info["progress_percentage"]
            job["current_step"] = step_info["current_step"]
            job["logs"].append(step_info["log"])
        else:
            job["status"] = "completed"
            job["progress_percentage"] = 100
            job["current_step"] = "AI Cadastral Extraction Complete"
            job["logs"].append(f"[{time.strftime('%H:%M:%S')}] Pipeline completed. 12 parcels, 9 buildings, 3 roads generated.")
    
    return JobStatusResponse(
        job_id=job["job_id"],
        status=job["status"],
        progress_percentage=job["progress_percentage"],
        current_step=job["current_step"],
        step_index=job.get("step_index", 0),
        total_steps=job.get("total_steps", 10),
        logs=job.get("logs", []),
        parcels_found=12,
        buildings_found=9,
        roads_found=3,
        total_area_ha=14.2
    )
