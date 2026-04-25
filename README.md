# Smart Task & Productivity System

This is something I’ve been putting together as a personal productivity tool: a small full-stack app where I can sign in, dump tasks onto a board, and drag my attention across **Todo → In progress → Done** without living inside someone else’s SaaS. **Phase 1** is a working MVP: auth, task CRUD, and the board UI. **Phase 2** has started with a read-only **analytics summary** (counts, overdue, completions by day). I still want richer analytics later, plus AI-assisted planning down the road. Stack stays boring on purpose: Spring Boot + React, JWT in front of a REST API, tasks scoped per user. It’s now open-sourced under the **MIT License**.

If you clone this and run it locally, you get the same setup I use for development: in-memory H2, Vite on the front, and CORS tuned so whatever port Vite picks still talks to the API.

Open-source docs: [License](LICENSE) · [Contributing](CONTRIBUTING.md) · [Code of Conduct](CODE_OF_CONDUCT.md) · [Security Policy](SECURITY.md)

---

## What it actually does

You register or log in. The backend issues a **JWT**; the SPA keeps it in `localStorage` and sends `Authorization: Bearer …` on every task call. Tasks belong to **your** account only—no shared workspace yet.

On the **Tasks** page you get:

- A **new task** form: title, priority (high / medium / low), optional description, and a **due date** (required in both the UI and the API).
- A **three-column board** (Todo, In progress, Done). Columns are laid out side by side on a normal desktop; on a narrow viewport they stack.
- **Cards** per task: priority is obvious (colored strip + label), description sits in a readable block, due date is formatted for humans. You can **edit**, **delete**, or **move** a task between columns; moving is just an update under the hood.

Validation is enforced in two places: the browser (required fields, sensible messages) and the server (`@NotNull`, length limits, priority between 1 and 3). If your token expires or goes bad, you get bounced back to the auth screen.

**Heads-up:** H2 is in-memory. Restart the backend and the database is empty again—fine for dev, not for “real” data until I wire up Postgres (it’s on the roadmap).

### Analytics (Phase 2, first slice)

There’s an **Analytics** page in the nav (same JWT session as Tasks). You pick a **from/to** date range (defaults to the last 30 days) and get:

- How many tasks were **created** and **marked done** in that window (using `createdAt` / `completedAt` in the **JVM default timezone**).
- **Overdue**: not done, due date **strictly before today** (same timezone as the server).
- **Board snapshot**: current counts in Todo / In progress / Done (all your tasks, not filtered by the range).
- A simple **bar strip** of completions per calendar day in the range (days with zero completions still show as a flat tick).

The API rejects ranges over **366 days** or `from` after `to` with HTTP 400.

---

## Features

### Phase 1 (current)

| Area | What’s there |
|------|----------------|
| Auth | Register, login, JWT access token (default lifetime **60 minutes** in `application.properties`). |
| Tasks | Create, list, update, delete; statuses `TODO`, `IN_PROGRESS`, `DONE`; priority **1–3** (high → low). |
| Due dates | **Required** on create and update (`LocalDate` in the API, `yyyy-mm-dd` in JSON). |
| Frontend | React 19, TypeScript, Vite, React Router; protected `/tasks` and `/analytics`; Tailwind for styling. |
| Backend | Spring Boot, Spring Security + custom JWT filter, JPA, H2 for local dev, H2 console enabled. |

### Phase 2 (in progress)

| Area | What’s there |
|------|----------------|
| Analytics API | `GET /api/analytics/summary` with optional `from` / `to` query params (`yyyy-mm-dd`). |
| Analytics UI | Summary cards, board counts, completions-by-day bars, date range + refresh. |

**Still on the wish list for Phase 2+:** streaks, average time-to-complete, export, charts library, filters beyond the date range.

### Phase 3+ (ideas)

- AI helpers: break down a task, suggest what to do next, weekly summary.
- Deployment + Docker Compose + Postgres

---

## Tech stack

**Backend:** Java 17+ (see `pom.xml`), Spring Boot, Spring Web, Spring Security, Spring Data JPA, Hibernate validation, JJWT-style signing via `io.jsonwebtoken`, H2.

**Frontend:** React, TypeScript, Vite, React Router, Tailwind CSS

---

## Folder Structure

Generated and third-party folders are left out (`node_modules/`, `frontend/dist/`, `backend/target/`, etc.). Everything else looks like this:

