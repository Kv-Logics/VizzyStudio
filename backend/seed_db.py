import asyncio
from uuid import UUID
from app.models.database import AsyncSessionLocal
from app.models.story import User, Story
import app.models.panel

async def seed():
    async with AsyncSessionLocal() as session:
        user_id = UUID("00000000-0000-0000-0000-000000000000")
        story_id = UUID("123e4567-e89b-12d3-a456-426614174000")
        story2_id = UUID("123e4567-e89b-12d3-a456-426614174001")
        
        user = await session.get(User, user_id)
        if not user:
            user = User(id=user_id, email="guest@vizzy.app", name="Guest User")
            session.add(user)
            await session.commit()
            
        story1 = await session.get(Story, story_id)
        if not story1:
            story1 = Story(id=story_id, user_id=user_id, title="D-Day: Dawn at Omaha Beach", genre="WW2 Drama", visual_style="WW2 Sepia Ink")
            session.add(story1)
            
        story2 = await session.get(Story, story2_id)
        if not story2:
            story2 = Story(id=story2_id, user_id=user_id, title="Neon Rain: Cyberpunk 2099", genre="Cyberpunk Detective", visual_style="Neon Cyberpunk")
            session.add(story2)
            
        await session.commit()
        print("Seed completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
