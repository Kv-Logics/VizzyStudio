from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from app.models.chat_message import SenderType

class ChatMessageBase(BaseModel):
    content: str
    msg_type: Optional[str] = "text"
    quick_replies: Optional[List[Dict[str, Any]]] = []
    related_panel_id: Optional[UUID] = None

class ChatMessageCreate(ChatMessageBase):
    sender: SenderType
    story_id: UUID

class ChatMessageResponse(ChatMessageBase):
    id: UUID
    story_id: UUID
    sender: SenderType
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
