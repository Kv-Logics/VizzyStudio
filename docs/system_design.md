# Vizzy — Production System Design Document

> **Project**: Collaborative AI Graphic Novel & Storyboard Creator
> **Version**: 1.0 — Production Architecture
> **Last Updated**: September 2026

---

## 1. Product Summary

Vizzy is a collaborative AI-powered visual book creator. Users interact through a **chat interface** to iteratively build graphic novels, comic books, or film storyboards — one panel at a time. The system guides the creative process from story pitch through visual style definition, panel-by-panel image generation with refinement loops, and final compilation into an auto-running slideshow or exported video/PDF.

### Core User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                                 │
│                                                                     │
│  1. ONBOARD ──► 2. DEFINE STYLE ──► 3. GENERATE PANELS ──► 4. EXPORT│
│                                                                     │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────────┐   ┌───────┐│
│  │ Chat w/  │   │ Genre, color │   │ Per-panel loop:  │   │ Stitch││
│  │ Vizzy to │──►│ palette,     │──►│ Describe → Gen 3 │──►│ into  ││
│  │ pitch    │   │ art style,   │   │ options → Pick → │   │ slide-││
│  │ story    │   │ script notes │   │ Refine → Lock    │   │ show  ││
│  └──────────┘   └──────────────┘   └──────────────────┘   └───────┘│
│                                         ▲          │                │
│                                         └──────────┘                │
│                                       Refinement Loop               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER                                   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │              React 19 + TypeScript SPA (Vite)                   │    │
│  │                                                                 │    │
│  │  ┌──────────┐  ┌───────────────┐  ┌──────────┐  ┌───────────┐ │    │
│  │  │ Vizzy    │  │ Storyboard    │  │Slideshow │  │ Export    │ │    │
│  │  │ Chat     │  │ Studio Canvas │  │ Player   │  │ Manager  │ │    │
│  │  │ (Left)   │  │ (Right)       │  │ (Modal)  │  │ (PDF/Vid)│ │    │
│  │  └────┬─────┘  └───────┬───────┘  └─────┬────┘  └────┬──────┘ │    │
│  │       │                │                │             │        │    │
│  │       └────────────────┴────────────────┴─────────────┘        │    │
│  │                           │                                     │    │
│  │                    State Manager (Zustand)                      │    │
│  └─────────────────────────┬───────────────────────────────────────┘    │
│                            │                                            │
│                  REST API + WebSocket                                    │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                      ┌──────▼──────┐
                      │   Nginx /   │
                      │  CloudFront │
                      │   (CDN)     │
                      └──────┬──────┘
                             │
┌────────────────────────────┼────────────────────────────────────────────┐
│                        API TIER                                         │
│                                                                         │
│  ┌─────────────────────────▼───────────────────────────────────────┐    │
│  │                  FastAPI Application Server                      │    │
│  │                  (Python 3.12 / Uvicorn / Async)                 │    │
│  │                                                                  │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │    │
│  │  │ /story   │  │ /panel   │  │ /chat    │  │ /export        │  │    │
│  │  │ routes   │  │ routes   │  │ routes   │  │ routes         │  │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬────────┘  │    │
│  │       │             │             │                 │           │    │
│  │  ┌────▼─────────────▼─────────────▼─────────────────▼────────┐  │    │
│  │  │              Service Layer (Business Logic)                │  │    │
│  │  │  StoryService │ PanelService │ ChatService │ ExportService │  │    │
│  │  └────┬──────────────┬──────────────┬──────────────┬──────────┘  │    │
│  │       │              │              │              │             │    │
│  └───────┼──────────────┼──────────────┼──────────────┼─────────────┘    │
│          │              │              │              │                   │
└──────────┼──────────────┼──────────────┼──────────────┼──────────────────┘
           │              │              │              │
