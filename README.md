# MasterChess

Full-featured **free** chess platform (no premium tiers). Static frontend + Supabase backend.

Everything is unlocked for every user: bots, puzzles, analysis, simuls, leagues, variants, classroom, insights, settings, board editor, etc.

## Features (all free)
- Live / Online Chess (rated & unrated) – Bullet, Blitz, Rapid, Custom, Daily/Correspondence
- Odds / Handicap chess
- 30+ unique computer personalities with distinct styles, strengths (Stockfish skill/depth) and unique comments
- Adaptive AI Coaches (hints, takebacks, feedback) including star-style coaches
- Simuls, Leagues (Wood → Legends + prestige), Vote Chess, Team/Club matches
- Variants: Chess960, Crazyhouse, Atomic, 3-Check, King of the Hill, Antichess, Horde, Fog of War, Duck Chess, 4-Player, Bughouse, Racing Kings, Setup Chess, and more
- Puzzles (rated, daily, rush, battle), Lessons & Courses, Drills, Endgames, Vision Trainer
- Opening Explorer, Master Games archive, Game Collections
- Full Game Review with Stockfish (accuracy, blunders/misses/brilliants, coach explanations, insights, advanced stats)
- Friends, Clubs (forums, roles, team matches), Tournaments (Swiss/Arena/Daily), Leaderboards
- Board Editor & PGN tools, Fair Play reporting hooks
- Settings: gameplay, interface, privacy, notifications, coach selection, themes, 2FA, vacation days
- Profile customization, achievements, dark mode

## Stack
- Static HTML / CSS / JS
- chess.js
- Stockfish.js – https://github.com/nmrugg/stockfish.js
- Supabase (Auth, Database, Realtime, Edge Functions)

## Quick start
1. Download Stockfish.js (lite single recommended) into `js/stockfish/`
2. Serve the folder:
   ```bash
   npx serve .
   # or python -m http.server 8080
   ```
3. Create a Supabase project, run `supabase/migrations/001_schema.sql`, put URL + anon key in `js/config.js`

## Pages
- index.html – Home
- play.html – Live / Bot / Coach / Daily / Odds
- bots.html – All bot personalities
- puzzles.html, learn.html, variants.html
- tournaments.html, clubs.html
- analysis.html – Game review
- board-editor.html – Setup positions, PGN/FEN
- profile.html, settings.html

## License
MIT
