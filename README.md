# Yugendiran — 3D Portfolio

Production-quality 3D personal portfolio for an AI Developer / Senior Software Developer.

> **Architecture:** See [architecture.md](./docs/ARCHITECTURE.md) for the complete system design.

## Tech Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Frontend       | React 19, Vite 6, TypeScript, CSS Modules |
| Backend        | Express 5, TypeScript, Pino, Zod          |
| Database       | PostgreSQL 16 (Phase 2+)                  |
| Cache          | Redis 7 (Phase 2+)                        |
| Infrastructure | Docker, Nginx, GitHub Actions             |
| Shared         | TypeScript types via npm workspaces       |

## Project Structure

```
yugendiran-3d-portfolio/
├── frontend/          # React SPA (Vite)
│   ├── src/
│   │   ├── components/    # UI components (Phase 2+)
│   │   ├── data/          # Content JSON files (edit here to update portfolio)
│   │   ├── styles/        # Global styles and design tokens
│   │   ├── utils/         # Pure utility functions
│   │   ├── App.tsx        # Root component
│   │   └── main.tsx       # Entry point
│   └── ...
├── backend/           # Express API (modular monolith)
│   ├── src/
│   │   ├── modules/       # Feature modules (health, contact, analytics)
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Environment and service configuration
│   │   └── utils/         # Logger, helpers
│   └── ...
├── packages/
│   └── shared/        # Shared TypeScript types
├── docker/            # Nginx and PostgreSQL configuration
├── .github/           # CI/CD workflows
└── ...
```

## Prerequisites

- **Node.js** 20 LTS or later
- **npm** 10+ (comes with Node.js 20)
- **Docker** and **Docker Compose** (for database/Redis in development)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

This installs dependencies for all workspaces (frontend, backend, shared).

### 2. Start development servers

**Frontend** (port 5173):

```bash
npm run dev:frontend
```

**Backend** (port 3001):

```bash
npm run dev:backend
```

**Infrastructure** (PostgreSQL + Redis — needed for Phase 2+):

```bash
docker compose up -d
```

## Development Commands

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev:frontend` | Start Vite dev server with HMR           |
| `npm run dev:backend`  | Start Express dev server with hot reload |
| `npm run lint`         | Run ESLint across all workspaces         |
| `npm run format`       | Format code with Prettier                |
| `npm run format:check` | Check formatting without writing         |
| `npm run typecheck`    | Run TypeScript type checking             |
| `npm run test`         | Run all tests (frontend + backend)       |

## Testing Commands

| Command                          | Description                      |
| -------------------------------- | -------------------------------- |
| `npm run test`                   | Run all tests once               |
| `npm run test -w frontend`       | Run frontend tests only          |
| `npm run test -w backend`        | Run backend tests only           |
| `npm run test:watch -w frontend` | Run frontend tests in watch mode |
| `npm run test:watch -w backend`  | Run backend tests in watch mode  |

## Build Commands

| Command                  | Description                                  |
| ------------------------ | -------------------------------------------- |
| `npm run build:frontend` | Type-check and build frontend for production |
| `npm run build:backend`  | Compile backend TypeScript to JavaScript     |
| `npm run build`          | Build all workspaces                         |

## Updating Portfolio Content

All portfolio content lives in `frontend/src/data/`:

| File                  | Content                                 |
| --------------------- | --------------------------------------- |
| `profile.json`        | Name, title, bio, social links          |
| `experience.json`     | Work history entries                    |
| `skills.json`         | Skill categories and proficiency levels |
| `projects.json`       | Project showcase entries                |
| `certifications.json` | Professional certifications             |
| `navigation.json`     | Navigation items and section order      |

Edit these JSON files to update the portfolio without modifying any UI components.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

See `.env.example` for all available configuration options.

## License

Private — All rights reserved.
