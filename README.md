# Smart Task & Productivity System (Phase 1)

Phase 1 delivers a working MVP:

- JWT auth (register/login)
- Task manager (CRUD) with status + priority
- React UI for auth + task board

## Tech

- Backend: Java + Spring Boot (REST, Spring Security, JPA, H2 for dev)
- Frontend: React (Vite) + Tailwind

## Run locally

### Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend runs on `http://localhost:8081` by default.

### Frontend

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open the printed Vite URL.

## API (Phase 1)

- `POST /api/auth/register` → `{ accessToken }`
- `POST /api/auth/login` → `{ accessToken }`
- `GET /api/tasks` (auth)
- `POST /api/tasks` (auth)
- `PUT /api/tasks/{id}` (auth)
- `DELETE /api/tasks/{id}` (auth)

