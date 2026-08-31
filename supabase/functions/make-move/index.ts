// Authenticated, server-validated move submission.
// The client never gets to just write a FEN into the DB — every move
// is replayed and validated here with chess.js before it's persisted.
import { Chess } from "https://esm.sh/chess.js@1.0.0-beta.8";
import { requireUser, json, corsHeaders } from "../_shared/auth.ts";

function updateElo(a: number, b: number, scoreA: number, k = 20) {
  const expectedA = 1 / (1 + Math.pow(10, (b - a) / 400));
  return Math.round(a + k * (scoreA - expectedA));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user, admin } = auth;

  const { game_id, from, to, promotion, as_bot } = await req.json().catch(() => ({}));
  if (!game_id || !from || !to) return json({ error: "game_id, from, to are required" }, 400);

  const { data: game, error: gameErr } = await admin.from("games").select("*").eq("id", game_id).single();
  if (gameErr || !game) return json({ error: "Game not found" }, 404);
  if (game.status !== "ongoing") return json({ error: "Game is not ongoing" }, 400);

  const isWhite = game.white_id === user.id;
  const isBlack = game.black_id === user.id;
  if (!isWhite && !isBlack) return json({ error: "You are not a participant in this game" }, 403);

  const myColor = isWhite ? "w" : "b";

  // Bot games: the human client computes the bot's reply locally with
  // Stockfish and relays it here so the server DB stays authoritative.
  // Only allowed for the bot's own side, in a game that actually has a bot,
  // and only by the human participant of that same game.
  const submittingForBot = as_bot === true && !!game.bot_id && game.turn !== myColor;
  if (!submittingForBot && game.turn !== myColor) return json({ error: "Not your turn" }, 400);

  const chess = new Chess(game.fen);
  const move = chess.move({ from, to, promotion: promotion || "q" });
  if (!move) return json({ error: "Illegal move" }, 400);

  // Clocks: subtract elapsed time from the mover's clock, then add increment.
  const now = Date.now();
  const elapsedSec = Math.max(0, (now - new Date(game.last_move_at).getTime()) / 1000);
  const movingColor = game.turn; // whose move this is, regardless of who's submitting it
  let whiteClock = game.white_clock;
  let blackClock = game.black_clock;
  if (game.time_control && game.time_control !== "unlimited" && game.white_clock != null) {
    if (movingColor === "w") whiteClock = Math.max(0, Math.round(game.white_clock - elapsedSec + (game.increment || 0)));
    else blackClock = Math.max(0, Math.round(game.black_clock - elapsedSec + (game.increment || 0)));
    if (whiteClock <= 0 || blackClock <= 0) {
      // Flag fall takes priority over the move that arrived too late.
      const winnerColor = whiteClock <= 0 ? "b" : "w";
      const winnerId = winnerColor === "w" ? game.white_id : game.black_id;
      await finishGame(admin, game, winnerColor === "w" ? "1-0" : "0-1", "timeout", winnerId, whiteClock, blackClock);
      return json({ error: "Time forfeit", status: "finished" }, 400);
    }
  }

  const moves = Array.isArray(game.moves) ? game.moves : [];
  moves.push({ san: move.san, from: move.from, to: move.to, promotion: move.promotion || null, by: user.id });

  const isOver = chess.isGameOver();
  let status = "ongoing";
  let result: string | null = null;
  let endReason: string | null = null;
  let winnerId: string | null = null;

  if (isOver) {
    status = "finished";
    if (chess.isCheckmate()) {
      endReason = "checkmate";
      result = chess.turn() === "w" ? "0-1" : "1-0";
      winnerId = chess.turn() === "w" ? game.black_id : game.white_id;
    } else if (chess.isStalemate()) {
      endReason = "stalemate"; result = "1/2-1/2";
    } else if (chess.isThreefoldRepetition()) {
      endReason = "threefold"; result = "1/2-1/2";
    } else if (chess.isInsufficientMaterial()) {
      endReason = "insufficient-material"; result = "1/2-1/2";
    } else if (chess.isDrawByFiftyMoves()) {
      endReason = "fifty-move"; result = "1/2-1/2";
    } else {
      endReason = "draw"; result = "1/2-1/2";
    }
  }

  const { error: updateErr } = await admin.from("games").update({
    fen: chess.fen(),
    pgn: chess.pgn(),
    moves,
    turn: chess.turn(),
    white_clock: whiteClock,
    black_clock: blackClock,
    last_move_at: new Date(now).toISOString(),
    updated_at: new Date(now).toISOString(),
    status,
    result,
    end_reason: endReason,
    winner_id: winnerId,
    draw_offered_by: null,
  }).eq("id", game_id);

  if (updateErr) return json({ error: updateErr.message }, 400);

  if (status === "finished" && game.rated && game.white_id && game.black_id) {
    await applyRatings(admin, game, result!);
  }

  return json({ ok: true, fen: chess.fen(), status, result, end_reason: endReason });
});

async function finishGame(admin: any, game: any, result: string, endReason: string, winnerId: string | null, whiteClock: number, blackClock: number) {
  await admin.from("games").update({
    status: "finished", result, end_reason: endReason, winner_id: winnerId,
    white_clock: Math.max(0, whiteClock), black_clock: Math.max(0, blackClock),
    updated_at: new Date().toISOString(),
  }).eq("id", game.id);
  if (game.rated && game.white_id && game.black_id) await applyRatings(admin, game, result);
}

async function applyRatings(admin: any, game: any, result: string) {
  const bucket = timeControlBucket(game.time_control);
  const { data: whiteProfile } = await admin.from("profiles").select("id, ratings").eq("id", game.white_id).single();
  const { data: blackProfile } = await admin.from("profiles").select("id, ratings").eq("id", game.black_id).single();
  if (!whiteProfile || !blackProfile) return;

  const wr = whiteProfile.ratings?.[bucket] ?? 1200;
  const br = blackProfile.ratings?.[bucket] ?? 1200;
  const scoreWhite = result === "1-0" ? 1 : result === "0-1" ? 0 : 0.5;

  const newWr = updateElo(wr, br, scoreWhite);
  const newBr = updateElo(br, wr, 1 - scoreWhite);

  await admin.from("profiles").update({
    ratings: { ...whiteProfile.ratings, [bucket]: newWr },
  }).eq("id", game.white_id);
  await admin.from("profiles").update({
    ratings: { ...blackProfile.ratings, [bucket]: newBr },
  }).eq("id", game.black_id);
}

function timeControlBucket(tc: string): string {
  const base = parseInt((tc || "300|0").split("|")[0], 10);
  if (base <= 179) return "bullet";
  if (base <= 480) return "blitz";
  return "rapid";
}
