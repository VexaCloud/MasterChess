// Authenticated: start a game against a bot. Bot games are unrated
// (the bot has no profile/rating row) and are played out entirely by
// the client calling make-move for the human side; the bot's replies
// are computed client-side with Stockfish and also submitted through
// make-move so the server is still the source of truth for the game state.
import { requireUser, json, corsHeaders } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user, admin } = auth;

  const { bot_id, color, time_control } = await req.json().catch(() => ({}));
  if (!bot_id) return json({ error: "bot_id is required" }, 400);

  const playerIsWhite = color === "random" ? Math.random() < 0.5 : color !== "black";
  const [baseStr] = (time_control || "unlimited|0").split("|");
  const base = time_control === "unlimited" ? null : parseInt(baseStr, 10) || null;

  const { data: game, error } = await admin.from("games").insert({
    white_id: playerIsWhite ? user.id : null,
    black_id: playerIsWhite ? null : user.id,
    bot_id,
    rated: false,
    time_control: time_control || "unlimited",
    variant: "standard",
    status: "ongoing",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    turn: "w",
    white_clock: base,
    black_clock: base,
    moves: [],
    last_move_at: new Date().toISOString(),
  }).select().single();

  if (error) return json({ error: error.message }, 400);
  return json({ game, player_color: playerIsWhite ? "w" : "b" });
});
