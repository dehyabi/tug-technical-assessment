# Wellness Package Management System - Design Document

## Part A: Design & Plan

### 1. Problem Framing & Scope

#### What We're Building
A minimal but complete vertical slice of a **Wellness Package Management System** with three surfaces:
- **Backend API** (NestJS + TypeScript + MySQL)
- **Admin Portal** (Next.js + TypeScript) — CRUD operations for packages
- **Mobile App** (React Native + TypeScript) — Browse available packages

#### What's In Scope (Thin Slice)
- Full CRUD for wellness packages via admin portal
- Mobile endpoint to list available packages
- End-to-end data flow: mobile app → API → database
- Docker compose for one-command local development

#### What's Deliberately Left Out
- **Authentication/Authorization** — Would add OAuth2/JWT but out of scope for this timebox. Assumed admin access for demo.
- **Payment processing** — Not needed for package browsing/management.
- **Image upload/storage** — Packages would have images in production; using placeholder URLs.
- **Advanced search/filtering** — Full-text search, pagination beyond basic offset/limit.
- **Real-time updates** — WebSockets for live admin changes.
- **Production deployment configs** — CI/CD, staging environments, monitoring.

#### Assumptions
- **Scale**: Small-to-medium wellness business (<10k packages, <1k concurrent users). Single MySQL instance sufficient.
- **Users**: Admin portal used by staff (desktop). Mobile app used by customers (iOS/Android).
- **Network**: Mobile app assumes reliable connectivity for MVP. Offline mode deferred.
- **Data sensitivity**: Prices and descriptions are public. No PII in package entity.

---

### 2. Architecture

#### High-Level Diagram

```
┌─────────────────┐       ┌─────────────────┐
│  Admin Portal   │       │   Mobile App    │
│   (Next.js)     │       │ (React Native)  │
│   Port: 3000    │       │   Metro: 8081   │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │      HTTP/JSON          │
         └───────────┬─────────────┘
                     │
         ┌───────────▼───────────┐
         │   Backend API         │
         │   (NestJS)            │
         │   Port: 3001          │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   MySQL Database      │
         │   Port: 3306          │
         └───────────────────────┘
```

#### Code Organization

**Backend (`/backend`)**
```
src/
├── modules/
│   └── packages/           # Domain module
│       ├── dto/              # Data transfer objects
│       ├── entities/         # TypeORM entities
│       ├── packages.controller.ts
│       ├── packages.service.ts
│       └── packages.module.ts
├── config/                   # Database config
├── main.ts                   # Bootstrap with Swagger
└── app.module.ts
```

**Admin Portal (`/admin-portal`)**
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Dashboard/list
│   └── packages/
│       ├── page.tsx          # List view
│       └── [id]/page.tsx     # Edit view
├── components/
│   ├── PackageForm.tsx
│   └── PackageList.tsx
└── lib/
    └── api.ts                # Shared API client
```

**Mobile App (`/mobile-app`)**
```
src/
├── screens/
│   └── PackagesScreen.tsx    # Browse packages
├── components/
│   └── PackageCard.tsx
├── services/
│   └── api.ts                # Axios client
└── App.tsx
```

#### Shared Concerns
- **Types**: Duplicated across repos (no shared library for thin slice). Backend DTOs are source of truth.
- **Validation**: class-validator on backend. Frontend trusts backend validation and shows errors.
- **Error handling**: Backend returns `{ message: string, statusCode: number }`. Surfaces handle display.
- **Config**: `.env` files per repo for API URLs, DB credentials.

---

### 3. Data Model & API Contract

#### Extended WellnessPackage Entity

I extended the base model with practical fields for a real-world system:

| Field | Type | Reason |
|-------|------|--------|
| `id` | UUID (PK) | Non-sequential, safe for exposure |
| `name` | VARCHAR(255) | Package display name |
| `description` | TEXT | Marketing copy |
| `price` | DECIMAL(10,2) | Precise currency storage |
| `duration_minutes` | INT | Duration in minutes |
| `category` | VARCHAR(50) | **Added**: Enables grouping (massage, facial, etc.) |
| `status` | ENUM(active,inactive) | **Added**: Soft-disable without delete |
| `created_at` | TIMESTAMP | Audit |
| `updated_at` | TIMESTAMP | **Added**: Audit trail |

**Why these additions:**
- `category`: Mobile app browsing needs grouping. Without it, a flat list is unwieldy.
- `status`: Real products need activation/deactivation. Hard delete is rarely correct.
- `updated_at`: Standard audit field; admins need to see "when was this last modified."

#### API Surface

**Admin Endpoints** (full CRUD)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/packages` | List all (with pagination) |
| GET | `/admin/packages/:id` | Get single package |
| POST | `/admin/packages` | Create package |
| PUT | `/admin/packages/:id` | Update package |
| DELETE | `/admin/packages/:id` | Hard delete |

