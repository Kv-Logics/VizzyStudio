from app.worker.celery_app import celery_app
import time
import uuid
import random

@celery_app.task(bind=True, name="generate_panel_options")
def generate_panel_options_task(self, panel_id: str, prompt: str, visual_style: str):
    """
    Background task to generate 3 options for a panel.
    Currently mocked to simulate latency and return dummy URLs.
    """
    self.update_state(state="PROCESSING", meta={"progress": 10})
    
    # Simulate processing time
    time.sleep(2)
    self.update_state(state="PROCESSING", meta={"progress": 50})
    time.sleep(2)
    
    # Mocked results
    options = []
    angles = ["Cinematic Wide", "Dramatic Close-Up", "Low Angle Hero"]
    for i in range(3):
        options.append({
            "id": str(uuid.uuid4()),
            "panel_id": panel_id,
            "image_url": f"https://picsum.photos/seed/{random.randint(1,1000)}/1024/768",
            "seed": random.randint(1, 99999),
            "prompt": prompt,
            "camera_angle": angles[i],
            "lighting_tone": "Dramatic",
            "is_selected": False
        })
        
    return {"status": "success", "options": options, "panel_id": panel_id}
