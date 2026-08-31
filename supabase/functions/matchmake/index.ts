// Authenticated matchmaking for "Play Online" (the default mode).
// The client calls this on an interval after joining. It:
//   1. Looks for someone else already waiting with a compatible time control.
//   2. If found: creates the game, removes both from the queue, returns the game.
//   3. If not: upserts the caller into the queue and returns { waiting: true }.
import { requireUser, json, corsHeaders } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user, admin } = auth;

  const body = await req.json().catch(() => ({}));
  const action = body.action || "join";

  if (action === "leave") {
    await admin.from("matchmaking_queue").delete().eq("user_id", user.id);
    return json({ ok: true });
  }

  const timeControl: string = body.time_control || "300|0";
  const [baseStr, incStr] = timeControl.split("|");
  const base = parseInt(baseStr, 10) || 300;
  const increment = parseInt(incStr, 10) || 0;

  const { data: profile } = await admin.from("profiles").select("ratings").eq("id", user.id).single();
  const bucket = base <= 179 ? "bullet" : base <= 480 ? "blitz" : "rapid";
  const rating = profile?.ratings?.[bucket] ?? 1200;

  // Is there already a game waiting for us (another client matched us first)?
  const { data: existingGame } = await admin
    .from("games")
    .select("id, white_id, black_id, status")
    .or(`white_id.eq.${user.id},black_id.eq.${user.id}`)
    .eq("status", "ongoing")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingGame) {
    await admin.from("matchmaking_queue").delete().eq("user_id", user.id);
    return json({ matched: true, game_id: existingGame.id });
  }

  // Look for a compatible opponent already in the queue (same time control, not us).
  const { data: candidates } = await admin
    .from("matchmaking_queue")
    .select("*")
    .eq("time_control", timeControl)
    .neq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(5);

  const opponent = (candidates || []).find((c) => Math.abs(c.rating - rating) <= 400) || candidates?.[0];

  if (opponent) {
    // Claim the opponent atomically by deleting their queue row first;
    // if that fails/returns nothing, someone else grabbed them.
    const { data: deleted } = await admin
      .from("matchmaking_queue")
      .delete()
      .eq("user_id", opponent.user_id)
      .select();
    if (!deleted || deleted.length === 0) {
      // Race lost — fall through to (re)join the queue ourselves.
    } else {
      await admin.from("matchmaking_queue").delete().eq("user_id", user.id);
      const whiteFirst = Math.random() < 0.5;
      const white_id = whiteFirst ? user.id : opponent.user_id;
      const black_id = whiteFirst ? opponent.user_id : user.id;
      const { data: newGame, error } = await admin.from("games").insert({
        white_id, black_id,
        rated: true,
        time_control: timeControl,
        increment,
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
      return json({ matched: true, game_id: newGame.id });
    }
  }

  await admin.from("matchmaking_queue").upsert({
    user_id: user.id,
    time_control: timeControl,
    base, increment, rating,
    created_at: new Date().toISOString(),
  });

  return json({ waiting: true });
});
