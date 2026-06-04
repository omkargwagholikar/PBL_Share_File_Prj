# EduNexus — React Frontend

Vite + React 19 + TypeScript + Tailwind v4 SPA backed by the Django REST API in `../`.

## Stack

- **React 19** + **Vite 8** + **TypeScript**
- **Tailwind CSS v4** with the official Vite plugin
- **React Router v7** for routing
- **TanStack Query v5** for data fetching and caching
- **Firebase JS SDK** for client-side auth (ID tokens forwarded to Django)
- **react-dropzone** for drag-and-drop uploads
- **react-pdf** (pdf.js) for inline previews
- **lucide-react** icons

## Project structure

```
src/
├─ App.tsx                # Router + providers
├─ main.tsx
├─ index.css              # Tailwind import + theme tokens
├─ vite-env.d.ts
├─ auth/
│  ├─ AuthContext.tsx     # Firebase auth wrapper
│  └─ RequireAuth.tsx     # Protected-route gate
├─ components/
│  ├─ Layout.tsx          # Sidebar + content frame
│  ├─ Dropzone.tsx
│  ├─ FileCard.tsx
│  ├─ FilterPanel.tsx     # Subject / file-type / ranking-mode facets
│  ├─ PdfPreview.tsx      # Inline pdf.js viewer
│  ├─ SearchBar.tsx       # Debounced autocomplete
│  └─ UploadList.tsx      # Per-file ingestion progress
├─ hooks/
│  ├─ useDebounced.ts
│  ├─ useFiles.ts
│  └─ useSearch.ts
├─ lib/
│  ├─ api.ts              # Axios client + auth interceptor
│  ├─ cn.ts
│  ├─ firebase.ts
│  └─ format.ts
├─ pages/
│  ├─ Dashboard.tsx
│  ├─ Login.tsx
│  ├─ Profile.tsx         # HF token + default embedding model + model download
│  ├─ Search.tsx
│  ├─ Signup.tsx
│  └─ Upload.tsx
└─ types/index.ts
```

## Setup

1. Install dependencies (this folder has a local `.npmrc` pinning the public npm registry so it works even when your global npm points elsewhere):

   ```bash
   npm install
   ```

2. Copy the env file and fill in your Firebase web app config:

   ```bash
   cp .env.example .env.local
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

   The dev server runs on `http://localhost:5173` and proxies `/api` and `/media` to the Django backend on `http://127.0.0.1:8000`.

## Backend it expects

The SPA talks to these endpoints (all served by Django at `/api/`):

| Method | Path                         | Purpose                                |
|--------|------------------------------|----------------------------------------|
| GET    | `/api/files/`                | List files (FileMeta[])                |
| GET    | `/api/files/:id/`            | File detail                            |
| POST   | `/api/files/upload/`         | Multipart upload (`document` field)    |
| GET    | `/api/files/:id/events/`     | Server-Sent Events ingestion progress  |
| GET    | `/api/search/?q=…`           | Hybrid search → SearchResponse         |
| GET    | `/api/search/suggest/?q=…`   | Autocomplete suggestions               |
| GET    | `/api/auth/me/`              | Current user profile                   |
| GET    | `/api/auth/profile/`         | Profile settings (HF token preview)    |
| PUT    | `/api/auth/profile/`         | Save HF token / default model          |
| POST   | `/api/auth/profile/download-model/` | Download model from HF Hub      |

These are implemented in `../home/api.py` and wired in `../EduNexus/urls.py`.

## Build for production

```bash
npm run build
```

Outputs static assets in `dist/` — serve them behind Django, Nginx, or any CDN.
