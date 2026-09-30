import os
import google.generativeai as genai
from dotenv import load_dotenv
import asyncio

load_dotenv("backend/.env")
load_dotenv(".env")

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key present: {bool(api_key)}")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    async def test():
        try:
            print("Sending request...")
            response = await model.generate_content_async("Hello", generation_config={"response_mime_type": "application/json"})
            print(f"Response: {response.text}")
        except Exception as e:
            print(f"Error: {e}")
            
    asyncio.run(test())
