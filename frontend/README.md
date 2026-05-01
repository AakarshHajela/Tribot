# TRIBOT Frontend

React + TypeScript frontend for TRIBOT - an AI-powered Arabic-English 
medical translation and triage support system for emergency department 
nurses.

## Tech Stack

- React 18 + TypeScript
- Vite (dev server and build tool)
- Tailwind CSS (styling)
- React Router (routing)
- Lucide React (icons)
- Sonner (toast notifications)

## Prerequisites

- Node.js 18 or higher
- npm

## Getting Started

1. Navigate to the frontend folder:
   cd frontend

2. Install dependencies:
   npm install

3. Create a .env file in the frontend folder with the backend URL:
   VITE_API_BASE_URL=http://localhost:8000

4. Start the development server:
   npm run dev

5. Open http://localhost:5173 in your browser

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | npm run dev | Starts Vite dev server with hot reload |
| Build | npm run build | Type-checks and builds for production |
| Preview | npm run preview | Previews the production build locally |
| Lint | npm run lint | Runs ESLint |

## Project Structure

src/
├── api/                  # API client functions
│   ├── apiClient.ts      # Base Axios/fetch client with auth headers
│   ├── authApi.ts        # Login, logout, current user
│   ├── adminApi.ts       # Admin user/session/changelog endpoints
│   ├── logsApi.ts        # Translation audit log endpoints
│   └── translationApi.ts # Translation endpoints
├── components/           # Shared UI components
│   ├── session-history/  # Shared history table, transcript, summary panels
│   ├── AdminNavBar.tsx   # Admin navigation bar
│   ├── NavigationBar.tsx # Clinician navigation bar
│   ├── ProfileDropdown.tsx # User avatar, profile info, change password
│   ├── ProtectedRoute.tsx  # Auth guard for routes
│   ├── LiveChatPanel.tsx   # Real-time bilingual chat
│   ├── ATSPanel.tsx        # ATS triage category selector
│   ├── VitalsPanel.tsx     # Patient vitals entry
│   ├── PatientSearch.tsx   # Patient search input
│   └── ...               # Other UI components
├── context/              # React context (AppContext)
├── hooks/                # Custom hooks (useCurrentUser, useHistory, etc.)
├── pages/                # Page-level components
│   ├── LoginPage.tsx         # Login screen (clinician + admin)
│   ├── TriageWorkspace.tsx   # Main clinician triage workspace
│   ├── History.tsx           # Clinician session history
│   ├── AdminLayout.tsx       # Admin page layout wrapper
│   ├── AdminDashboard.tsx    # Admin user management
│   ├── AdminSessionHistory.tsx # Admin session browser with delete
│   └── AdminChangeLog.tsx    # Admin audit change log
├── styles/               # Global styles
├── types.ts              # Shared TypeScript interfaces
└── routes.ts             # React Router route definitions

## Routing

| Path | Page | Access |
|------|------|--------|
| /login | LoginPage | Public |
| / | TriageWorkspace | Clinician |
| /history | History | Clinician |
| /admin | AdminDashboard | Admin |
| /admin/sessions | AdminSessionHistory | Admin |
| /admin/changelog | AdminChangeLog | Admin |

All routes except /login are protected and require a valid JWT token.
Admin routes additionally require the user role to be 'admin'.

## User Roles

### Clinician
- Access the triage workspace to conduct bilingual patient sessions
- Select a patient, enter vitals, chat with real-time Arabic-English 
  translation, assign an ATS category and submit the session
- View completed triage session history with full transcripts and summaries
- Export session summaries as PDF

### Admin
- Manage clinician accounts (create, edit, deactivate, delete, 
  reset password)
- View all completed triage sessions across all clinicians
- View the audit change log of all admin actions
- Export session summaries as PDF

## Key Features

- Real-time Arabic ↔ English translation during triage sessions
- ATS (Australasian Triage Scale) category assignment
- Patient vitals recording
- Role-based access control (clinician vs admin)
- Session history with full transcript and summary
- PDF export of session summaries
- Admin audit log with date filtering
- User profile and password management

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_BASE_URL | Backend API base URL | http://localhost:8000 |

## Docker / Deployment

The frontend is containerised using a two-stage Docker build (Node 20
to build, nginx:alpine to serve) and is managed via docker-compose from
the project root.

### Run the full stack

From the project root:

   docker compose up --build

This starts four services: `db` (PostgreSQL 16), `ai_service`, `backend`,
and `frontend`. The frontend is served at:

   http://localhost:5173

(docker-compose maps host port 5173 → container port 80, where nginx
listens.)

### VITE_API_BASE_URL is baked in at build time

`VITE_API_BASE_URL` is passed as a Docker build argument and embedded
into the JavaScript bundle by Vite during `npm run build`. It cannot be
changed at runtime. The default value used by docker-compose is:

   http://127.0.0.1:8000

To override it at build time:

   docker compose build --build-arg VITE_API_BASE_URL=https://your-api.example.com frontend

### Build the frontend image standalone

From the project root:

   docker build \
     --build-arg VITE_API_BASE_URL=http://127.0.0.1:8000 \
     -t tribot-frontend \
     ./frontend

Run the standalone image:

   docker run -p 5173:80 tribot-frontend

### nginx configuration

nginx serves the Vite production build as a React Router SPA:
- All unmatched paths fall back to `index.html` (client-side routing)
- JS/CSS/image assets are cached for 7 days with `Cache-Control: public, immutable`
- gzip compression is enabled for text, CSS, JS, and JSON

## Notes

- The app expects the backend to be running before logging in
- On first run, seed data provides two demo patients 
  (Ahmed Al-Mansoori and Maria Garcia)
- Admin accounts must be created directly in the database or by 
  another admin
