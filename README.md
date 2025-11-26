# MyCSuite

# MyCSuite

## Getting started

This repository is a pnpm monorepo containing an Expo/React Native app in `apps/mycpo`, shared UI and auth packages in `packages/`, and Supabase migrations/seeds under `supabase/`.

Follow the steps below for a first-time setup on macOS (zsh).

### Prerequisites

- Node.js (>= 18 recommended)
- pnpm (https://pnpm.io/) installed globally: `npm install -g pnpm`
- git
- Xcode (for iOS simulator) and CocoaPods if you plan to run the native iOS build
- A Supabase project (hosted or local) if you want to run with a real backend

### Install dependencies

Run at the repo root to install workspace dependencies:

```bash
pnpm install
```

If you prefer to work only inside the app folder:

```bash
cd apps/mycpo
pnpm install
```

### Environment variables

Create a `.env` file in `apps/mycpo` (or set env vars in your shell) with the following keys:

```env
SUPABASE_URL="https://your-project.supabase.co"
ANON_KEY="your_anon_key"
SERVICE_ROLE_KEY="your_service_role_key"
```

Keep `SERVICE_ROLE_KEY` secret and do not commit it to version control.

### Running the app (development)

From the app folder run the script defined in `apps/mycpo/package.json` (common scripts are `start`, `dev`, or `expo`):

```bash
cd apps/mycpo
pnpm run start
# or, if you use the expo CLI directly
expo start
```

Then open on a device or simulator using the Expo dev tools.

For native iOS simulator builds (if using the bare workflow / native code present):

```bash
cd apps/mycpo/ios
pod install
cd ../..
pnpm run ios
```

For Android emulator builds use your typical React Native / Expo commands (or `pnpm run android` if available).

### Seed data and create a demo user

This repo includes utilities to seed and create a demo user.

- Root script to create a demo user: `scripts/create_demo_user.js` (run from repo root).
- SQL seed files live in `supabase/seeds/` and migrations are in `supabase/migrations/`.

Quick demo user creation (one-shot):

```bash
# set env vars inline
SUPABASE_URL="https://your-project.supabase.co" SERVICE_ROLE_KEY="your_service_key" ANON_KEY="your_anon_key" pnpm run create-demo

# or export then run
export SUPABASE_URL="https://your-project.supabase.co"
export SERVICE_ROLE_KEY="your_service_key"
export ANON_KEY="your_anon_key"
pnpm run create-demo
```

You can also run seeds using the Supabase CLI or your own psql connection against your Supabase instance using the SQL files in `supabase/seeds/`.

### Common troubleshooting

- Clear Metro/Expo cache: `pnpm run start -- --clear` or `expo start -c`.
- If iOS build fails, ensure CocoaPods are installed and run `pod install` inside `apps/mycpo/ios`.
- Make sure your env var names match what the app expects (`SUPABASE_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`).

### Useful repo locations

- App: `apps/mycpo`
- Shared packages: `packages/ui`, `packages/auth`
- Supabase migrations/seeds: `supabase/migrations`, `supabase/seeds`
- Helper scripts: `scripts/`

---

## Create demo user

A convenience script is included to create or find a demo auth user in Supabase and upsert a matching `public.profiles` row.

Requirements
- Node (>= 18 recommended)
- A Supabase project (local or hosted) with the `public.profiles` table applied
- Supabase keys: `SERVICE_ROLE_KEY` (service/secret key) and `ANON_KEY` (publishable/anon key)

Scripts
- Root `package.json` includes: `"create-demo": "node scripts/create_demo_user.js"`

Run (one-shot)
```bash
SUPABASE_URL="https://your-project.supabase.co" SERVICE_ROLE_KEY="your_service_key" ANON_KEY="your_anon_key" pnpm run create-demo
```

Run (export env vars first)
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SERVICE_ROLE_KEY="your_service_key"
export ANON_KEY="your_anon_key"
pnpm run create-demo
```

Run with dotenv
```bash
# add keys to .env, then
node -r dotenv/config scripts/create_demo_user.js
```

Optional env vars (defaults are provided in the script)
- `DEMO_EMAIL`, `DEMO_PASSWORD`, `DEMO_USERNAME`, `DEMO_FULL_NAME`

What the script does
- Creates (or finds) a Supabase auth user via the Admin API
- Upserts a `profiles` row with the real auth user id (so no hard-coded UUIDs required)
- Signs in the demo user and prints the returned session (access/refresh tokens)

Security
- Keep `SERVICE_ROLE_KEY` secret. Do not commit it to version control.

If you want, add the same `create-demo` script to `apps/mycpo/package.json` for convenience when working inside the app folder.
