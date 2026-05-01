# TaskFlow – Team Task Manager

A full-stack collaborative web application for managing team projects and tasks.

## Features

- **User Authentication** – Signup/login with JWT-based authentication
- **Project Management** – Create projects, add/remove team members
- **Task Management** – Create, assign, and track tasks with Kanban board
- **Dashboard** – Visual analytics with task stats, status breakdown, and team overview
- **Role-Based Access** – Admin (full control) vs Member (view & update assigned tasks)
- **Responsive Design** – Clean professional UI that works on all devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Styling | Vanilla CSS |

## Local Development

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd team-task-manager

# 2. Install all dependencies (auto-installs backend + frontend)
npm install

# 3. Create backend env file
cp backend/.env.example backend/.env
# Fill in your MongoDB URI and JWT secret

# 4. Start development servers (backend + frontend)
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Deploy to Railway

1. Push code to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Connect your GitHub repository
4. **Set these environment variables** in Railway dashboard:

   | Variable | Value |
   |----------|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A strong random secret key |
   | `NODE_ENV` | `production` |

   > Railway auto-provides `PORT` — do not set it manually.

5. Railway will automatically:
   - Run `npm install` → installs root + backend + frontend deps
   - Run `npm run build` → builds the React frontend
   - Run `npm start` → starts the Express server

The Express server serves the React build as static files in production.

## API Endpoints

### Auth
- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Login
- `GET /api/auth/me` – Get current user

### Projects
- `GET /api/projects` – List user's projects
- `POST /api/projects` – Create project
- `GET /api/projects/:id` – Get project details
- `POST /api/projects/:id/members` – Add member (Admin)
- `DELETE /api/projects/:id/members/:userId` – Remove member (Admin)

### Tasks
- `GET /api/projects/:id/tasks` – List tasks
- `POST /api/projects/:id/tasks` – Create task (Admin)
- `PUT /api/projects/:id/tasks/:taskId` – Update task
- `DELETE /api/projects/:id/tasks/:taskId` – Delete task (Admin)

### Dashboard
- `GET /api/dashboard/stats` – Get aggregated stats

## Project Structure

```
├── backend/
│   ├── config/        # Database configuration
│   ├── controllers/   # Route handlers
│   ├── middleware/     # Auth & role-check
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   └── server.js      # Entry point
├── frontend/
│   └── src/
│       ├── components/  # Reusable components
│       ├── context/     # Auth context
│       ├── pages/       # Page components
│       └── services/    # API service layer
└── package.json       # Root scripts
```

## License
MIT
