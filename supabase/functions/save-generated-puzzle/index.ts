// Authenticated: persist a puzzle the client's local Stockfish engine
// generated (see js/puzzle-generator.js) so it enters the shared bank
// and future players get it via get-puzzle instead of everyone having
// to (re)generate their own. Still replayed through chess.js so a
// malformed client-side generation can never corrupt the bank.
import { Chess } from "https://esm.sh/chess.js@1.0.0-beta.8";
import { requireUser, json, corsHeaders } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user, admin } = auth;

  const { fen, moves, rating, themes, eval_swing } = await req.json().catch(() => ({}));
  if (!fen || !Array.isArray(moves) || moves.length < 1) {
    return json({ error: "fen and moves are required" }, 400);
  }

  let chess: Chess;
  try { chess = new Chess(fen); } catch { return json({ error: "Invalid FEN" }, 400); }

  const uciMoves: string[] = [];
  for (const m of moves) {
    const from = String(m).slice(0, 2);
    const to = String(m).slice(2, 4);
    const promotion = String(m).slice(4) || undefined;
    const applied = chess.move({ from, to, promotion });
    if (!applied) return json({ error: `Illegal move in generated line: ${m}` }, 400);
    uciMoves.push(applied.from + applied.to + (applied.promotion || ""));
  }

  const { data: puzzle, error } = await admin.from("puzzles").insert({
    fen,
    moves: uciMoves,
    rating: Number.isFinite(rating) ? Math.max(400, Math.min(3000, rating)) : 1200,
    themes: Array.isArray(themes) ? themes.slice(0, 8) : (eval_swing >= 500 ? ["tactic"] : ["advantage"]),
    submitted_by: user.id,
    source: "engine",
    is_verified: true,
  }).select().single();

  if (error) return json({ error: error.message }, 400);
  return json({ ok: true, puzzle });
});
