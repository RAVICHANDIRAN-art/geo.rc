from pydantic import BaseModel
from typing import List, Optional, Any

class UploadResponse(BaseModel):
    job_id: str
    filename: str
    size: int
    status: str = "uploaded"
    message: str

class AnalysisStartResponse(BaseModel):
    job_id: str
    status: str = "processing"
    message: str

class JobStatusResponse(BaseModel):
    job_id: str
    status: str  # queued, processing, completed, failed
    progress_percentage: int
    current_step: str
    step_index: int
    total_steps: int
    logs: List[str]
    parcels_found: int = 0
    buildings_found: int = 0
    roads_found: int = 0
    total_area_ha: float = 0.0
    result: Optional[Any] = None
