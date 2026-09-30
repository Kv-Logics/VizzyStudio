# VizzyStudio: User Guide & Testing Instructions

Welcome to **VizzyStudio**! This guide will walk you through how to use the application, interact with your AI Creative Director (Vizzy), and test the panel generation workflow.

## 🎬 How to Use VizzyStudio

VizzyStudio is a collaborative storyboard and graphic novel creator. Instead of giving a massive, complex prompt all at once, you will work step-by-step with Vizzy to design each panel.

### The 4-Step Prompting Sequence

Vizzy requires four key details to generate a stunning panel. You can provide these one by one as Vizzy asks, or all at once!

1.  **Main Action:** What is happening in the scene?
    *   *Example:* "He is running across the sand while shouting orders."
2.  **Character & Emotions:** Who is in the scene and what do they feel?
    *   *Example:* "The soldier looks terrified but brave, covered in dirt."
3.  **Setting & Lighting:** Where is it and what is the mood?
    *   *Example:* "A stormy beach at dawn with heavy smoke and explosions."
4.  **Camera Angle:** How is the scene framed?
    *   *Example:* "I want a dramatic low-angle shot."

### Features & How to Use Them

*   **Interactive Chatbot:** Type your ideas directly into the chat. Vizzy will guide you and ask clarifying questions until the creative brief is complete.
*   **Context Memory:** Vizzy remembers your chat history! You don't have to repeat details. If you say the character is running in message 1, Vizzy will remember that in message 3.
*   **Quick Replies:** Use the lightning bolt (⚡) buttons to instantly reply to Vizzy without typing. Options like `⚡ Lock Creative Brief` or `⚡ GENERATE PANEL` act as fast shortcuts.
*   **Clear Chat:** Click the **Clear Chat** button at the top to wipe the slate clean and start a brand new story from scratch.
*   **Adjustable Chat Window:** Hover over the boundary between the chat window and the canvas, click, and drag to resize the chatbot window exactly to your liking.

---

## 🚀 How to Test the Workflow

To verify that the AI prompt logic, context memory, and generation are working smoothly, follow these exact steps:

1.  **Start Fresh:** Click the **Clear Chat** button at the top of the screen.
2.  **Give the Action:** Paste the following prompt and hit send:
    > *I want to make a panel of a soldier on a beach. He is running across the sand while shouting orders to his squad.*
3.  **Observe Vizzy:** Vizzy should reply enthusiastically and ask you for details about the Character or the Setting (Step 2/3).
4.  **Give the Rest of the Details:** Paste the following prompt and hit send:
    > *The soldier looks terrified but brave, covered in dirt. The setting is a stormy beach at dawn with heavy smoke and explosions. I want a dramatic low-angle shot.*
5.  **Generate:** Vizzy will recognize that all four requirements (Action, Character, Setting, Camera) have been met! It will summarize your scene and offer a **⚡ GENERATE PANEL** quick reply.
6.  **View Options:** Click **⚡ GENERATE PANEL**. The background worker will generate 3 different cinematic options. Pick your favorite to add it to the canvas!
