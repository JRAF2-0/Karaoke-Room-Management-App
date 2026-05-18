# React + Supabase Setup Guide

## 1) Create Supabase Project
Recommended project name:

`karaoke-room-management-prod`

## 2) Copy Environment Variables
In Supabase Dashboard:

- Go to `Project Settings > API`
- Copy `Project URL`
- Copy `anon public` key

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Important:

- Do not place `service_role` in frontend `.env`
- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are needed for this app

## 3) Initialize Database
Open Supabase SQL Editor and run:

- `supabase/schema.sql`

This creates:

- `rooms` table
- `sessions` table
- RLS policies
- Active-session room lock (one active session per room)
- Realtime publication for `rooms` and `sessions`
- Summary RPC function `get_history_summary`

## 4) Install & Run React App
```bash
npm install
npm run dev
```

## 5) Production Build Check
```bash
npm run build
```

## 6) Feature Parity Included
- Dashboard room grid
- Book / stop / extend session
- Countdown timer + auto-release
- 5-min and 1-min warnings
- Booking history with status filters + pagination + summary
- Admin room CRUD
- Reset all active sessions
- Realtime sync from Supabase