# Atlas Tracking

U.S.-based logistics and parcel tracking platform built with Next.js, Supabase, and Vercel.

## Authentication architecture
This build uses Supabase SSR authentication with `@supabase/ssr`, a browser client, a server client, and a Next.js middleware session refresh. The Admin route validates the signed-in user's JWT claims on the server and then checks the `profiles.role` through the `is_admin()` database function.

## Supabase environment variables
Preferred:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

For existing projects that still expose the older client key, `NEXT_PUBLIC_SUPABASE_ANON_KEY` is supported as a fallback.

## Admin setup
Run `supabase/admin_setup.sql` once in the Supabase SQL Editor. The administrator account must exist in Supabase Auth and its matching `profiles.role` must be `admin`.

## Vercel
Framework preset: **Next.js**. Build command: `npm run build`. Leave Output Directory at the Next.js default/empty.
