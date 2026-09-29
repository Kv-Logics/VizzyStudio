import google.generativeai as genai
import json
from typing import Tuple, List, Dict, Any
from app.config import settings
import logging

logger = logging.getLogger(__name__)

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

async def generate_vizzy_response(user_content: str) -> Tuple[str, List[Dict[str, Any]]]:
    if not model:
        return "Gemini API key missing. Mock response: What happens next?", [{"label": "Continue", "action": "send_message", "value": "Continue"}]

    prompt = f"""
    You are Vizzy, an enthusiastic AI graphic novel director.
    The user says: "{user_content}"
    
    Respond with enthusiasm and guide them on the visual storyboard. 
    Also suggest 2-3 quick replies they can choose next (like a camera angle, an action, or a style).
    
    Output JSON format:
    {{
        "response": "Your conversational response",
        "quick_replies": [
            {{"label": "Reply Text 1", "action": "set_camera", "value": "Cinematic Wide"}},
            {{"label": "Reply Text 2", "action": "send_message", "value": "Add explosion"}}
        ]
    }}
    """
    
    try:
        response = await model.generate_content_async(prompt, generation_config={"response_mime_type": "application/json"})
        data = json.loads(response.text)
        return data.get("response", "I'm ready!"), data.get("quick_replies", [])
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        return "I had a bit of trouble thinking of the next scene. What were you imagining?", [{"label": "Retry", "action": "send_message", "value": user_content}]
