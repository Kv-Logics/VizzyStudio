from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from app.models.database import Base

class SenderType(str, enum.Enum):
    vizzy = "vizzy"
    user = "user"

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    story_id = Column(UUID(as_uuid=True), ForeignKey("stories.id"), nullable=False)
    sender = Column(SQLEnum(SenderType), nullable=False)
    content = Column(String, nullable=False)
    msg_type = Column(String, default="text")
    quick_replies = Column(JSONB, default=list)
    related_panel_id = Column(UUID(as_uuid=True), ForeignKey("panels.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    story = relationship("Story")
    related_panel = relationship("Panel")