**Mobile Endpoints** (read-only, filtered)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/mobile/packages` | List active packages only |

**Request/Response Shapes**

```typescript
// POST /admin/packages
// Request
{
  "name": "Swedish Massage",
  "description": "60-minute full body relaxation massage",
  "price": 85.00,
  "duration_minutes": 60,
  "category": "massage",
  "status": "active"
}

// Response (201 Created)
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Swedish Massage",
  "description": "60-minute full body relaxation massage",
  "price": "85.00",
  "duration_minutes": 60,
  "category": "massage",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}

// GET /mobile/packages
// Response (200 OK)
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Swedish Massage",
    "price": "85.00",
    "duration_minutes": 60,
    "category": "massage"
    // Note: No description in mobile list to reduce payload
  }
]
```

**Key Differences: Admin vs Mobile**
- Admin returns full entity with audit fields. Mobile returns subset for performance.
- Admin includes inactive packages. Mobile filters to `status = active` only.
- Admin supports mutating operations. Mobile is read-only.

**Validation Rules**
- `name`: required, 3-255 chars
- `price`: required, >= 0, max 99999.99
- `duration_minutes`: required, >= 1, <= 480 (8 hours max)
- `category`: required, one of predefined values
- `status`: required, enum

---

### 4. Key Technical Decisions & Trade-offs

#### Decision 1: Monorepo vs Separate Repos
**Chosen**: Separate repos within single GitHub repo (`/backend`, `/admin-portal`, `/mobile-app`).
**Alternatives**: Nx/Turborepo monorepo tooling.
**Trade-off**: Monorepo tooling adds complexity and learning curve. Separate folders are simpler for this assessment and reflect how many teams actually organize micro-frontends.
**Production scale**: Would migrate to Nx or pnpm workspaces for shared types/utils.

#### Decision 2: TypeORM vs Prisma
**Chosen**: TypeORM.
**Alternatives**: Prisma, Sequelize, raw SQL.
**Trade-off**: TypeORM integrates more naturally with NestJS decorators and module system. Prisma is excellent but adds a build step and schema file. For a thin slice, TypeORM's active record pattern is faster to scaffold.
**Production scale**: Would consider Prisma for type-safe client and migrations.

#### Decision 3: REST vs GraphQL
**Chosen**: REST.
**Alternatives**: GraphQL, tRPC.
**Trade-off**: GraphQL is powerful for mobile but adds schema definition and client complexity. REST is sufficient for two endpoints (list, CRUD). tRPC is great for Next.js but doesn't serve React Native easily.
**Production scale**: GraphQL if mobile needs flexible querying (e.g., "packages near me with price filter").

#### Decision 4: React Native CLI vs Expo
**Chosen**: React Native CLI.
**Alternatives**: Expo.
**Trade-off**: Expo is faster to start but abstracts native modules. CLI gives full control and demonstrates deeper mobile knowledge. For a thin slice with no native dependencies, either works.
**Production scale**: Would strongly consider Expo for faster iteration and OTA updates.

#### Decision 5: No Authentication in MVP
**Chosen**: Stubbed/omitted auth.
**Alternatives**: JWT sessions, OAuth2, API keys.
**Trade-off**: Auth is critical but time-consuming. For this assessment, auth would be ~30% of effort for ~5% of evaluated criteria. Will explain "how I'd add it" in session.
**Production scale**: OAuth2 (Google/Apple sign-in for mobile), JWT with refresh tokens, role-based access control (RBAC) for admin.

---

### 5. AI Workflow

#### Which AI Tools Used
- **OpenClaw** (integrated with Ollama Cloud, model **kimi-k2**): Initial scaffolding of all three surfaces — backend (NestJS + TypeORM), admin portal (Next.js), and mobile app (React Native). Prompts were sent via a **Telegram bot integration**.
- **Claude Code** (via Ollama, model **kimi-k2**): Iterative improvements, bug fixes, documentation updates, and refinement of all three projects after the initial OpenClaw build.

#### Workflow Overview

**Phase 1: Initial Build (OpenClaw + Ollama Cloud + kimi-k2)**
All three projects were bootstrapped using OpenClaw connected to Ollama Cloud. Prompts were sent through Telegram to generate:
- NestJS backend with TypeORM entities, services, controllers, and DTOs
- Next.js admin portal with CRUD pages and components
- React Native mobile app with package listing screen
- Docker Compose setup for local development

**Phase 2: Refinement (Claude Code + Ollama + kimi-k2)**
After the initial build, Claude Code (running via Ollama with kimi-k2) was used for:
- Fixing bugs (e.g., seed duplicate prevention, mobile API filtering logic)
- Updating documentation (README, DESIGN.md)
- Improving Docker setup commands and database reset procedures
- Adding screenshot folder structure recommendations

#### Prompts I'm Proud Of

**Prompt 1: Architecture scaffolding (OpenClaw via Telegram)**
```
"Generate a NestJS module structure for a Wellness Package entity with TypeORM. 
Include: entity with UUID PK, service with CRUD, controller with /admin and /mobile 
route prefixes, class-validator DTOs, and Swagger decorators. Follow NestJS best practices 
with proper dependency injection."
```
*Why it worked*: Highly specific with file structure expectations. Result needed minimal cleanup.

**Prompt 2: React Native component generation (OpenClaw via Telegram)**
```
"Create a React Native FlatList component that fetches packages from an API and 
displays them as cards. Include: pull-to-refresh, loading state, error handling, 
and TypeScript interfaces. Use functional components with hooks."
```
*Why it worked*: Specified exact UI patterns and state requirements. Result was production-ready.

**Prompt 3: Docker compose (OpenClaw via Telegram)**
```
"Write a docker-compose.yml for: NestJS API (port 3001), MySQL 8 (port 3306), 
with health checks, named volumes, and environment variables from .env files. 
Include a wait-for-it pattern so API starts after DB is healthy."
```
*Why it worked*: Specified orchestration concerns (health checks, startup order) that are easy to miss.

**Prompt 4: Seed fix (Claude Code)**
```
"Fix the seed script to not duplicate data when re-run."
```
*Why it worked*: Simple, direct prompt. Claude Code added `repo.clear()` before seeding.

#### Where AI Got It Wrong
**The mistake**: AI generated a NestJS entity with `@PrimaryGeneratedColumn('uuid')` but used `@Column('decimal')` for price without specifying precision/scale. TypeORM defaulted to DECIMAL(10,0), losing cents.
**How I caught it**: Reviewed generated SQL via `typeorm schema:log` and saw `price decimal(10,0)`.
**How I corrected**: Explicitly specified `@Column('decimal', { precision: 10, scale: 2 })`.
**Lesson**: Always validate generated schema matches intent, especially for numeric types.

#### Where I Chose NOT to Use AI
- **Database schema decisions**: Chose UUID and DECIMAL after considering auto-increment INT vs UUID and FLOAT vs DECIMAL. Float is unsafe for currency; AI defaulted to FLOAT in some attempts.
- **API route naming**: Decided on `/admin/*` and `/mobile/*` prefixes manually after considering resource-based naming (`/packages` with headers) vs explicit prefixes.
- **Error handling strategy**: Chose NestJS exception filters over try-catch in every controller after reviewing NestJS docs. AI defaulted to verbose try-catch blocks.

---

## Part B: Thin Prototype Notes

### What Was Built
- [x] Backend: NestJS API with TypeORM + MySQL
- [x] Backend: GET /mobile/packages (active only, limited fields)
- [x] Backend: Admin CRUD (POST, GET, PUT, DELETE /admin/packages)
- [x] Admin Portal: Next.js with list + create/edit/delete
- [x] Mobile App: React Native screen fetching and displaying packages
- [x] Docker compose for one-command spin-up
- [x] Swagger/OpenAPI docs at /api
- [x] Unit tests for PackageService

### What's Stubbed
- Authentication: All endpoints are open
- Images: Placeholder text instead of actual image upload
- Pagination: Basic offset/limit, no cursor-based
- Error boundaries: Basic error handling, no Sentry/etc.

### How to Run
See root README.md for setup instructions.
