from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from uuid import UUID

from app.models.database import get_db
from app.models.story import Story
from app.models.panel import Panel, PanelOption, PanelStatus
from app.schemas.panel import PanelBase, PanelCreate, PanelResponse, PanelOptionResponse
from app.worker.tasks import generate_panel_options_task
from app.worker.celery_app import celery_app

router = APIRouter()

@router.get("/task/{task_id}")
async def get_task_status(task_id: str):
    task = celery_app.AsyncResult(task_id)
    return {"status": task.status, "result": task.result}

@router.post("/{story_id}/panels/generate", status_code=status.HTTP_202_ACCEPTED)
async def generate_panel(story_id: UUID, prompt: str, db: AsyncSession = Depends(get_db)):
    story = await db.get(Story, story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
        
    # 1. Create a placeholder panel
    new_panel = Panel(
        story_id=story_id,
        description=prompt,
        status=PanelStatus.generating
    )
    db.add(new_panel)
    await db.commit()
    await db.refresh(new_panel)
    
    # 2. Enqueue the task with dynamic style
    style = story.visual_style or "Cinematic Graphic Novel"
    task = generate_panel_options_task.delay(str(new_panel.id), prompt, style)
    
    return {"message": "Generation started", "task_id": task.id, "panel_id": new_panel.id}

@router.get("/{story_id}/panels/{panel_id}/options", response_model=List[PanelOptionResponse])
async def get_panel_options(story_id: UUID, panel_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PanelOption).where(PanelOption.panel_id == panel_id))
    return result.scalars().all()

@router.post("/{story_id}/panels/{panel_id}/select/{option_id}")
async def select_panel_option(story_id: UUID, panel_id: UUID, option_id: UUID, db: AsyncSession = Depends(get_db)):
    panel = await db.get(Panel, panel_id)
    if not panel or panel.story_id != story_id:
        raise HTTPException(status_code=404, detail="Panel not found")
        
    option = await db.get(PanelOption, option_id)
    if not option or option.panel_id != panel_id:
        raise HTTPException(status_code=404, detail="Option not found")
        
    # Update panel with selected option details
    panel.image_url = option.image_url
    panel.image_seed = option.seed
    panel.camera_angle = option.camera_angle
    panel.status = PanelStatus.selected
    
    option.is_selected = True
    
    await db.commit()
    return {"message": "Option selected", "panel_id": panel_id}

@router.get("/{story_id}/panels", response_model=List[PanelResponse])
async def get_story_panels(story_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Panel).where(Panel.story_id == story_id).order_by(Panel.created_at.asc())
    )
    return result.scalars().all()

@router.post("/{story_id}/panels", response_model=PanelResponse, status_code=status.HTTP_201_CREATED)
async def create_or_upsert_panel(story_id: UUID, panel_in: PanelCreate, db: AsyncSession = Depends(get_db)):
    story = await db.get(Story, story_id)
    if not story:
        # Create story if it doesn't exist yet
        story = Story(
            id=story_id,
            title="Visual Odyssey",
            genre="General",
            visual_style="Cinematic Graphic Novel",
            user_id=UUID("00000000-0000-0000-0000-000000000000")
        )
        db.add(story)
        await db.commit()

    if panel_in.id:
        existing = await db.get(Panel, panel_in.id)
        if existing:
            for field, val in panel_in.model_dump(exclude_unset=True).items():
                if field != "id":
                    setattr(existing, field, val)
            await db.commit()
            await db.refresh(existing)
            return existing

    panel_data = panel_in.model_dump()
    if not panel_data.get("id"):
        panel_data.pop("id", None)
    
    new_panel = Panel(
        **panel_data,
        story_id=story_id,
        status=PanelStatus.selected
    )
    db.add(new_panel)
    await db.commit()
    await db.refresh(new_panel)
    return new_panel

@router.put("/{story_id}/panels/{panel_id}", response_model=PanelResponse)
async def update_panel(story_id: UUID, panel_id: UUID, panel_in: PanelBase, db: AsyncSession = Depends(get_db)):
    panel = await db.get(Panel, panel_id)
    if not panel or panel.story_id != story_id:
        raise HTTPException(status_code=404, detail="Panel not found")
        
    for field, val in panel_in.model_dump(exclude_unset=True).items():
        setattr(panel, field, val)
        
    await db.commit()
    await db.refresh(panel)
    return panel


