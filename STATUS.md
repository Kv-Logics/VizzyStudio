# Project Status Update: VizzyStudio (Graphic Novel Creator)

**Current Status:**  
The core MVP is fully built and deployed. The collaborative chat-to-canvas workflow is fully operational. A user can start a story, chat with the AI Director (Vizzy) to flesh out details, generate panel options, select their favorite, and view the final sequence in an auto-running slideshow.

## What I Built (Features & Architecture)
*   **Creative Setup Wizard:** Added an onboarding flow where users define their aesthetic (e.g., WW2 Sepia, Cyberpunk), genre, and high-level synopsis to establish the "Creative Bible" before chatting.
*   **Stateful AI Chat Interface (Vizzy):** Built a custom React chat UI. The backend uses `gemini-3.8-flash` with a strict system prompt to guide the user step-by-step (Action → Character → Setting → Camera). It dynamically generates "Quick Reply" buttons for a seamless UX.
*   **Asynchronous Image Generation:** When the prompt is finalized, the backend spins up a **Celery Background Worker** using Redis. It generates 3 cinematic variations of the panel in the background so the UI never blocks. 
*   **Cloud Persistence:** Connected a PostgreSQL database via SQLAlchemy to save stories, chat history, and image variants. This allows the user to resume their work on any device.
*   **Slideshow & Grid Views:** Built a responsive canvas that stitches the selected images together. Added a "Filmstrip" mode and a modal slideshow player to view the graphic novel sequentially.

## Blockers & Technical Challenges Overcome
*   **LLM Context Amnesia & Stubbornness:** Initially, the LLM wouldn't remember previous messages or was too rigid in following its sequence, trapping users in a loop. Fixed this by passing the last 10 messages as context to the backend and modifying the system prompt to intelligently skip questions if the user already provided the info.
*   **Model Deprecation Limits:** Hit 404 API errors early on because the hardcoded `gemini-1.5-flash` model was deprecated. Migrated the backend to `gemini-3.8-flash` to restore stability.
*   **Async Database Writes in Celery:** The background worker was successfully generating image options but failing to save them to Postgres because Celery isn't natively async. This caused the frontend to spin endlessly. Engineered a solution to run an async DB session inside the synchronous Celery worker to save the results.
*   **Frontend Scrolling Lag:** As the storyboard grew, the UI suffered severe lag. Traced this back to expensive CSS `backdrop-blur` filters and layout recalculations on hover. Optimized the React components by stripping heavy filters during scroll and injecting `transform-gpu` and `will-change-transform` tags to offload rendering to the hardware. 

---

*For usage instructions and testing steps, please refer to the [User Guide](GUIDE.md).*
