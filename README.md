# Job Application Tracker

A full-stack web application to track job applications through different hiring stages — built for the InternSathi Full Stack Internship assignment.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State / Data | Apollo Client (GraphQL) |
| Forms | React Hook Form |
| Backend | Fastify + Apollo Server 4 |
| API | GraphQL |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | Zod |
| Containerization | Docker + docker-compose |

## Features

- **List all applications** with company, role, status, date — sortable by newest
- **Filter by status** — Applied / Interviewing / Offer / Rejected
- **Search** by company name or job title
- **Add application** via modal form with validation
- **Edit application** — pre-filled form, partial updates
- **Delete with confirmation** dialog
- **Stats bar** — counts per status at a glance
- **Responsive UI** — works on mobile and desktop

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or use Docker)
- npm

## Quick Start (with Docker)

```bash
git clone <repo-url>
cd job-tracker
docker-compose up --build
```

- Frontend: http://localhost:5173
- GraphQL API: http://localhost:4000/graphql
- Apollo Sandbox: https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:4000/graphql

## Manual Setup

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE job_tracker;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database connection string

npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

Backend runs at http://localhost:4000

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Edit VITE_GRAPHQL_URL if your backend is on a different port

npm install
npm run dev
```

Frontend runs at http://localhost:5173

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/job_tracker` |
| `PORT` | Server port (optional) | `4000` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GRAPHQL_URL` | GraphQL API URL | `http://localhost:4000/graphql` |

## Development Mode

```bash
# Backend (with hot reload)
cd backend && npm run dev

# Frontend (with HMR)
cd frontend && npm run dev

# Prisma Studio (DB GUI)
cd backend && npm run db:studio
```

## Running Tests

We use **Vitest** for running our backend unit tests (specifically validation schema behavior).

```bash
cd backend
npm run test
```

## API — REST

The server supports a dual API layout with both GraphQL and REST endpoints enabled.

### Endpoints

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| **GET** | `/applications` | List all job applications | `status` (Enum), `search` (String) |
| **GET** | `/applications/:id` | Get details of a single application | |
| **POST** | `/applications` | Create a new job application | |
| **PATCH** | `/applications/:id` | Partially update an application | |
| **DELETE** | `/applications/:id` | Delete an application | |

### Request Bodies (REST)

- **Create Application (`POST /applications`)**
  ```json
  {
    "company_name": "Google",
    "job_title": "Software Engineer Intern",
    "job_type": "Internship",
    "status": "Applied",
    "applied_date": "2026-06-18",
    "notes": "Referral from John Doe"
  }
  ```

- **Update Application (`PATCH /applications/:id`)**
  ```json
  {
    "status": "Interviewing",
    "notes": "First round schedule for next Tuesday"
  }
  ```

## API — GraphQL

The GraphQL playground is available at:

```
https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:4000/graphql
```

### Queries

```graphql
# List all (with optional filter + search)
query {
  applications(status: Applied, search: "Google") {
    id company_name job_title status applied_date job_type notes
  }
}

# Get single
query {
  application(id: "uuid-here") {
    id company_name job_title status
  }
}
```

### Mutations

```graphql
# Create
mutation {
  createApplication(input: {
    company_name: "Anthropic"
    job_title: "Software Engineer Intern"
    job_type: Internship
    status: Applied
    applied_date: "2025-06-18"
    notes: "Applied via LinkedIn"
  }) { id status }
}

# Update
mutation {
  updateApplication(id: "uuid-here", input: { status: Interviewing }) {
    id status updated_at
  }
}

# Delete
mutation {
  deleteApplication(id: "uuid-here")
}
```

## Database Schema

```sql
CREATE TABLE applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  job_title    TEXT NOT NULL,
  job_type     "JobType" NOT NULL,   -- Internship | FullTime | PartTime
  status       "Status" NOT NULL DEFAULT 'Applied', -- Applied | Interviewing | Offer | Rejected
  applied_date TIMESTAMP NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);
```

## Project Structure

```
job-tracker/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # DB schema + migrations
│   ├── src/
│   │   ├── schema/
│   │   │   ├── typeDefs.ts     # GraphQL SDL
│   │   │   ├── resolvers.ts    # Query + Mutation resolvers
│   │   │   └── validation.ts   # Zod schemas
│   │   └── index.ts            # Fastify + Apollo server
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApplicationForm.tsx
│   │   │   ├── ConfirmDeleteDialog.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── graphql/
│   │   │   └── operations.ts   # All GQL queries + mutations
│   │   ├── lib/
│   │   │   ├── apollo.ts       # Apollo Client setup
│   │   │   └── types.ts        # TypeScript interfaces
│   │   ├── pages/
│   │   │   └── ApplicationsPage.tsx
│   │   └── App.tsx
│   └── Dockerfile
└── docker-compose.yml
```