┌──────────┼──────────────┼──────────────┼──────────────┼──────────────────┐
│          │         WORKER TIER         │              │                   │
│          │              │              │              │                   │
│  ┌───────▼──────┐ ┌─────▼──────┐ ┌────▼─────┐ ┌─────▼──────────┐       │
│  │  PostgreSQL  │ │  Celery    │ │  Redis   │ │  S3 / MinIO    │       │
│  │  (Stories,   │ │  Workers   │ │  (Cache, │ │  (Image Blob   │       │
│  │   Panels,    │ │  (Image    │ │   Queue, │ │   Storage)     │       │
│  │   Messages)  │ │   Gen,     │ │   PubSub)│ │                │       │
│  │              │ │   Export)  │ │          │ │                │       │
│  └──────────────┘ └─────┬──────┘ └──────────┘ └────────────────┘       │
│                         │                                               │
│                   ┌─────▼──────────────┐                                │
│                   │   AI Generation    │                                │
│                   │   Pipeline         │                                │
│                   │                    │                                │
│                   │  ┌──────────────┐  │                                │
│                   │  │ OpenAI       │  │                                │
│                   │  │ DALL-E 3 /   │  │                                │
│                   │  │ GPT-4o       │  │                                │
│                   │  └──────────────┘  │                                │
│                   │  ┌──────────────┐  │                                │
│                   │  │ Replicate /  │  │                                │
│                   │  │ Stability AI │  │                                │
│                   │  │ SDXL / Flux  │  │                                │
│                   │  └──────────────┘  │                                │
│                   │  ┌──────────────┐  │                                │
│                   │  │ Self-Hosted  │  │                                │
│                   │  │ ComfyUI /    │  │                                │
│                   │  │ A1111 (GPU)  │  │                                │
│                   │  └──────────────┘  │                                │
│                   └────────────────────┘                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Model (PostgreSQL)

```
┌─────────────────────┐        ┌─────────────────────────┐
│      users           │        │      stories             │
├─────────────────────┤        ├─────────────────────────┤
│ id          UUID PK │◄──┐    │ id            UUID PK   │
│ email       TEXT     │   │    │ user_id       UUID FK   │──► users
│ name        TEXT     │   │    │ title         TEXT      │
│ avatar_url  TEXT     │   │    │ genre         TEXT      │
│ credits     INT      │   │    │ visual_style  TEXT      │
│ plan        ENUM     │   │    │ color_palette JSONB     │
│ created_at  TS       │   │    │ synopsis      TEXT      │
│ updated_at  TS       │   │    │ character_notes TEXT    │
└─────────────────────┘   │    │ status        ENUM      │
                          │    │   (draft|complete|pub)   │
                          │    │ created_at    TS         │
                          │    │ updated_at    TS         │
                          │    └────────┬────────────────┘
                          │             │
                          │             │ 1:N
                          │             ▼
                          │    ┌─────────────────────────┐
                          │    │      panels              │
                          │    ├─────────────────────────┤
                          │    │ id            UUID PK   │
                          │    │ story_id      UUID FK   │──► stories
                          │    │ page_number   INT       │
                          │    │ panel_number  INT       │
                          │    │ sort_order    INT       │
                          │    │ title         TEXT      │
                          │    │ description   TEXT      │
                          │    │ camera_angle  TEXT      │
                          │    │ filter_effect TEXT      │
                          │    │ sound_cue     TEXT      │
                          │    │ image_url     TEXT      │
                          │    │ image_seed    INT       │
                          │    │ text_elements JSONB     │
                          │    │ status        ENUM      │
                          │    │   (generating|selected  │
                          │    │    |locked|archived)    │
                          │    │ created_at    TS        │
                          │    └────────┬────────────────┘
                          │             │
                          │             │ 1:N
                          │             ▼
                          │    ┌─────────────────────────┐
                          │    │   panel_options          │
                          │    ├─────────────────────────┤
                          │    │ id            UUID PK   │
                          │    │ panel_id      UUID FK   │──► panels
                          │    │ image_url     TEXT      │
                          │    │ seed          INT       │
                          │    │ prompt        TEXT      │
                          │    │ camera_angle  TEXT      │
                          │    │ lighting_tone TEXT      │
                          │    │ description   TEXT      │
                          │    │ is_selected   BOOL      │
                          │    │ created_at    TS        │
                          │    └─────────────────────────┘
                          │
                          │    ┌─────────────────────────┐
                          │    │   chat_messages          │
                          │    ├─────────────────────────┤
                          └───►│ id            UUID PK   │
                               │ story_id      UUID FK   │──► stories
                               │ sender        ENUM      │
                               │   (vizzy|user)          │
                               │ content       TEXT      │
                               │ msg_type      TEXT      │
                               │ quick_replies JSONB     │
                               │ related_panel UUID FK   │──► panels
                               │ created_at    TS        │
                               └─────────────────────────┘
```

> [!NOTE]
> `text_elements` is stored as JSONB for flexibility — each entry contains `{id, type, content, speaker, position: {x, y}}`. This avoids a separate join table for what is essentially panel-local UI overlay data.

---

