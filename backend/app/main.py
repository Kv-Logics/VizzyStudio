from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.routes import stories, panels, chat
from app.models.database import Base, engine
import app.models.story
import app.models.panel
import app.models.chat_message
import redis
import os
import boto3
from botocore.exceptions import ClientError

app = FastAPI(
    title="Vizzy API",
    description="Backend API for Vizzy - AI Graphic Novel & Storyboard Creator",
    version="1.0.0",
)

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Configure CORS - allow all origins since frontend is served via Nginx proxy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stories.router, prefix="/api/v1/stories", tags=["stories"])
app.include_router(panels.router, prefix="/api/v1/stories", tags=["panels"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

@app.get("/")
async def root():
    return {"message": "Welcome to Vizzy API"}

@app.get("/health")
async def health_check():
    status = {"status": "healthy", "components": {}}
    
    # Check DB
    try:
        async with engine.connect() as conn:
            status["components"]["database"] = "ok"
    except Exception as e:
        status["status"] = "unhealthy"
        status["components"]["database"] = f"error: {str(e)}"
        
    # Check Redis
    try:
        r = redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))
        r.ping()
        status["components"]["redis"] = "ok"
    except Exception as e:
        status["status"] = "unhealthy"
        status["components"]["redis"] = f"error: {str(e)}"
        
    # Check AWS Bedrock access
    try:
        client = boto3.client(
            "bedrock-runtime",
            region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        # Lightweight connectivity check — list is enough to verify creds
        boto3.client(
            "bedrock",
            region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        status["components"]["bedrock"] = "configured"
    except Exception as e:
        status["components"]["bedrock"] = f"error: {str(e)}"
        
    # Check NVIDIA API
    try:
        if os.getenv("NVIDIA_API_KEY"):
            status["components"]["nvidia"] = "configured"
        else:
            status["components"]["nvidia"] = "not configured"
    except Exception as e:
        status["components"]["nvidia"] = f"error: {str(e)}"
        
    return status

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
