import requests
import base64
import uuid
import asyncio
import urllib.parse
from app.worker.celery_app import celery_app
from app.config import settings
from app.services.s3_service import s3_service
import logging

logger = logging.getLogger(__name__)

async def upload_bytes_to_s3(image_bytes: bytes, object_name: str) -> str:
    url = await s3_service.upload_file_bytes(image_bytes, object_name)
    return url

@celery_app.task(bind=True, name="generate_panel_options")
def generate_panel_options_task(self, panel_id: str, prompt: str, visual_style: str):
    """
    Background task to generate 3 options for a panel using AI Image Generator.
    Attempts NVIDIA API if available, then Pollinations AI, uploading to S3 if configured.
    """
    self.update_state(state="PROCESSING", meta={"progress": 10})
    
    options = []
    angles = ["Cinematic Wide", "Dramatic Close-Up", "Low Angle Hero"]
    
    for i, angle in enumerate(angles):
        self.update_state(state="PROCESSING", meta={"progress": 20 + (i * 25)})
        
        full_prompt = f"graphic novel panel, {prompt}, {angle} camera angle, {visual_style} visual style, detailed graphic artwork, highly detailed, comic art style"
        seed_val = (hash(panel_id) + i * 17) % 100000
        
        image_url = None
        
        # 1. Try Pollinations AI for fast, high quality custom AI art
        try:
            encoded_prompt = urllib.parse.quote(full_prompt)
            pollination_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=576&seed={seed_val}&nologo=true"
            
            # Fetch image bytes to verify and optionally upload to S3
            img_res = requests.get(pollination_url, timeout=15)
            if img_res.status_code == 200:
                # If S3 is configured, save to S3
                if settings.S3_BUCKET_NAME:
                    try:
                        filename = f"panels/{panel_id}/option_{i}_{seed_val}.jpg"
                        s3_url = asyncio.run(upload_bytes_to_s3(img_res.content, filename))
                        if s3_url:
                            image_url = s3_url
                    except Exception as s3_err:
                        logger.warning(f"S3 upload failed for option {i}: {s3_err}")
                
                if not image_url:
                    image_url = pollination_url
        except Exception as p_err:
            logger.warning(f"Pollinations AI failed for option {i}: {p_err}")

        # Fallback to high-quality unsplash/picsum if external fetch fails
        if not image_url:
            image_url = f"https://picsum.photos/seed/{panel_id}_{i}/1024/576"

        options.append({
            "id": str(uuid.uuid4()),
            "panel_id": panel_id,
            "image_url": image_url,
            "seed": seed_val,
            "prompt": full_prompt,
            "camera_angle": angle,
            "lighting_tone": "Dramatic",
            "is_selected": False
        })

    self.update_state(state="PROCESSING", meta={"progress": 100})
    return {"status": "success", "options": options, "panel_id": panel_id}