## 4. API Contract (FastAPI Endpoints)

### 4.1 Story Management

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/v1/stories` | Create a new story with metadata (title, genre, style, synopsis) |
| `GET` | `/api/v1/stories/{story_id}` | Fetch full story with all panels |
| `PATCH` | `/api/v1/stories/{story_id}` | Update story metadata (style, synopsis, characters) |
| `DELETE` | `/api/v1/stories/{story_id}` | Soft-delete a story |
| `GET` | `/api/v1/stories` | List all stories for authenticated user |

### 4.2 Panel Generation & Management

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/v1/stories/{story_id}/panels/generate` | Submit prompt → enqueue Celery task → return `task_id` |
| `GET` | `/api/v1/tasks/{task_id}/status` | Poll generation status (`pending` → `processing` → `complete`) |
| `GET` | `/api/v1/stories/{story_id}/panels/{panel_id}/options` | Fetch the 3 generated options for a panel |
| `POST` | `/api/v1/stories/{story_id}/panels/{panel_id}/select` | User picks one option → lock panel |
| `PATCH` | `/api/v1/stories/{story_id}/panels/{panel_id}` | Update text elements, filter, camera, sound cue |
| `POST` | `/api/v1/stories/{story_id}/panels/{panel_id}/regenerate` | Re-render the panel artwork with tweaked params |
| `DELETE` | `/api/v1/stories/{story_id}/panels/{panel_id}` | Remove a panel |
| `PATCH` | `/api/v1/stories/{story_id}/panels/reorder` | Batch update `sort_order` for drag-and-drop |

### 4.3 Conversational Chat (WebSocket)

| Protocol | Endpoint | Description |
|:---|:---|:---|
| `WS` | `/ws/chat/{story_id}` | Real-time bidirectional chat with Vizzy AI assistant |

**WebSocket message protocol:**
```json
// Client → Server
{ "type": "user_message", "content": "Show the Higgins boat approaching under fire" }

// Server → Client (streamed)
{ "type": "vizzy_message", "content": "💥 Great scene! I'll generate 3 options...", "quick_replies": [...] }
{ "type": "generation_started", "task_id": "abc-123", "panel_number": 5 }
{ "type": "generation_progress", "task_id": "abc-123", "progress": 65 }
{ "type": "generation_complete", "task_id": "abc-123", "options": [...] }
```

### 4.4 Export & Publishing

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/v1/stories/{story_id}/export/pdf` | Generate PDF graphic novel → return download URL |
| `POST` | `/api/v1/stories/{story_id}/export/video` | Stitch panels into MP4 slideshow with Ken Burns + audio |
| `POST` | `/api/v1/stories/{story_id}/export/gif` | Compile panels into animated GIF loop |
| `GET` | `/api/v1/stories/{story_id}/slideshow` | Return panel sequence JSON for client-side slideshow player |

---

## 5. AI Image Generation Pipeline

This is the core engine. It must generate **3 distinct visual options** per panel request, each with a different camera angle.

### Pipeline Flow

```
┌──────────────┐    ┌───────────────┐    ┌─────────────────┐    ┌──────────┐
│ User Prompt  │───►│ Prompt        │───►│ Image Gen       │───►│ Post-    │
│ + Style      │    │ Engineering   │    │ (3 parallel     │    │ Process  │
│ + Camera     │    │ Service       │    │  API calls)     │    │ + Upload │
└──────────────┘    └───────────────┘    └─────────────────┘    └──────────┘
```

### 5.1 Prompt Engineering Service

The raw user prompt is transformed into a rich, style-aware generation prompt:

```
INPUT:  "Soldiers charging out of the landing craft into the surf"
STYLE:  "WW2 Sepia Ink"
CAMERA: "Cinematic Wide"

OUTPUT PROMPT (sent to image API):
  "Cinematic wide-angle shot of WW2 soldiers charging from a Higgins
   landing craft into violent surf on Omaha Beach. Heavy ink linework,
   sepia-toned, vintage newsprint texture, cross-hatching shadows,
   dramatic overcast sky with artillery explosions in background.
   Style: graphic novel panel, comic book illustration, high contrast."
