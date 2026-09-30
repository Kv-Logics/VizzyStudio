import json
import logging
import os
from typing import Tuple, List, Dict, Any

import google.generativeai as genai

logger = logging.getLogger(__name__)

import requests

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
NVIDIA_KEY = os.getenv("NVIDIA_API_KEY")

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

# Candidate models to try in order
GEMINI_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash",
]

def query_nvidia_llm(prompt: str) -> Any:
    if not NVIDIA_KEY:
        return None
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {NVIDIA_KEY}", "Accept": "application/json"}
    body = {
        "model": "meta/llama-3.2-11b-vision-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5,
        "max_tokens": 500
    }
    try:
        res = requests.post(url, headers=headers, json=body, timeout=10)
        if res.status_code == 200:
            raw = res.json()["choices"][0]["message"]["content"].strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1]
                if raw.endswith("```"):
                    raw = raw.rsplit("```", 1)[0]
                raw = raw.strip()
            data = json.loads(raw)
            return data.get("response", "Ready for direction."), data.get("quick_replies", [])
    except Exception as e:
        logger.warning(f"NVIDIA NIM model failed: {e}")
    return None

async def generate_vizzy_response(user_content: str) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Generate a Vizzy AI Creative Director response using Google Gemini or NVIDIA NIM LLM.
    Enforces task-oriented workflow and state machine navigation.
    """
    system_prompt = (
        "You are Vizzy, a super friendly and highly enthusiastic AI Creative Director for graphic novels and visual storyboards.\n"
        "Your goal is to guide the user step-by-step to create stunning panels. Be conversational, encouraging, and clear!\n"
        "Instead of asking for everything at once, lead the user by asking specific questions one by one for EACH panel:\n"
        "1. First, ask what the MAIN ACTION or event is for the current panel.\n"
        "2. Then, ask about the CHARACTERS involved and their EMOTIONS.\n"
        "3. Next, ask about the SETTING, BACKGROUND, and LIGHTING.\n"
        "4. Finally, ask what CAMERA ANGLE they want (e.g., Close-up, Wide shot, Dutch angle).\n"
        "Once you have all details, confirm the prompt and suggest generating the panel!\n\n"
        "CRITICAL RULES:\n"
        "- Be friendly! Use emojis and keep a conversational tone.\n"
        "- Guide the user on the right path. If their prompt is too vague, nicely ask for more specific details.\n"
        "- Always respond in valid JSON with this exact structure:\n"
        "{\n"
        '  "response": "your friendly director response",\n'
        '  "workflow_state": "DISCOVER | BRIEF | OUTLINE | PAGE | GENERATE | REFINE | APPROVED",\n'
        '  "quick_replies": [\n'
        '    {"label": "Short label", "action": "send_message", "value": "Full prompt"}\n'
        '  ]\n'
        "}\n"
    )

    prompt = f"{system_prompt}\n\nUser: {user_content}"

    if GEMINI_KEY:
        for model_name in GEMINI_MODELS:
            try:
                model = genai.GenerativeModel(model_name)
                res = model.generate_content(prompt)
                raw_text = res.text.strip()

                if raw_text.startswith("```"):
                    raw_text = raw_text.split("\n", 1)[1]
                    if raw_text.endswith("```"):
                        raw_text = raw_text.rsplit("```", 1)[0]
                    raw_text = raw_text.strip()

                data = json.loads(raw_text)
                return data.get("response", "Ready for your direction."), data.get("quick_replies", [])
            except Exception as e:
                logger.warning(f"Gemini model {model_name} failed: {e}")
                continue

    # Try NVIDIA NIM LLM
    nv_res = query_nvidia_llm(prompt)
    if nv_res:
        return nv_res

    # Fallback response if API unavailable or rate-limited
    lower = user_content.lower()
    if any(k in lower for k in ["generate", "render", "make panel", "create panel", "build panel"]):
        return (
            "🎯 **Active Target: Page 1 → Panel 1**. Rendering 3 camera angle variations based on your locked Creative Bible...",
            [
                {"label": "⚡ Generate 3 Panel Options", "action": "generate", "value": "generate"},
                {"label": "Cinematic Wide Shot", "action": "set_camera", "value": "Cinematic Wide"},
                {"label": "Dramatic Close-Up", "action": "set_camera", "value": "Dramatic Close-Up"},
            ]
        )

    if any(k in lower for k in ["twist", "plot", "idea", "story", "premise"]):
        return (
            "### 🎬 Creative Direction: Sci-Fi Visual Novel (Mars)\n\n"
            "Here are 3 high-impact story arcs for your project:\n\n"
            "1. **The Subterranean Signal**: An ancient AI underground awakes with memories of Earth's collapse.\n"
            "2. **The Oxygen Syndicate**: Water rationing hides a conspiracy at the Olympus Mons colony.\n"
            "3. **The Clone Horizon**: The protagonist discovers they are the 5th duplicate sent to repair the dome.\n\n"
            "Shall we lock the **Visual Style & Creative Brief** for this story, or edit the **6-Page Outline** first?",
            [
                {"label": "🔒 Lock Style & Brief", "action": "lock_brief", "value": "lock_brief"},
                {"label": "📋 View 6-Page Outline", "action": "view_outline", "value": "view_outline"},
                {"label": "⚡ Generate Panel 1", "action": "generate", "value": "generate"}
            ]
        )

    return (
        f"### 🎬 Director Notes\n\nI have logged your direction regarding: **'{user_content}'** into the Project Bible.\n\nWhat is our next focus for **Page 1 → Panel 1**?",
        [
            {"label": "🔒 Lock Creative Brief", "action": "lock_brief", "value": "lock_brief"},
            {"label": "⚡ Generate Panel Options", "action": "generate", "value": "generate"},
            {"label": "Cinematic Wide Shot", "action": "set_camera", "value": "Cinematic Wide"}
        ]
    )


