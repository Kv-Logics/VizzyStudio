from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from app.models.database import Base

class PanelStatus(str, enum.Enum):
    generating = "generating"
    selected = "selected"
    locked = "locked"
    archived = "archived"

class Panel(Base):
    __tablename__ = "panels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    story_id = Column(UUID(as_uuid=True), ForeignKey("stories.id"), nullable=False)
    page_number = Column(Integer, default=1)
    panel_number = Column(Integer, default=1)
    sort_order = Column(Integer, default=0)
    
    title = Column(String)
    description = Column(String)
    camera_angle = Column(String)
    filter_effect = Column(String)
    sound_cue = Column(String)
    image_url = Column(String)
    image_seed = Column(Integer)
    text_elements = Column(JSONB, default=list)
    
    status = Column(SQLEnum(PanelStatus), default=PanelStatus.generating)
    created_at = Column(DateTime, default=datetime.utcnow)

    story = relationship("Story", back_populates="panels")
    options = relationship("PanelOption", back_populates="panel", cascade="all, delete-orphan")

class PanelOption(Base):
    __tablename__ = "panel_options"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    panel_id = Column(UUID(as_uuid=True), ForeignKey("panels.id"), nullable=False)
    image_url = Column(String, nullable=False)
    seed = Column(Integer)
    prompt = Column(String)
    camera_angle = Column(String)
    lighting_tone = Column(String)
    description = Column(String)
    is_selected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    panel = relationship("Panel", back_populates="options")
