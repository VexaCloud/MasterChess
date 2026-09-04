# MasterChess — setup (To create your own database)

## 1. Database

Run the SQL file full_schema.sql. This is in the supabase folder. This will create the proper tables and RLS. **This project is meant for Supabase**

## 2. Edge functions

Deploy all seven functions from the Supabase folder in your Supabase edge functions.

```
supabase functions deploy matchmake
supabase functions deploy make-move
supabase functions deploy create-bot-game
supabase functions deploy game-action
supabase functions deploy submit-puzzle
supabase functions deploy get-puzzle
supabase functions deploy save-generated-puzzle
```

## 3. Client config

Open `js/config.js` and fill in your project's URL and anon (publishable)
key from your Supabase project:

```js
supabaseUrl: 'https://your-project-ref.supabase.co',
supabaseAnonKey: 'your-anon-key',
```

## 4. Hosting

Everything is static — host the folder on Vercel, Netlify, Cloudflare Pages, GitHub Pages, or anywhere else that
serves static files. You can also run "npx serve ." in a terminal.
