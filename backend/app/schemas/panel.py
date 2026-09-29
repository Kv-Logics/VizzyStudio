from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from app.models.panel import PanelStatus

class PanelBase(BaseModel):
    page_number: int = 1
    panel_number: int = 1
    sort_order: int = 0
    title: Optional[str] = None
    description: Optional[str] = None
    camera_angle: Optional[str] = None
    filter_effect: Optional[str] = None
    sound_cue: Optional[str] = None
    text_elements: Optional[List[Dict[str, Any]]] = []

class PanelCreate(PanelBase):
    pass

class PanelUpdate(PanelBase):
    pass

class PanelOptionResponse(BaseModel):
    id: UUID
    panel_id: UUID
    image_url: str
    seed: Optional[int] = None
    prompt: Optional[str] = None
    camera_angle: Optional[str] = None
    lighting_tone: Optional[str] = None
    description: Optional[str] = None
    is_selected: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PanelResponse(PanelBase):
    id: UUID
    story_id: UUID
    image_url: Optional[str] = None
    image_seed: Optional[int] = None
    status: PanelStatus
    created_at: datetime
    options: Optional[List[PanelOptionResponse]] = []

    model_config = ConfigDict(from_attributes=True)