```
.
├── .github/
├── .gitignore
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── SECURITY.md
├── backend/
│   ├── .gitignore
│   ├── .mvn/
│   │   └── wrapper/
│   │       └── maven-wrapper.properties
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/productivity/backend/
│       │   │   ├── BackendApplication.java
│       │   │   ├── analytics/
│       │   │   │   ├── AnalyticsController.java
│       │   │   │   ├── AnalyticsDtos.java
│       │   │   │   └── AnalyticsService.java
│       │   │   ├── auth/
│       │   │   │   ├── AuthController.java
│       │   │   │   └── dto/
│       │   │   │       └── AuthDtos.java
│       │   │   ├── security/
│       │   │   │   ├── JwtAuthFilter.java
│       │   │   │   ├── JwtService.java
│       │   │   │   ├── SecurityConfig.java
│       │   │   │   └── UserPrincipal.java
│       │   │   ├── task/
│       │   │   │   ├── Task.java
│       │   │   │   ├── TaskController.java
│       │   │   │   ├── TaskRepository.java
│       │   │   │   ├── TaskStatus.java
│       │   │   │   └── dto/
│       │   │   │       └── TaskDtos.java
│       │   │   └── user/
│       │   │       ├── User.java
│       │   │       └── UserRepository.java
│       │   └── resources/
│       │       ├── application.properties
│       │       ├── static/
│       │       └── templates/
│       └── test/
│           └── java/com/productivity/backend/
│               └── BackendApplicationTests.java
└── frontend/
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── index.css
        ├── main.tsx
        ├── vite-env.d.ts
        ├── App.tsx
        ├── components/
        │   └── AppHeader.tsx
        ├── assets/
        │   ├── react.svg
        │   └── vite.svg
        ├── auth/
        │   ├── AuthContext.ts
        │   ├── AuthContext.tsx
        │   ├── AuthContextValue.ts
        │   └── useAuth.ts
        ├── lib/
        │   ├── api.ts
        │   ├── env.ts
        │   └── storage.ts
        ├── pages/
        │   ├── AnalyticsPage.tsx
        │   ├── AuthPage.tsx
        │   └── TasksPage.tsx
        └── routing/
            └── RequireAuth.tsx
```

---

## Running it locally

### Prerequisites

- **Node.js** (for npm/Vite).
- **Java** — project targets Java 17; newer LTS versions usually work fine.

### Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

- API base: **`http://localhost:8081`** (see `server.port` in `application.properties`).
- H2 console: **`http://localhost:8081/h2-console`** (JDBC URL is in the same file if you need to poke at tables).

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173`). Point the app at the API with env below.

### Frontend environment

Create `frontend/.env` (not committed) with:

```env
VITE_API_BASE_URL=http://localhost:8081
```

If the backend port changes, update this to match.

---

## API reference

### Auth (no JWT)

`POST /api/auth/register`  
`POST /api/auth/login`

Body:

```json
{ "email": "you@example.com", "password": "your-password" }
```

Response:

```json
{ "accessToken": "<jwt>" }
```

### Tasks (JWT required)

Header on every request:

```http
Authorization: Bearer <accessToken>
```

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/tasks` | All tasks for the authenticated user. |
| `POST` | `/api/tasks` | Create. |
| `PUT` | `/api/tasks/{id}` | Full update (same shape as create). |
| `DELETE` | `/api/tasks/{id}` | Remove. |

Create / update body (description can be empty string; title max 200 chars, description max 2000):

```json
{
  "title": "Ship the README",
  "description": "Accurate, not fancy.",
  "status": "TODO",
  "priority": 2,
  "dueDate": "2026-04-15"
}
```

`status` must be one of: `TODO`, `IN_PROGRESS`, `DONE`.  
`priority` must be **1**, **2**, or **3**.  
`dueDate` is **required** (ISO date `yyyy-mm-dd`).

### Analytics summary (JWT required)

`GET /api/analytics/summary`  
Optional query: `from`, `to` (`yyyy-mm-dd`, inclusive). If omitted, defaults to **today** as `to` and **29 days earlier** as `from` (30 calendar days inclusive).

Example: `GET /api/analytics/summary?from=2026-03-01&to=2026-04-03`

Response shape (abbreviated):

```json
{
  "from": "2026-03-01",
  "to": "2026-04-03",
  "createdInRange": 12,
  "completedInRange": 7,
  "overdueNotDone": 2,
  "byStatus": { "TODO": 3, "IN_PROGRESS": 1, "DONE": 14 },
  "completionsByDay": [
    { "date": "2026-03-01", "count": 0 },
    { "date": "2026-03-02", "count": 1 }
  ]
}
```

---

## Quick manual test

1. Start backend and frontend.  
2. Register, then log in if needed.  
3. Add a few tasks with different priorities and dates.  
4. Move them between columns, edit one, delete one.  
5. Log out and log back in—tasks should still be there **until** you restart the JVM (H2 in-memory).

---

## Troubleshooting (things I’ve hit)

- **CORS:** Origins are matched with patterns like `http://localhost:*` so Vite isn’t tied to a single port.  
- **403 on `/api/tasks`:** Usually missing or expired JWT, or the client wasn’t sending `Authorization`. After a backend restart, old tokens can be invalid if the signing secret changed.  
- **Port already in use:** Change `server.port` or stop whatever is bound to **8081**.  
- **Tailwind:** If responsive classes (e.g. `md:grid-cols-3`) never apply, check that `index.css` uses `@import 'tailwindcss';` for v4

---

## Roadmap (rough)

- [x] Phase 2 (v1): analytics summary API + dashboard page  
- [ ] Phase 2+: streaks, richer charts, time-to-complete, filters  
- [ ] Postgres (or similar) instead of H2 for data that survives restarts  
- [ ] Deploy backend + frontend somewhere sensible  

## License

This project is licensed under the [MIT License](LICENSE).
