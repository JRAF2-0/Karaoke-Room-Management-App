# Karaoke Room Management (React + Supabase)

This project has been migrated from PHP/MySQL to:

- Frontend: React (Vite)
- Backend/Data: Supabase PostgreSQL
- Realtime: Supabase Postgres Changes

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` from `.env.example` and add your Supabase values:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

3. Run SQL setup in Supabase SQL Editor:
- `supabase/schema.sql`

4. Start app:
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Setup Notes
Detailed steps are in:
- `SETUP_SUPABASE.md`