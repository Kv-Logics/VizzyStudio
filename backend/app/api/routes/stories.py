from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID

from app.models.database import get_db
from app.models.story import Story, User
from app.schemas.story import StoryCreate, StoryResponse, StoryUpdate

router = APIRouter()

async def get_current_user_id(x_user_id: UUID = Header(default=UUID("00000000-0000-0000-0000-000000000000")), db: AsyncSession = Depends(get_db)) -> UUID:
    # Ensure user exists, if not create
    user = await db.get(User, x_user_id)
    if not user:
        new_user = User(id=x_user_id, email=f"guest_{x_user_id}@vizzy.app", name="Guest")
        db.add(new_user)
        await db.commit()
    return x_user_id

@router.post("/", response_model=StoryResponse, status_code=status.HTTP_201_CREATED)
async def create_story(story_in: StoryCreate, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    new_story = Story(**story_in.model_dump(), user_id=user_id)
    db.add(new_story)
    await db.commit()
    await db.refresh(new_story)
    return new_story

@router.get("/", response_model=List[StoryResponse])
async def list_stories(user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Story).where(Story.user_id == user_id))
    return result.scalars().all()

@router.get("/{story_id}", response_model=StoryResponse)
async def get_story(story_id: UUID, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    story = await db.get(Story, story_id)
    if not story or story.user_id != user_id:
        raise HTTPException(status_code=404, detail="Story not found")
    return story
