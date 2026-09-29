from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from app.models.database import Base

class StoryStatus(str, enum.Enum):
    draft = "draft"
    complete = "complete"
    published = "published"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    avatar_url = Column(String)
    credits = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    stories = relationship("Story", back_populates="user", cascade="all, delete-orphan")

class Story(Base):
    __tablename__ = "stories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    genre = Column(String)
    visual_style = Column(String)
    color_palette = Column(JSONB, default=list)
    synopsis = Column(String)
    character_notes = Column(String)
    status = Column(SQLEnum(StoryStatus), default=StoryStatus.draft)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="stories")
    panels = relationship("Panel", back_populates="story", cascade="all, delete-orphan", order_by="Panel.sort_order")