```

**The prompt builder injects:**
- Camera framing instructions (wide, close-up, low-angle, etc.)
- Visual style descriptors from the style preset
- Color palette constraints
- Consistent character descriptors from story metadata
- Negative prompt for quality control

### 5.2 Generation Provider Strategy

Use a **provider adapter pattern** so the backend can swap between generation APIs without changing business logic:

```
ImageGenerationProvider (Abstract Base)
├── OpenAIProvider        (DALL-E 3 — high quality, $0.04/image)
├── ReplicateProvider     (Flux / SDXL — fast, $0.003/image)
├── StabilityProvider     (Stable Diffusion 3 — mid-tier)
└── LocalComfyUIProvider  (Self-hosted GPU — zero marginal cost)
```

**For each panel request, fire 3 parallel generation calls** with varied camera angles using `asyncio.gather()`.

### 5.3 Post-Processing Pipeline

After raw images return from the AI provider:
1. **Resize & crop** to target aspect ratio (16:9 / 4:3)
2. **Apply style filter** (sepia wash, halftone dot overlay, vignette, film grain) via Pillow
3. **Add comic frame border** (black stroke, jagged edge, etc.)
4. **Upload to S3/MinIO** blob storage → return CDN URL
5. **Generate thumbnail** (240px wide) for chat previews

---

## 6. Vizzy Chat AI Engine

The conversational assistant is powered by an LLM (GPT-4o / Claude) with a carefully structured system prompt.

### System Prompt Architecture

```
ROLE: You are Vizzy, a creative AI graphic novel director.
CONTEXT: {story_metadata} — title, genre, style, synopsis, characters
PANEL HISTORY: {completed_panels[]} — descriptions of locked panels
CURRENT STATE: Working on Panel {N}

BEHAVIOR RULES:
1. Guide the user through story beats one panel at a time
2. After the user describes a scene, generate 3 visual options
3. Ask clarifying questions about camera angle, mood, dialogue
4. Suggest narrative transitions between panels
5. Keep responses concise and energetic
```

### Conversation State Machine

```
         ┌──────────┐
         │  ONBOARD │ ◄── New story created
         └────┬─────┘
              │ User provides pitch
              ▼
     ┌────────────────┐
     │  STYLE_SETUP   │ ◄── Gather genre, colors, art style
     └────────┬───────┘
              │ Style confirmed
              ▼
     ┌────────────────┐
     │ PANEL_PROMPT   │ ◄── Waiting for scene description
     └────────┬───────┘
              │ User describes scene
              ▼
     ┌────────────────┐
     │ GENERATING     │ ◄── 3 options being rendered
     └────────┬───────┘
              │ Options delivered
              ▼
     ┌────────────────┐
     │ OPTION_PICK    │ ◄── User selecting / refining
     └────┬───────┬───┘
          │       │
    Pick  │       │ Refine (loop back)
          ▼       ▼
     ┌────────────────┐
     │ PANEL_LOCKED   │ ◄── Panel approved
     └────────┬───────┘
              │ Auto-advance to next
              ▼
     ┌────────────────┐
     │ PANEL_PROMPT   │ ◄── Cycle repeats for Panel N+1
     └────────┬───────┘
              │ User says "done" / all panels complete
              ▼
     ┌────────────────┐
     │ STORY_COMPLETE │ ◄── Compile slideshow / export
     └────────────────┘
```

---

## 7. Export & Video Pipeline

### 7.1 PDF Graphic Novel

```
Panels[] ──► ReportLab / WeasyPrint ──► Multi-page A4 Landscape PDF
                                         │
                                         ├── Cover Page (Title, Genre, Synopsis)
                                         ├── 2 panels per page spread
                                         ├── Speech bubble text transcripts
                                         └── Back cover with credits
```

### 7.2 Video / Slideshow Compilation

```
Panels[] ──► FFmpeg Pipeline ──► MP4 / WebM Video
              │
              ├── Ken Burns pan/zoom animation per frame
              ├── Crossfade transitions (0.5s dissolve)
              ├── Audio layer (synthesized soundscape or upload)
              ├── Caption subtitle track (.srt overlay)
              └── Loop-ready (last frame crossfades to first)

Command pattern:
  ffmpeg -framerate 1/{duration} -i panel_%03d.png \
         -vf "zoompan=z='min(zoom+0.001,1.5)':d={fps*duration}" \
         -c:v libx264 -pix_fmt yuv420p output.mp4
```

### 7.3 GIF Loop

```
Panels[] ──► Pillow / FFmpeg ──► Animated GIF
              │
              ├── Optimized palette (256 colors)
              ├── Frame delay configurable (2s–8s)
              └── Infinite loop flag
