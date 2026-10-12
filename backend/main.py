"""
STORMGUARD AI — FastAPI Application Entrypoint
Early Convective Genesis, Nowcasting & Hyperlocal Impact Intelligence Platform
Smart India Hackathon (SIH 2026) Prototype Backend
"""

import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from api.routes import router as api_router

app = FastAPI(
    title="STORMGUARD AI Backend API",
    description="Early Convective Genesis, Nowcasting & Hyperlocal Impact Intelligence Platform (SIH 2026)",
    version="1.0.0-prototype"
)

# Enable CORS for React frontend (Vite port 5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router
app.include_router(api_router)

@app.get("/")
def root():
    return {
        'system': 'STORMGUARD AI Platform',
        'status': 'OPERATIONAL',
        'sih_problem': 'Convective-scale nowcasting for Thunderstorms, Hail & Cloudbursts',
        'docs_url': '/docs',
        'api_version': 'v1'
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
