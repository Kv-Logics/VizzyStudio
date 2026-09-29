import asyncio
from app.models.database import engine, Base
import app.models.story
import app.models.panel
import app.models.chat_message

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init())
