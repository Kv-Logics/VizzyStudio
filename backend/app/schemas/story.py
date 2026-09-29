from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.story import StoryStatus

class StoryBase(BaseModel):
    title: str
    genre: Optional[str] = None
    visual_style: Optional[str] = None
    color_palette: Optional[List[str]] = []
    synopsis: Optional[str] = None
    character_notes: Optional[str] = None

class StoryCreate(StoryBase):
    pass

class StoryUpdate(StoryBase):
    title: Optional[str] = None

class StoryResponse(StoryBase):
    id: UUID
    user_id: UUID
    status: StoryStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
