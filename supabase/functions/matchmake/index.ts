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

  const expand = !!body.expand;
  const eloWindow = expand ? 800 : 300;

  const { data: candidates } = await admin
    .from("matchmaking_queue")
    .select("*")
    .eq("time_control", timeControl)
    .neq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(12);

  const sorted = (candidates || []).slice().sort(
    (a, b) => Math.abs(a.rating - rating) - Math.abs(b.rating - rating)
  );
  const opponent =
    sorted.find((c) => Math.abs(c.rating - rating) <= eloWindow) ||
    (expand ? sorted[0] : null);

  if (opponent) {
    const { data: deleted } = await admin
      .from("matchmaking_queue")
      .delete()
      .eq("user_id", opponent.user_id)
      .select();
    if (deleted && deleted.length > 0) {
      await admin.from("matchmaking_queue").delete().eq("user_id", user.id);
      const whiteFirst = Math.random() < 0.5;
      const white_id = whiteFirst ? user.id : opponent.user_id;
      const black_id = whiteFirst ? opponent.user_id : user.id;
      const { data: newGame, error } = await admin
        .from("games")
        .insert({
          white_id,
          black_id,
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
        })
        .select()
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ matched: true, game_id: newGame.id });
    }
  }

  await admin.from("matchmaking_queue").upsert({
    user_id: user.id,
    time_control: timeControl,
    base,
    increment,
    rating,
    created_at: new Date().toISOString(),
  });

  return json({ waiting: true });
});