```

---

## 8. Infrastructure & Deployment

### 8.1 Target Architecture (AWS / GCP)

```
┌────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION DEPLOYMENT                        │
│                                                                     │
│  ┌──────────────┐     ┌──────────────────────────────────────┐     │
│  │  CloudFront  │     │        ECS Fargate / Cloud Run       │     │
│  │  CDN + WAF   │────►│                                      │     │
│  │              │     │  ┌──────────┐  ┌──────────────────┐  │     │
│  │  Static SPA  │     │  │ FastAPI  │  │ Celery Workers   │  │     │
│  │  (S3 Bucket) │     │  │ (2+ rpl) │  │ (GPU instances   │  │     │
│  │              │     │  │          │  │  for self-hosted │  │     │
│  └──────────────┘     │  │          │  │  or CPU for API  │  │     │
│                       │  │          │  │  calls)          │  │     │
│                       │  └─────┬────┘  └────────┬─────────┘  │     │
│                       │        │                │            │     │
│                       └────────┼────────────────┼────────────┘     │
│                                │                │                   │
│  ┌─────────────────────────────┼────────────────┼─────────────┐    │
│  │          DATA TIER          │                │             │    │
│  │                             │                │             │    │
│  │  ┌──────────────┐  ┌───────▼──┐  ┌──────────▼──────────┐ │    │
│  │  │  RDS         │  │  Redis   │  │  S3 / MinIO         │ │    │
│  │  │  PostgreSQL  │  │ ElastiC. │  │  (Images, PDFs,     │ │    │
│  │  │  (Multi-AZ)  │  │ (Cluster)│  │   Videos)           │ │    │
│  │  └──────────────┘  └──────────┘  └─────────────────────┘ │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 CI/CD Pipeline

```
GitHub Push ──► GitHub Actions ──► Build & Test ──► Deploy
                    │
                    ├── Lint (Ruff + oxlint)
                    ├── Type check (mypy + tsc)
                    ├── Unit tests (pytest + vitest)
                    ├── Integration tests (httpx + playwright)
                    ├── Docker build (multi-stage)
                    ├── Push to ECR / Artifact Registry
                    └── Deploy to ECS / Cloud Run (blue-green)
```

### 8.3 Docker Compose (Local Dev)

```yaml
services:
  frontend:
    build: ./frontend
    ports: ["5173:5173"]

  api:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgresql+asyncpg://vizzy:pass@postgres/vizzy
      REDIS_URL: redis://redis:6379/0
      OPENAI_API_KEY: ${OPENAI_API_KEY}

  worker:
    build: ./backend
    command: celery -A app.worker worker --loglevel=info
    depends_on: [redis]

  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: vizzy
      POSTGRES_PASSWORD: pass

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports: ["9000:9000", "9001:9001"]
```

---

## 9. Observability & Monitoring

### 9.1 Logging

| Layer | Tool | What to log |
|:---|:---|:---|
| API | Structured JSON (structlog) | Request/response, latency, user_id, story_id |
| Workers | Celery task logs | Generation time, provider used, cost, errors |
| Frontend | Sentry Browser SDK | JS errors, performance traces, user sessions |

### 9.2 Metrics (Prometheus / CloudWatch)

| Metric | Type | Alert Threshold |
|:---|:---|:---|
| `api_request_duration_seconds` | Histogram | p99 > 2s |
| `image_generation_duration_seconds` | Histogram | p99 > 30s |
| `image_generation_cost_usd` | Counter | Daily > $50 |
| `active_websocket_connections` | Gauge | > 500 |
| `celery_queue_depth` | Gauge | > 100 pending |
| `credits_consumed_total` | Counter | Per-user rate limit |

### 9.3 Distributed Tracing

Use **OpenTelemetry** to trace a single panel generation request across:
```
Client Click → API Route → Prompt Builder → Celery Enqueue →
Worker Pickup → AI Provider Call → Post-Process → S3 Upload →
WebSocket Push → Client Render
```

---

## 10. Security & Access Control

| Concern | Solution |
|:---|:---|
| **Authentication** | JWT tokens via Auth0 / Supabase Auth / Firebase Auth |
| **Authorization** | Row-level security — users can only access their own stories |
| **API Rate Limiting** | Redis sliding window: 60 req/min per user, 10 generations/min |
| **Image Content Safety** | OpenAI moderation API pre-check on prompts + generated images |
| **CORS** | Strict origin whitelist (production domain only) |
| **Secrets Management** | AWS Secrets Manager / GCP Secret Manager (never in env files) |
| **Input Sanitization** | Pydantic validators on all inputs, max prompt length 2000 chars |
| **File Upload Security** | Validate MIME types, max 10MB, virus scan on user uploads |

