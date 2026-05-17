# Peblo Notes

Peblo Notes is a full-stack SaaS-style notes application with authentication, note management, rich preview formatting, public sharing, dashboard insights, and AI-powered summaries.

## Live Architecture

```text
Vercel Frontend -> Render Backend -> Render PostgreSQL
```

- Frontend: React + Vite, deployed on Vercel
- Backend: Node.js + Express, deployed on Render
- Database: Render PostgreSQL
- AI: Groq API

## Features

- User signup and login with JWT authentication
- Secure password hashing with bcrypt
- Create, edit, delete, archive, and restore notes
- Tag notes and filter by tags
- Search notes by title/content
- Edit/Preview note editor
- Formatting support for bold, italic, underline, inline code, headings, and simple lists
- Public note sharing with share links
- Public shared note page with author name, date, tags, and formatted preview
- Dashboard insights for notes, public links, archived notes, AI usage, tags, and recent activity
- AI summary generation with summary points, action items, and suggested title
- Light mode and dark mode
- Responsive SaaS-style UI

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Lucide React
- Recharts
- CSS variables for theming

### Backend

- Node.js
- Express.js
- PostgreSQL
- `pg`
- JWT
- bcryptjs
- dotenv

### Database

- PostgreSQL
- Tables:
  - `users`
  - `notes`
  - `tags`
  - `note_tags`
  - `ai_logs`

## Project Structure

```text
Saastask/
  client/
    src/
      api/
      components/
      context/
      hooks/
      pages/
      utils/
    package.json
    vite.config.js

  Server/
    src/
      config/
      controllers/
      db/
      middleware/
      routes/
      index.js
    package.json

  vercel.json
  README.md
```

## Environment Variables

### Frontend

Create `client/.env`:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

For this project deployment:

```env
VITE_API_URL=https://peblo-notes-1.onrender.com/api
```

### Backend

Create `Server/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
DB_SSL=true
NODE_ENV=production
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=https://your-vercel-frontend-url.vercel.app
GROQ_API_KEY=replace_with_your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
PORT=5000
```

For local PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/peblo_notes
DB_SSL=false
NODE_ENV=development
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=replace_with_your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
PORT=5000
```

Do not commit real secrets or API keys.

## Local Setup

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd Saastask
```

### 2. Install Backend Dependencies

```bash
cd Server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Set Up PostgreSQL

Create a PostgreSQL database:

```sql
CREATE DATABASE peblo_notes;
```

The backend initializes the schema from:

```text
Server/src/db/schema.sql
```

You can also run it manually:

```bash
psql -U postgres -d peblo_notes -f Server/src/db/schema.sql
```

### 5. Run Backend

```bash
cd Server
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 6. Run Frontend

```bash
cd client
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## API Routes

### Auth

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### Notes

```text
GET    /api/notes
GET    /api/notes/:id
POST   /api/notes
PATCH  /api/notes/:id
DELETE /api/notes/:id
PATCH  /api/notes/:id/share
GET    /api/notes/tags
```

### AI

```text
POST /api/ai/notes/:id/generate-summary
```

### Shared Notes

```text
GET /api/shared/:shareId
```

### Insights

```text
GET /api/insights
```

### Health

```text
GET /api/health
```

## Deployment

### Backend on Render

Create a Render Web Service:

```text
Root Directory: Server
Build Command: npm install
Start Command: npm start
```

Set environment variables:

```env
DATABASE_URL=your_render_postgres_url
DB_SSL=true
NODE_ENV=production
JWT_SECRET=your_secret
CLIENT_URL=https://your-vercel-frontend-url.vercel.app
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.1-8b-instant
```

Expected logs:

```text
Database connected
Database schema ready
Server running at http://localhost:<PORT>
```

### Frontend on Vercel

The root `vercel.json` builds the frontend from the `client` folder:

```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Set Vercel environment variable:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

Then redeploy Vercel.

## Database Verification Queries

Run these in pgAdmin or psql.

Show users:

```sql
SELECT id, name, email, created_at
FROM users
ORDER BY created_at DESC;
```

Show notes:

```sql
SELECT id, title, content, is_archived, is_public, share_id, created_at, updated_at
FROM notes
ORDER BY updated_at DESC;
```

Show notes with owner:

```sql
SELECT
  n.title,
  n.content,
  n.is_archived,
  n.is_public,
  u.name AS owner_name,
  u.email AS owner_email,
  n.updated_at
FROM notes n
JOIN users u ON n.user_id = u.id
ORDER BY n.updated_at DESC;
```

Show public shared notes:

```sql
SELECT
  n.title,
  n.share_id,
  n.is_public,
  u.name AS author_name,
  n.updated_at
FROM notes n
JOIN users u ON n.user_id = u.id
WHERE n.is_public = TRUE
ORDER BY n.updated_at DESC;
```

Show dashboard counts:

```sql
SELECT
  COUNT(*) AS total_notes,
  COUNT(*) FILTER (WHERE is_archived = TRUE) AS archived_notes,
  COUNT(*) FILTER (WHERE is_public = TRUE) AS public_notes
FROM notes;
```

Show AI usage logs:

```sql
SELECT
  a.type,
  n.title AS note_title,
  u.name AS user_name,
  a.created_at
FROM ai_logs a
JOIN users u ON a.user_id = u.id
LEFT JOIN notes n ON a.note_id = n.id
ORDER BY a.created_at DESC;
```

## Demo Walkthrough

Recommended demo order:

1. Open deployed frontend.
2. Show landing page.
3. Sign up or log in.
4. Show dashboard insights.
5. Create a note.
6. Add title, content, and tags.
7. Use formatting buttons and preview mode.
8. Search and filter notes.
9. Archive and restore a note.
10. Generate an AI summary.
11. Share a note publicly.
12. Open the public share link.
13. Show pgAdmin database records.

## Notes

- The deployed app does not require the local backend to run.
- Local backend is only needed during development.
- Render PostgreSQL is separate from local PostgreSQL.
- pgAdmin can connect to Render using the External Database URL with SSL mode set to `Require`.

