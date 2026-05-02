# TaskFlow – Team Task Manager

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
[![Railway](https://img.shields.io/badge/Deployed%20on-Railway-0B0D0E?logo=railway)](https://team-task-managerr.up.railway.app)
![License](https://img.shields.io/badge/License-MIT-blue)

## Demo

https://github.com/user-attachments/assets/980619a7-a7a8-471c-9d6c-3e974107229a

🔗 **Live App:** [team-task-managerr.up.railway.app](https://team-task-managerr.up.railway.app)


A full-stack collaborative web application for managing team projects and tasks — built with React, Node.js/Express, and MongoDB Atlas. Deployable as a single Railway service.

---

## Features

- **JWT Authentication** — Secure signup/login with token-based sessions
- **Project Management** — Create projects, add and remove team members
- **Task Tracking** — Create, assign, and update tasks with a Kanban-style board
- **Dashboard Analytics** — Visual stats: task status breakdown, team overview, progress summary
- **Role-Based Access** — Admin (full CRUD) vs Member (view & update assigned tasks only)
- **Responsive UI** — Clean, professional design that works across all screen sizes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Backend | Node.js 20+ + Express |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (`jsonwebtoken` + `bcryptjs`) |
| Validation | `express-validator` |
| Styling | Vanilla CSS |
| Deployment | Railway (single service, monorepo) |

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers (auth, projects, tasks, dashboard)
│   ├── middleware/      # JWT auth & role-check guards
│   ├── models/          # Mongoose models (User, Project, ProjectMember, Task)
│   ├── routes/          # Express routers
│   └── server.js        # Entry point — serves API + React build in production
├── frontend/
│   └── src/
│       ├── components/  # Navbar
│       ├── context/     # AuthContext (global auth state)
│       ├── pages/       # Login, Register, Dashboard, Projects, ProjectDetail
│       └── services/    # api.js — centralized fetch wrapper
├── package.json         # Root scripts — orchestrates install, build, start
└── README.md
```

---

## Local Development

### Prerequisites

- Node.js `>=20.19.0`
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free tier works)

### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd team-task-manager

# 2. Install all dependencies
#    The postinstall script auto-installs backend + frontend deps
npm install

# 3. Configure the backend
cp backend/.env.example backend/.env
# Edit backend/.env and fill in:
#   MONGODB_URI = your Atlas connection string
#   JWT_SECRET  = any long random string
```

### Run

```bash
# Start both backend (port 5000) and frontend (port 5173) concurrently
npm run dev
```

| Service | URL |
|---|---|
| Frontend (Vite dev server) | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health check | http://localhost:5000/api/health |

---

## Deploy to Railway

This project is configured as a **monorepo single-service** deployment. The Express backend serves the built React frontend in production — no separate frontend service needed.

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "ready for railway"
git push
```

### Step 2 — Create a Railway Project

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repository
3. Railway auto-detects Node.js

### Step 3 — Configure Service Settings

In your Railway service → **Settings**:

| Field | Value |
|---|---|
| Root Directory | *(leave blank — use repo root)* |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Start Command | `npm start` |

### Step 4 — Set Environment Variables

In your Railway service → **Variables**:

| Variable | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://<user>:<pass>@cluster.mongodb.net/<dbname>` |
| `JWT_SECRET` | A long random secret (e.g. output of `openssl rand -hex 32`) |
| `NODE_ENV` | `production` |

> Railway auto-provides `PORT` — **do not set it manually.**

### Step 5 — Allow Railway IPs in MongoDB Atlas

In **MongoDB Atlas → Network Access**, add `0.0.0.0/0` to allow all IPs. Railway uses dynamic IPs, so a fixed whitelist won't work.

### Step 6 — Deploy

Trigger a deploy. Railway will:
1. `npm install` → installs root + backend + frontend deps via `postinstall`
2. `npm run build` → builds the React app into `frontend/dist/`
3. `npm start` → starts Express, which serves both the API (`/api/*`) and the React SPA

Your app will be live at `https://<your-service>.up.railway.app`.

---

> **⚠️ Node.js Version Note**
> Ensure `engines` in your root `package.json` specifies `"node": ">=20.19.0"`. Railway reads this field to pick the Node version. Vite 8, React Router 7, and Mongoose 9 all require Node 20+. Node 18 will cause a build failure.

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ✗ | Register a new user |
| `POST` | `/api/auth/login` | ✗ | Login and receive JWT |
| `GET` | `/api/auth/me` | ✓ | Get current user profile |

### Projects

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/projects` | Member | List user's projects |
| `POST` | `/api/projects` | Member | Create a new project |
| `GET` | `/api/projects/:id` | Member | Get project details |
| `POST` | `/api/projects/:id/members` | Admin | Add a member |
| `DELETE` | `/api/projects/:id/members/:userId` | Admin | Remove a member |

### Tasks

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/projects/:id/tasks` | Member | List tasks in a project |
| `POST` | `/api/projects/:id/tasks` | Admin | Create a task |
| `PUT` | `/api/projects/:id/tasks/:taskId` | Member | Update a task |
| `DELETE` | `/api/projects/:id/tasks/:taskId` | Admin | Delete a task |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | ✓ | Aggregated task stats for the user |

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | ✗ | Service health check |

---

## License

MIT
