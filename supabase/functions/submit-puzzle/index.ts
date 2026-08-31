// Authenticated: post a puzzle. The FEN and the full solution line are
// replayed through chess.js server-side — a puzzle can't be saved unless
// every move in it is actually legal, so the bank never fills with junk.
import { Chess } from "https://esm.sh/chess.js@1.0.0-beta.8";
import { requireUser, json, corsHeaders } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user, admin } = auth;

  const { fen, moves, title, themes, rating } = await req.json().catch(() => ({}));
  if (!fen || !Array.isArray(moves) || moves.length < 1) {
    return json({ error: "fen and a non-empty moves array (UCI, e.g. 'e2e4') are required" }, 400);
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

  const { data: puzzle, error } = await admin.from("puzzles").insert({
    fen,
    moves: uciMoves,
    rating: Number.isFinite(rating) ? Math.max(400, Math.min(3000, rating)) : 1200,
    themes: Array.isArray(themes) ? themes.slice(0, 8) : [],
    title: title ? String(title).slice(0, 80) : null,
    submitted_by: user.id,
    source: "user",
    is_verified: true,
  }).select().single();

  if (error) return json({ error: error.message }, 400);
  return json({ ok: true, puzzle });
});
