// Authenticated: resign, offer/accept/decline a draw, or abort an
// unstarted game. All state changes; no move validation needed here.
import { requireUser, json, corsHeaders } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user, admin } = auth;

  const { game_id, action } = await req.json().catch(() => ({}));
  if (!game_id || !action) return json({ error: "game_id and action are required" }, 400);

  const { data: game, error: gameErr } = await admin.from("games").select("*").eq("id", game_id).single();
  if (gameErr || !game) return json({ error: "Game not found" }, 404);

  const isWhite = game.white_id === user.id;
  const isBlack = game.black_id === user.id;
  if (!isWhite && !isBlack) return json({ error: "You are not a participant in this game" }, 403);
  if (game.status !== "ongoing") return json({ error: "Game already finished" }, 400);

  if (action === "resign") {
    const winnerId = isWhite ? game.black_id : game.white_id;
    const result = isWhite ? "0-1" : "1-0";
    await admin.from("games").update({
      status: "finished", result, end_reason: "resignation", winner_id: winnerId,
      updated_at: new Date().toISOString(),
    }).eq("id", game_id);
    return json({ ok: true, status: "finished", result });
  }

  if (action === "offer_draw") {
    await admin.from("games").update({ draw_offered_by: user.id, updated_at: new Date().toISOString() }).eq("id", game_id);
    return json({ ok: true });
  }

  if (action === "decline_draw") {
    await admin.from("games").update({ draw_offered_by: null, updated_at: new Date().toISOString() }).eq("id", game_id);
    return json({ ok: true });
  }

  if (action === "accept_draw") {
    if (!game.draw_offered_by || game.draw_offered_by === user.id) {
      return json({ error: "No draw offer to accept" }, 400);
    }
    await admin.from("games").update({
      status: "finished", result: "1/2-1/2", end_reason: "draw-agreed", draw_offered_by: null,
      updated_at: new Date().toISOString(),
    }).eq("id", game_id);
    return json({ ok: true, status: "finished", result: "1/2-1/2" });
  }

  if (action === "abort") {
    const moveCount = Array.isArray(game.moves) ? game.moves.length : 0;
    if (moveCount > 1) return json({ error: "Game is past the abort window" }, 400);
    await admin.from("games").update({
      status: "finished", result: "*", end_reason: "abort",
      updated_at: new Date().toISOString(),
    }).eq("id", game_id);
    return json({ ok: true, status: "finished" });
  }

  return json({ error: "Unknown action" }, 400);
});
