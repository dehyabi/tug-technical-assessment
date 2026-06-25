# Wellness Package Management System

A full-stack wellness package management system with:
- **Backend**: NestJS API with TypeORM + MySQL
- **Admin Portal**: Next.js web interface for CRUD operations
- **Mobile App**: React Native app for browsing packages

## Quick Start (Docker)

```bash
# Clone and enter project
cd tug-technical-assessment

# Start everything (MySQL + Backend + Admin Portal)
docker-compose up -d

# Backend API: http://localhost:3001
# Admin Portal: http://localhost:3000
# Swagger Docs: http://localhost:3001/api
```

## Project Structure

```
tug-technical-assessment/
├── backend/              # NestJS API
├── admin-portal/         # Next.js admin UI
├── mobile-app/           # React Native mobile app
├── docker-compose.yml    # One-command local dev
└── docs/
    └── DESIGN.md         # Full design document
```

## Running Locally

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- React Native development environment (for mobile)

### 1. Database
```bash
docker-compose up -d mysql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run migration:run  # if using migrations
npm run start:dev
```

### 3. Admin Portal
```bash
cd admin-portal
cp .env.example .env
npm install
npm run dev
```

### 4. Mobile App
```bash
cd mobile-app
npm install
# iOS
npx react-native run-ios
# Android
npx react-native run-android
```

## API Endpoints

### Admin
- `GET /admin/packages` — List all packages
- `POST /admin/packages` — Create package
- `GET /admin/packages/:id` — Get package
- `PUT /admin/packages/:id` — Update package
- `DELETE /admin/packages/:id` — Delete package

### Mobile
- `GET /mobile/packages` — List active packages

## Tech Stack

| Surface | Technology |
|---------|-----------|
| Backend | NestJS, TypeORM, MySQL, Swagger |
| Admin Portal | Next.js 14, TypeScript, Tailwind CSS |
| Mobile | React Native, TypeScript, Axios |
| DevOps | Docker, Docker Compose |

## Design Decisions

See [docs/DESIGN.md](docs/DESIGN.md) for:
- Architecture diagrams
- Data model & API contracts
- Technical trade-offs
- AI workflow documentation

## License

MIT