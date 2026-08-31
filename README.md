# MasterChess — setup

## 1. Database

You already ran `001_schema.sql`. Run these two **in order**, on top of it,
in the Supabase SQL editor (or `supabase db push`):

1. `supabase/migrations/002_online_puzzles_auth.sql` — adds online
   matchmaking, game clocks/results, puzzle provenance + solve tracking,
   the auto-create-profile-on-signup trigger, RLS policies, and turns on
   Realtime for `games` and `matchmaking_queue`.
2. `supabase/migrations/003_seed_puzzles.sql` — three starter puzzles
   (programmatically verified, not hand-typed) so Browse isn't empty on
   day one.

Both are additive/idempotent (`if not exists`, `on conflict do nothing`,
`drop policy if exists`) — safe to run on your existing database.

If Realtime doesn't seem to deliver live moves after running the SQL,
double check in **Database → Replication** in the dashboard that `games`
and `matchmaking_queue` are enabled — the `alter publication` statements
in the migration usually handle this, but the dashboard toggle is worth a
glance the first time.

## 2. Edge functions

Deploy all seven functions. They all require a valid logged-in Supabase
session — none of them can be called anonymously, and none of them trust
any identity fields you send in the request body (see
`supabase/functions/_shared/auth.ts`).

```
supabase functions deploy matchmake
supabase functions deploy make-move
supabase functions deploy create-bot-game
supabase functions deploy game-action
supabase functions deploy submit-puzzle
supabase functions deploy get-puzzle
supabase functions deploy save-generated-puzzle
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
provided automatically inside the edge runtime — you don't need to set
them yourself.

You can delete the old `create-game` and `make-move` functions from your
project if they're still deployed from before; they've been replaced by
`create-bot-game` / `matchmake` and a rewritten `make-move`.

## 3. Client config

Open `js/config.js` and fill in your project's URL and anon (publishable)
key from **Project Settings → API**:

```js
supabaseUrl: 'https://xxxxxxxx.supabase.co',
supabaseAnonKey: 'your-anon-key',
```

## 4. Hosting

Everything is static (plain ES modules, no build step) — host the folder
on Vercel, Netlify, Cloudflare Pages, GitHub Pages, or anywhere else that
serves static files. `login.html` is the only page that doesn't require a
session; every other page calls `requireSession()` and bounces
unauthenticated visitors there first.

## What changed from the original scaffold

- **Auth-gated**: every page (`index`, `play`, `puzzles`, `bots`,
  `profile`, `settings`) redirects to `login.html` if there's no session.
- **Real online play** is the default mode on Play: a matchmaking queue
  pairs you with an opponent at a compatible time control, and moves sync
  live over Supabase Realtime. Every move is replayed and validated
  server-side in `make-move` — clients can't just write a FEN into the
  database.
- **Click-to-move (and drag-and-drop)** with legal-move dots and
  capture rings, chess.com-style, replacing the old `prompt()` move entry.
- **Real piece art** (the open-source cburnett set, vendored locally)
  with a drop shadow so pieces read clearly on light squares, instead of
  Unicode glyphs.
- **Puzzles**: a shared bank (curated + community + engine-generated).
  "Regular" mode gives you the next puzzle near your rating you haven't
  solved; when the bank runs dry near your rating, your browser's own
  Stockfish plays out fresh positions and keeps ones with a genuine
  forcing tactic, saving them back to the bank for the next player. You
  can also post your own puzzles — every submitted move is replayed
  through chess.js server-side before it's accepted.
- **Feed-style UI** instead of dropdown-heavy control panels — mode,
  time control, and bot choice are all tappable cards.
- All "free" messaging removed.

## What was cut, and why

`clubs.html`, `tournaments.html`, `variants.html`, `analysis.html`,
`board-editor.html`, and `learn.html` were six copies of the same
placeholder template with no real logic behind any of them. Rather than
leave more non-functional pages in an app that's supposed to have none,
they've been removed from the nav for this build. Each is genuinely a
separate project (an analysis board needs an eval bar + line explorer, a
board editor needs a full setup-position UI, tournaments need pairing
logic, clubs need membership/moderation, etc.) — happy to build any of
them out properly as a follow-up.

## Honest limitations worth knowing about

- The Stockfish-generated puzzles come from semi-random self-play, not a
  database of real games — the *tactics* are genuine (verified by
  engine depth-16 analysis before being accepted), but the surrounding
  position won't always look like a natural game.
- "Pass and play" (local, same-screen two-player) has no backend at all
  by design — it's just the board running client-side.
- Ratings use a simple Elo update on rated online games only; bot games
  are unrated.
