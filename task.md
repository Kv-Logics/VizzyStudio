# Task: Vizzy - Interactive Graphic Novel & Storyboard Creator

## Overview
Vizzy is an AI-powered collaborative graphic novel, visual book, and storyboard creator featuring a conversational chat interface. The system guides users step-by-step from conceptualizing story tone, visual style, and outline to generating, choosing, refining, and compiling panels into a cohesive visual sequence, slideshow, or loop video.

## Features & Implementation Plan

### 1. Interactive Vizzy AI Chat Assistant & Onboarding Workflow
- [x] **Project Setup**: React + Vite + Tailwind CSS + Lucide Icons + Canvas Export tools.
- [ ] **Onboarding & Style Definition**:
  - Prompt user for genre (e.g. World War II D-Day drama, Sci-Fi Cyberpunk, Dark Fantasy, Indie Film Storyboard).
  - Define visual style (e.g. Sepia Noir, Gritty Ink & Watercolor, Vibrant Anime, Vintage 1940s Comic, Cinematic Concept Art).
  - Set color palette accents, camera framing, lighting tone, and story synopsis/script notes.
- [ ] **Iterative Panel Creation Workflow**:
  - Step 1: User describes panel action & dialogue/caption.
  - Step 2: Vizzy generates 3 distinct visual variants with camera angles & style matching.
  - Step 3: User picks favorite option, applies fine-tune adjustments (lighting, filters, text bubbles, camera shot type).
  - Step 4: Panel locked & added to visual sequence timeline. Vizzy automatically suggests the next narrative transition.

### 2. Dual-Pane Studio UI & Comic Page Builder
- [ ] **Chat Pane (Left)**: Conversational Vizzy companion with quick action pills, voice/audio sound cues, prompt ideas, and style tweak tools.
- [ ] **Storyboard Studio & Page Preview (Right)**:
  - Timeline sequence viewer (Grid, Horizontal Scroll, Flipbook Reader, Page Layout Grid).
  - Drag-and-drop or reorder panel sequence.
  - Editable Speech Bubbles, Captions, Sound Effect Graphics (BOOM, SHAKING, CRASH), and comic frame stylings.
  - Style Overlays (Halftone dots, Vignette, Sepia tone, Film grain, Cinematic letterboxing).

### 3. Auto-Running Loop / Slideshow / Video Player
- [ ] **Cinematic Presentation Mode**:
  - Ken Burns pan & zoom animation effect on panels.
  - Custom audio soundscapes (War drums, Ocean waves, Dramatic strings, Sci-Fi ambient hum).
  - Auto-advance speed control (2s, 4s, 6s, Manual).
  - Fullscreen autoplay slideshow loop.
  - Render/Export sequence to GIF/Video frames or printable multi-page PDF graphic novel!

### 4. Sample Story Preset ("D-Day Normandy Landing")
- [ ] Preloaded rich multi-panel story template based on D-Day beaches (Omaha Beach, Allied fleet, tense landing craft, dramatic breakthrough) allowing instant interactive play, panel refinement, and loop playback out of the box!
