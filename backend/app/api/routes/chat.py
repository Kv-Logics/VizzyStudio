from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID

from app.models.database import get_db
from app.models.chat_message import ChatMessage, SenderType
from app.schemas.chat_message import ChatMessageCreate, ChatMessageResponse
from app.services.chat_service import generate_vizzy_response

router = APIRouter()

@router.post("/", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(message_in: ChatMessageCreate, db: AsyncSession = Depends(get_db)):
    # Save user message
    user_msg = ChatMessage(**message_in.model_dump())
    db.add(user_msg)
    await db.commit()
    await db.refresh(user_msg)
    
    # Generate and save Vizzy response asynchronously or synchronously (simplified here)
    vizzy_content, quick_replies = await generate_vizzy_response(message_in.content)
    
    vizzy_msg = ChatMessage(
        story_id=message_in.story_id,
        sender=SenderType.vizzy,
        content=vizzy_content,
        quick_replies=quick_replies,
        related_panel_id=message_in.related_panel_id
    )
    db.add(vizzy_msg)
    await db.commit()
    await db.refresh(vizzy_msg)
    
    # Returning Vizzy's response directly for simplicity in the REST API. 
    # In a full WS implementation, we'd broadcast this.
    return vizzy_msg

@router.get("/{story_id}", response_model=List[ChatMessageResponse])
async def get_story_messages(story_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ChatMessage).where(ChatMessage.story_id == story_id).order_by(ChatMessage.created_at))
    return result.scalars().all()
