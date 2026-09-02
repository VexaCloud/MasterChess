import { Chess } from "https://esm.sh/chess.js@1.0.0-beta.8";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requireUser(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { error: json({ error: "Missing Authorization header" }, 401) };

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) return { error: json({ error: "Invalid or expired session" }, 401) };

  return { user: data.user, admin: createClient(supabaseUrl, serviceKey) };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user, admin } = auth;

  const { fen, moves, title, themes, rating } = await req.json().catch(() => ({}));
  if (!fen || !Array.isArray(moves) || moves.length < 1) {
    return json({ error: "fen and a non-empty moves array (UCI) are required" }, 400);
  }

  let chess: Chess;
  try {
    chess = new Chess(fen);
  } catch {
    return json({ error: "Invalid FEN" }, 400);
  }

  const uciMoves: string[] = [];
  for (const m of moves) {
    const from = String(m).slice(0, 2);
    const to = String(m).slice(2, 4);
    const promotion = String(m).slice(4) || undefined;
    const applied = chess.move({ from, to, promotion });
    if (!applied) return json({ error: `Illegal move in solution: ${m}` }, 400);
    uciMoves.push(applied.from + applied.to + (applied.promotion || ""));
  }

  const { data: puzzle, error } = await admin
    .from("puzzles")
    .insert({
      fen,
      moves: uciMoves,
      rating: Number.isFinite(rating) ? Math.max(400, Math.min(3000, rating)) : 1200,
      themes: Array.isArray(themes) ? themes.slice(0, 8) : [],
      title: title ? String(title).slice(0, 80) : null,
      submitted_by: user.id,
      source: "user",
      is_verified: true,
    })
    .select()
    .single();

  if (error) return json({ error: error.message }, 400);
  return json({ ok: true, puzzle });
});