---

## 11. Cost Model & Credits System

### Per-Panel Generation Cost

| Provider | Cost/Image | 3 Options | Notes |
|:---|:---|:---|:---|
| DALL-E 3 (1024x1024) | $0.040 | $0.12 | Highest quality |
| Replicate Flux | $0.003 | $0.009 | Fast, good quality |
| Stability AI SD3 | $0.010 | $0.03 | Mid-tier |
| Self-Hosted (A100 GPU) | ~$0.002 | $0.006 | Amortized GPU cost |

### Credits System

```
Free Tier:    50 credits   (≈16 panels, enough for 1 short story)
Pro Tier:     2,000 credits ($19/mo)
Enterprise:   Unlimited     (custom pricing)

1 Panel Generation = 3 credits (generates 3 options)
1 Refinement       = 1 credit  (regenerate single option)
1 PDF Export       = 0 credits
1 Video Export     = 5 credits
```

---

## 12. Scaling Strategy

### Phase 1: MVP Launch (0–1K users)
- Single ECS task (2 vCPU, 4GB)
- Single Celery worker
- RDS `db.t3.medium`
- Use DALL-E 3 API (no GPU infra needed)

### Phase 2: Growth (1K–50K users)
- Auto-scaling ECS service (2–8 tasks)
- Celery worker pool (3–10 workers)
- RDS `db.r6g.large` with read replica
- Redis cluster mode
- Add Replicate as secondary provider for cost control

### Phase 3: Scale (50K+ users)
- Kubernetes (EKS) for fine-grained pod scaling
- Dedicated GPU nodes for self-hosted Flux/SDXL
- PostgreSQL with pgbouncer connection pooling
- CDN edge caching for generated images
- Multi-region deployment for latency

---

## 13. Project Directory Structure

```
vizzy/
├── frontend/                    # React 19 + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/            # VizzyChat.tsx
│   │   │   ├── Storyboard/      # PanelGrid.tsx, PanelEditorModal.tsx
│   │   │   ├── Slideshow/       # LoopSlideshowModal.tsx
│   │   │   ├── Wizard/          # StorySetupWizardModal.tsx
│   │   │   └── Navbar.tsx
│   │   ├── services/            # API client, WebSocket client
│   │   ├── stores/              # Zustand state management
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                     # Python FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── stories.py
│   │   │   │   ├── panels.py
│   │   │   │   ├── chat.py
│   │   │   │   └── exports.py
│   │   │   └── deps.py          # Dependency injection
│   │   ├── services/
│   │   │   ├── story_service.py
│   │   │   ├── panel_service.py
│   │   │   ├── chat_service.py
│   │   │   ├── prompt_builder.py
│   │   │   └── export_service.py
│   │   ├── ai/
│   │   │   ├── base_provider.py
│   │   │   ├── openai_provider.py
│   │   │   ├── replicate_provider.py
│   │   │   └── comfyui_provider.py
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── story.py
│   │   │   ├── panel.py
│   │   │   └── chat_message.py
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── worker/              # Celery tasks
│   │   │   ├── tasks.py
│   │   │   └── celery_app.py
│   │   ├── config.py
│   │   └── main.py              # FastAPI app factory
│   ├── alembic/                 # DB migrations
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

---

## 14. Key Technical Decisions Summary

| Decision | Choice | Rationale |
|:---|:---|:---|
| Frontend Framework | React 19 + TypeScript | Mature ecosystem, TypeScript safety, Vite fast HMR |
| Backend Framework | FastAPI (Python) | Async-native, auto OpenAPI docs, Pydantic validation |
| Task Queue | Celery + Redis | Battle-tested for long-running image generation jobs |
| Database | PostgreSQL + JSONB | Relational integrity for stories/panels, JSONB for flexible text elements |
| Object Storage | S3 / MinIO | Standard blob storage for images, PDFs, videos |
| Real-time Comms | WebSocket (FastAPI) | Streaming Vizzy responses + generation progress |
| Image Generation | Multi-provider adapter | Swap between DALL-E 3, Flux, SDXL without code changes |
| Video Compilation | FFmpeg (subprocess) | Industry standard, Ken Burns effects, audio mixing |
| Auth | JWT + Auth0/Supabase | Managed auth, social logins, RBAC |
| Deployment | ECS Fargate / Cloud Run | Serverless containers, auto-scaling, no server management |
