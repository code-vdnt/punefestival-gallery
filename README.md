# Pune Festival Photo Gallery

A full-stack, dynamic photo gallery website for Pune Festival with an admin dashboard.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Image Processing | Sharp (WebP conversion, multi-resolution) |
| File Uploads | Multer (memory storage) |
| Auth | JWT |

---

## Quick Start

### Prerequisites
- Node.js v18+

### 1. Database Setup
The project comes pre-configured with **SQLite** (stored locally in `backend/data/gallery.db`), so **no database server installation or setup is needed** to get started right away.

To seed the initial admin account and sample events:
```bash
cd backend
npm run migrate   # Creates all tables
npm run seed      # Seeds admin user + sample data
```

### 3. Start Backend

```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

### 4. Start Frontend

```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

---

## Admin Access

| | |
|---|---|
| URL | http://localhost:5173/admin |
| Email | admin@punefestival.com |
| Password | Admin@123 |

> ⚠️ Change the default password after first login.

---

## Admin Workflow

1. **Login** → `/admin`
2. **Create Event** → Events page → "New Event"
3. **Create Albums** → Albums page → "New Album" (link to event)
4. **Upload Photos** → Photos page → "Upload Photos"
   - Drag & drop up to 100 photos at once
   - Backend automatically generates Thumbnail (400px), Medium (1200px), Large (2000px) WebP variants
5. **Publish** → Toggle event to "Published" → Photos appear on public gallery

---

## Image Processing

Every uploaded photo is automatically processed by Sharp:

```
Original Upload (any format)
       ↓
Save original as backup
       ↓
Generate 3 WebP variants:
  - thumbnails/  (~400px)  — used in gallery grid
  - medium/      (~1200px) — used in lightbox
  - large/       (~2000px) — used for fullscreen
       ↓
Save paths to PostgreSQL
       ↓
Public gallery uses correct size for each context
```

---

## File Structure

```
gallery-pune-festival/
├── backend/
│   ├── src/
│   │   ├── app.js              ← Express entry
│   │   ├── config/
│   │   │   ├── database.js     ← PostgreSQL pool
│   │   │   └── storage.js      ← Storage abstraction layer
│   │   ├── middleware/
│   │   │   ├── auth.js         ← JWT verification
│   │   │   └── upload.js       ← Multer config
│   │   ├── services/
│   │   │   └── imageProcessor.js ← Sharp processing
│   │   ├── models/             ← DB queries
│   │   ├── controllers/        ← Business logic
│   │   ├── routes/             ← API routes
│   │   └── scripts/
│   │       ├── migrate.js
│   │       ├── seed.js
│   │       └── migrations/001_init.sql
│   └── uploads/                ← Local image storage
│       └── {year}/{event-slug}/
│           ├── originals/
│           ├── thumbnails/
│           ├── medium/
│           └── large/
│
└── frontend/
    └── src/
        ├── api/                ← Axios API client
        ├── components/         ← Shared UI components
        ├── context/            ← Auth context
        └── pages/
            ├── GalleryPage.jsx ← Public gallery
            └── admin/          ← Admin dashboard pages
```

---

## Adding Cloud Storage Later

The `backend/src/config/storage.js` is a modular storage abstraction.

To add S3/R2:
1. Implement `S3StorageProvider` class with the same interface (`saveFile`, `deleteFile`, `getPublicUrl`)
2. Change `STORAGE_TYPE=s3` in `.env`
3. Update the factory function in `storage.js`

No other code changes needed.

---

## API Endpoints

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/events
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id

GET    /api/albums
POST   /api/albums
PUT    /api/albums/:id
DELETE /api/albums/:id

GET    /api/photos?year=&event_id=&album_id=&search=&page=&limit=
POST   /api/photos/upload
PUT    /api/photos/:id
DELETE /api/photos/:id
POST   /api/photos/bulk-delete
POST   /api/photos/bulk-move
```
