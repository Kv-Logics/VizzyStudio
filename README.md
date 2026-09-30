# VizzyStudio: AI-Directed Visual Storyboard Engine

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Gemini](https://img.shields.io/badge/AI_Director-Gemini_3.8_Flash-8E75B2?style=flat-square&logo=google)
![Celery](https://img.shields.io/badge/Task_Queue-Celery-37814A?style=flat-square&logo=celery)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql)
![AWS](https://img.shields.io/badge/Deployment-AWS_EC2-FF9900?style=flat-square&logo=amazonaws)

VizzyStudio is a stateful web application that generates collaborative graphic novels and storyboards via an iterative AI chat interface.

---

## 🎯 Requirements & Fulfillment

| Requirement | Implementation Strategy | Technology |
| :--- | :--- | :--- |
| **Input** (Collaborative Chat) | Strict 4-step interview sequence guided by an AI Director. Context injected via DB memory. | `Gemini 3.8 Flash`, `React`, `Zustand` |
| **Flow** (Iterative Generation) | Async background rendering. AI hits external diffusion APIs without blocking the UI. | `FastAPI`, `Celery`, `Redis`, `Pollinations AI` |
| **Output** (Stitched Slideshow) | DB maps sequence order. CSS transitions animate the selected panels into an auto-loop. | `PostgreSQL`, `Tailwind CSS`, `HTML5` |

---

## 🔄 The Iterative User Journey

```mermaid
sequenceDiagram
    participant U as User
    participant V as Vizzy (Gemini AI)
    participant W as Celery Worker
    
    U->>V: Starts New Story (Genre, Style)
    loop Panel by Panel
        V->>U: Asks for Action/Character/Setting
        U->>V: Provides Details
        V->>U: Confirms Details & Triggers Generation
        W->>W: Generates 3 Image Options (Background)
        U->>W: Selects Best Image
    end
    U->>U: Clicks "Play Slideshow" (Auto-loops N panels)
```

---

## 🏗️ Core System Architecture

```mermaid
graph TD;
    subgraph Frontend
    A[React 18 UI] 
    end
    
    subgraph Backend
    B(FastAPI Engine)
    G[Gemini 3.8 LLM]
    end
    
    subgraph Infrastructure
    C[(PostgreSQL DB)]
    D(Redis Broker)
    E[Celery Worker]
    F[Pollinations / NVIDIA Image API]
    end

    A <-->|REST API| B
    B <-->|Chat Context| G
    B -->|Async Save| C
    B -->|Enqueues Task| D
    D -->|Consumes| E
    E -->|Diffusion| F
    E -->|Async Injection| C
```

---

## ☁️ Deployment Pipeline (AWS & Docker)

```mermaid
graph LR;
    A[GitHub] -->|rsync deploy script| B[AWS EC2 Ubuntu]
    B --> C[Docker Compose]
    C --> D[Nginx Reverse Proxy]
    D -->|Port 80| E[React Static Assets]
    D -->|/api/| F[FastAPI Container]
    F --> G[Redis + Celery Containers]
    F --> H[(PostgreSQL)]
```

---

## 💾 Database Schema

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| `stories` | Creative Bible (Global State) | `id`, `title`, `genre`, `visual_style` |
| `chat_messages` | AI Memory Context | `story_id`, `sender`, `content`, `quick_replies` |
| `panels` | Sequence & Camera Rules | `story_id`, `camera_angle`, `description` |
| `panel_options` | Media Assets (3 variants) | `panel_id`, `image_url`, `is_selected` |

---

## ⚡ Performance Optimizations

| Bottleneck | Diagnosis | Engineered Solution |
| :--- | :--- | :--- |
| **AI Context Hallucination** | Token bloat from sending entire chat history. | Strict **sliding-window memory** (last 10 messages). |
| **Worker DB Blocking** | Celery is synchronous, clashing with `asyncpg`. | Wrapped DB injection in an isolated **`asyncio.run()` loop** inside Celery. |
| **UI Scroll Lag** | Expensive CSS `backdrop-blur` repaints on scroll. | Stripped filters, injected **`transform-gpu`** & **`will-change-transform`**. Achieved 60fps. |

---

## 🚀 Testing & User Guide

*See **[GUIDE.md](./GUIDE.md)** for exact testing instructions, user flows, and shortcuts.*
