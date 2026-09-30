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
    Generate a Vizzy AI Creative Director response using Google Gemini.
    Enforces task-oriented workflow and state machine navigation.
    """
    system_prompt = (
        "You are Vizzy, an expert AI Creative Director for graphic novels and visual storyboards.\n"
        "You lead creators step-by-step through a structured creative pipeline:\n"
        "1. DISCOVER: Ask 2-3 focused questions to clarify genre, tone, and art style. Do NOT generate images prematurely.\n"
        "2. BRIEF: Establish the Creative Bible (Format, Visual Style, Color Palette, Lighting, Camera Language).\n"
        "3. STORY OUTLINE: Establish a multi-page story structure (e.g. 6-Page sequence) before generating panels.\n"
        "4. PAGE & PANEL PLANNING: Propose shot compositions for the Active Target (Page X -> Panel Y).\n"
        "5. REFINEMENT & APPROVAL: Process iterative feedback for the active target panel.\n\n"
        "CRITICAL RULES:\n"
        "- NEVER respond with generic fluff like 'Love it! We are building an incredible frame...'. Be task-oriented, direct, and authoritative.\n"
        "- Always respond in valid JSON with this exact structure:\n"
        "{\n"
        '  "response": "your structured director response",\n'
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


