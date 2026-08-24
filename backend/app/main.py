from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

from backend.app.api.upload import router as upload_router
from backend.app.api.analysis import router as analysis_router
from backend.app.api.parcels import router as parcels_router
from backend.app.api.exports import router as exports_router

app = FastAPI(
    title="Urban Parcel Mapper API",
    description="AI-Powered Urban Land Mapping & Cadastral Feature Extraction Backend API",
    version="1.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(analysis_router)
app.include_router(parcels_router)
app.include_router(exports_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "Urban Parcel Mapper API",
        "timestamp": time.time(),
        "database": "connected",
        "ai_engine": "ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
