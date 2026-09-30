import json
import logging
import os
from typing import Tuple, List, Dict, Any

import google.generativeai as genai

logger = logging.getLogger(__name__)

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

# Candidate models to try in order
GEMINI_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash",
]

async def generate_vizzy_response(user_content: str) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Generate a Vizzy AI director response using Google Gemini.
    Falls back gracefully to helpful quick replies if the API is unavailable.
    """
    system_prompt = (
        "You are Vizzy, an enthusiastic and creative AI graphic novel director. "
        "You guide users through building visual storyboards panel by panel. "
        "Always respond in valid JSON with exactly this structure:\n"
        '{\n'
        '  "response": "your enthusiastic reply",\n'
        '  "quick_replies": [\n'
        '    {"label": "Short option", "action": "send_message", "value": "Full prompt"},\n'
        '    {"label": "⚡ Generate Panel Now", "action": "generate", "value": "generate"}\n'
        '  ]\n'
        '}\n'
        "Suggest 2-3 quick replies for next steps or camera angles, plus a '⚡ Generate Panel Now' option when ending."
    )

    prompt = f"{system_prompt}\n\nUser: {user_content}"

    if GEMINI_KEY:
        for model_name in GEMINI_MODELS:
            try:
                model = genai.GenerativeModel(model_name)
                res = model.generate_content(prompt)
                raw_text = res.text.strip()

                # Clean markdown backticks if present
                if raw_text.startswith("```"):
                    raw_text = raw_text.split("\n", 1)[1]
                    if raw_text.endswith("```"):
                        raw_text = raw_text.rsplit("```", 1)[0]
                    raw_text = raw_text.strip()

                data = json.loads(raw_text)
                return data.get("response", "Ready to bring your scene to life!"), data.get("quick_replies", [])
            except Exception as e:
                logger.warning(f"Gemini model {model_name} failed: {e}")
                continue

    # Fallback response if API unavailable or rate-limited
    lower = user_content.lower()
    if any(k in lower for k in ["generate", "that", "all", "done", "finish", "ready", "create"]):
        return (
            "Awesome! We have set up the shot beautifully. Click **⚡ Generate Panel Now** below or hit the **Gen Panel** button at the top to render your image variations!",
            [
                {"label": "⚡ Generate Panel Now", "action": "generate", "value": "generate"},
                {"label": "Cinematic Wide Shot", "action": "set_camera", "value": "Cinematic Wide"},
                {"label": "Dramatic Close-Up", "action": "set_camera", "value": "Dramatic Close-Up"},
            ]
        )

    return (
        f"Love it! We're building an incredible frame with '{user_content}'. Should we generate the panel options now or fine-tune the details?",
        [
            {"label": "⚡ Generate Panel Now", "action": "generate", "value": "generate"},
            {"label": "Cinematic Wide Shot", "action": "set_camera", "value": "Cinematic Wide Shot"},
            {"label": "Dramatic Close-Up", "action": "set_camera", "value": "Dramatic Close-Up"},
        ]
    )

