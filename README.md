# Smart Task & Productivity System

A full-stack productivity app. Phase 1 ships a complete MVP: **JWT auth + task CRUD + a clean React UI**. Future phases add analytics and (optionally) AI suggestions.

## Demo (Phase 1)

- **Register/Login** with JWT
- **Create, update, move, delete tasks** in a simple board (Todo / In progress / Done)


## Features

### Phase 1 (MVP) ✅

- **Authentication**
  - Register + login
  - JWT access token returned to the client
- **Task management**
  - CRUD tasks
  - Status: `TODO`, `IN_PROGRESS`, `DONE`
  - Priority: 1 (High), 2 (Medium), 3 (Low)
- **Frontend**
  - React + Router pages: Auth + Tasks
  - Token stored locally and sent via `Authorization: Bearer <token>`
- **Backend**
  - Spring Boot REST API
  - Spring Security JWT filter
  - JPA persistence (H2 in-memory for local development)

### Phase 2 (Planned)

- Analytics dashboard (completed/day-week, overdue, completion rate, streaks, avg time-to-complete)
- Date range + filters

### Phase 3+ (Planned)

- AI suggestions (task breakdown, next-best task, weekly summary)
- Deployment + Docker Compose + Postgres

## Tech Stack

### Backend

- Java + Spring Boot
- Spring Web (REST)
- Spring Security (JWT)
- Spring Data JPA
- H2 (dev database)

### Frontend

- React + TypeScript
- Vite
- React Router
- Tailwind (via PostCSS)

## Project Structure

```
.
├─ backend/               # Spring Boot API
└─ frontend/              # React app
```

## Getting Started (Local)

### Prerequisites

- **Node.js** (for the frontend)
- **Java** (backend is configured for Java 17 compatibility via `pom.xml`)
  - You can still run it with newer Java versions.

### 1) Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

- Backend runs on **`http://localhost:8081`**
- H2 console is enabled at **`http://localhost:8081/h2-console`**

### 2) Frontend


Install dependencies and run:

```powershell
cd frontend
npm install
npm run dev
```

Vite will print a local URL (for example `http://localhost:5173/`). Open it in your browser.

## Environment Variables

### Frontend (`frontend/.env`)

- **`VITE_API_BASE_URL`**: Base URL of the backend API.

Example:

```env
VITE_API_BASE_URL=http://localhost:8081
```

## API (Phase 1)

### Auth

- `POST /api/auth/register`
  - body: `{ "email": "user@example.com", "password": "password123" }`
  - response: `{ "accessToken": "..." }`
- `POST /api/auth/login`
  - body: `{ "email": "user@example.com", "password": "password123" }`
  - response: `{ "accessToken": "..." }`

### Tasks (JWT required)

All task endpoints require:

```
Authorization: Bearer <accessToken>
```

- `GET /api/tasks` → list tasks for the current user
- `POST /api/tasks` → create task
  - body:
    ```json
    {
      "title": "Build analytics page",
      "description": "Phase 2",
      "status": "TODO",
      "priority": 2,
      "dueDate": null
    }
    ```
- `PUT /api/tasks/{id}` → update task
- `DELETE /api/tasks/{id}` → delete task

## Testing (Quick Manual)

1) Start backend + frontend
2) Register a new account
3) Create a few tasks
4) Move tasks between columns
5) Delete a task
6) Logout → Login again → tasks persist (within the same backend runtime)

## Notes / Troubleshooting

- **CORS**: Backend is configured to allow `localhost`/`127.0.0.1` across dev ports (Vite may choose different ports).
- **Ports in use**: If the backend fails to start, another process may be using the configured port.

## Roadmap

- [ ] Phase 2: analytics API + dashboard
- [ ] Replace H2 with Postgres for persistence across restarts
- [ ] Deploy (backend + frontend)

## License

Add a license if/when you open-source the repo.

