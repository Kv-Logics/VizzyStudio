import requests
import base64
import uuid
import asyncio
from app.worker.celery_app import celery_app
from app.config import settings
from app.services.s3_service import s3_service
import logging

logger = logging.getLogger(__name__)

async def upload_to_s3(b64_string: str, object_name: str) -> str:
    image_bytes = base64.b64decode(b64_string)
    url = await s3_service.upload_file_bytes(image_bytes, object_name)
    return url

@celery_app.task(bind=True, name="generate_panel_options")
def generate_panel_options_task(self, panel_id: str, prompt: str, visual_style: str):
    """
    Background task to generate 3 options for a panel using NVIDIA API.
    Uploads resulting images to S3 and returns URLs.
    """
    self.update_state(state="PROCESSING", meta={"progress": 10})
    
    headers = {
        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    options = []
    angles = ["Cinematic Wide", "Dramatic Close-Up", "Low Angle Hero"]
    
    for i, angle in enumerate(angles):
        self.update_state(state="PROCESSING", meta={"progress": 20 + (i*20)})
        
        full_prompt = f"{prompt}, {angle} camera angle, {visual_style} style, masterpiece, highres"
        
        try:
            if not settings.NVIDIA_API_KEY:
                raise ValueError("NVIDIA API key not set")
                
            res = requests.post(
                "https://integrate.api.nvidia.com/v1/images/generations",
                headers=headers,
                json={
                    "prompt": full_prompt,
                    "model": "stabilityai/stable-diffusion-xl",
                    "response_format": "b64_json",
                    "size": "1024x1024",
                    "steps": 30
                },
                timeout=30
            )
            
            res.raise_for_status()
            data = res.json()
            b64_img = data["data"][0]["b64_json"]
            
            # Upload to S3 asynchronously using asyncio.run
            filename = f"panels/{panel_id}/option_{i}_{uuid.uuid4().hex[:8]}.png"
            s3_url = asyncio.run(upload_to_s3(b64_img, filename))
            
            options.append({
                "id": str(uuid.uuid4()),
                "panel_id": panel_id,
                "image_url": s3_url,
                "seed": 0,
                "prompt": full_prompt,
                "camera_angle": angle,
                "lighting_tone": "Dramatic",
                "is_selected": False
            })
            
        except Exception as e:
            logger.error(f"Image generation error for option {i}: {e}")
            # Fallback to placeholder if generation fails
            options.append({
                "id": str(uuid.uuid4()),
                "panel_id": panel_id,
                "image_url": f"https://picsum.photos/seed/{uuid.uuid4().hex[:4]}/1024/768",
                "seed": 0,
                "prompt": full_prompt,
                "camera_angle": angle,
                "lighting_tone": "Dramatic",
                "is_selected": False
            })

    self.update_state(state="PROCESSING", meta={"progress": 100})
    return {"status": "success", "options": options, "panel_id": panel_id}
